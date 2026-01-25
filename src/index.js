#!/usr/bin/env node
/**
 * Competitor Price Monitor
 *
 * Automated pipeline that:
 * 1. Tracks product prices across Amazon, Shopify, and custom URLs
 * 2. Detects price changes
 * 3. Sends alerts via Slack/Email
 *
 * Usage: node index.js --config products.json
 */

const { ApifyClient } = require('apify-client');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const APIFY_TOKEN = process.env.APIFY_TOKEN;
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK;

// Initialize Apify client
const apifyClient = new ApifyClient({ token: APIFY_TOKEN });

/**
 * Scrape Amazon product
 */
async function scrapeAmazon(asin, country = 'US') {
    console.log(`   🛒 Amazon: ${asin}`);

    const input = {
        asins: [{ asin, country }],
        scrapeProductVariantPrices: false,
        maxOfferPages: 1
    };

    try {
        const run = await apifyClient.actor('junglee/amazon-scraper').call(input, { timeout: 120 });
        const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

        if (items.length > 0) {
            const product = items[0];
            return {
                source: 'amazon',
                asin,
                title: product.title,
                price: product.price?.value || product.buyingPrice?.value,
                currency: product.price?.currency || 'USD',
                availability: product.inStock ? 'In Stock' : 'Out of Stock',
                rating: product.stars,
                reviews: product.reviewsCount,
                url: product.url,
                timestamp: new Date().toISOString()
            };
        }
        return null;
    } catch (error) {
        console.error(`   ❌ Amazon scrape failed:`, error.message);
        return { source: 'amazon', asin, error: error.message };
    }
}

/**
 * Scrape Shopify product
 */
async function scrapeShopify(url) {
    console.log(`   🛍️ Shopify: ${new URL(url).hostname}`);

    try {
        // Shopify products have a .json endpoint
        const jsonUrl = url.endsWith('.json') ? url : `${url.split('?')[0]}.json`;
        const response = await axios.get(jsonUrl, { timeout: 10000 });
        const product = response.data.product;

        const variant = product.variants[0];
        return {
            source: 'shopify',
            title: product.title,
            price: parseFloat(variant.price),
            compareAtPrice: variant.compare_at_price ? parseFloat(variant.compare_at_price) : null,
            currency: 'USD', // Default, would need store config for actual
            availability: variant.available ? 'In Stock' : 'Out of Stock',
            url,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error(`   ❌ Shopify scrape failed:`, error.message);
        return { source: 'shopify', url, error: error.message };
    }
}

/**
 * Scrape generic website (using Apify web scraper)
 */
async function scrapeGeneric(url, priceSelector) {
    console.log(`   🌐 Generic: ${new URL(url).hostname}`);

    const input = {
        startUrls: [{ url }],
        pageFunction: `async function pageFunction(context) {
            const { $, request } = context;
            const priceText = $('${priceSelector}').first().text();
            const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
            const title = $('h1').first().text().trim() || $('title').text().trim();
            return { url: request.url, title, price, priceText };
        }`,
        proxyConfiguration: { useApifyProxy: true }
    };

    try {
        const run = await apifyClient.actor('apify/web-scraper').call(input, { timeout: 60 });
        const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

        if (items.length > 0) {
            const result = items[0];
            return {
                source: 'generic',
                title: result.title,
                price: result.price,
                url,
                timestamp: new Date().toISOString()
            };
        }
        return null;
    } catch (error) {
        console.error(`   ❌ Generic scrape failed:`, error.message);
        return { source: 'generic', url, error: error.message };
    }
}

/**
 * Load previous prices
 */
async function loadPriceHistory() {
    const historyPath = path.join(__dirname, '..', 'data', 'price_history.json');

    try {
        const data = await fs.readFile(historyPath, 'utf8');
        return JSON.parse(data);
    } catch {
        return { products: {}, lastCheck: null };
    }
}

/**
 * Save price history
 */
async function savePriceHistory(history) {
    const dataDir = path.join(__dirname, '..', 'data');
    await fs.mkdir(dataDir, { recursive: true });

    const historyPath = path.join(dataDir, 'price_history.json');
    await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
}

/**
 * Detect price changes
 */
function detectPriceChanges(currentPrices, previousPrices) {
    const changes = [];

    for (const [id, current] of Object.entries(currentPrices)) {
        const previous = previousPrices[id];

        if (!previous || !previous.price || !current.price) continue;

        if (current.price !== previous.price) {
            const change = current.price - previous.price;
            const changePercent = ((change / previous.price) * 100).toFixed(1);

            changes.push({
                id,
                title: current.title,
                oldPrice: previous.price,
                newPrice: current.price,
                change,
                changePercent: `${changePercent}%`,
                direction: change > 0 ? '📈 INCREASED' : '📉 DECREASED',
                url: current.url
            });
        }

        // Stock changes
        if (current.availability !== previous.availability) {
            changes.push({
                id,
                title: current.title,
                type: 'stock',
                oldStatus: previous.availability,
                newStatus: current.availability,
                direction: current.availability === 'In Stock' ? '✅ BACK IN STOCK' : '❌ OUT OF STOCK',
                url: current.url
            });
        }
    }

    return changes;
}

/**
 * Send Slack alert
 */
async function sendSlackAlert(changes) {
    if (!SLACK_WEBHOOK || changes.length === 0) return;

    const blocks = [
        {
            type: 'header',
            text: { type: 'plain_text', text: '🚨 Price Alert', emoji: true }
        }
    ];

    for (const change of changes.slice(0, 10)) { // Limit to 10
        if (change.type === 'stock') {
            blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `${change.direction}\n*${change.title}*\n<${change.url}|View Product>`
                }
            });
        } else {
            blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `${change.direction} *${change.changePercent}*\n*${change.title}*\n$${change.oldPrice} → $${change.newPrice}\n<${change.url}|View Product>`
                }
            });
        }
    }

    try {
        await axios.post(SLACK_WEBHOOK, { blocks });
        console.log('📤 Slack alert sent');
    } catch (error) {
        console.error('❌ Slack alert failed:', error.message);
    }
}

/**
 * Generate report
 */
async function generateReport(prices, changes) {
    const timestamp = new Date().toISOString().split('T')[0];
    const outputDir = path.join(__dirname, '..', 'reports');
    await fs.mkdir(outputDir, { recursive: true });

    let report = `# Price Monitor Report\n`;
    report += `**Date:** ${timestamp}\n\n`;

    if (changes.length > 0) {
        report += `## 🚨 Price Changes\n\n`;
        report += `| Product | Old | New | Change |\n`;
        report += `|---------|-----|-----|--------|\n`;
        for (const c of changes) {
            if (c.type === 'stock') {
                report += `| ${c.title} | ${c.oldStatus} | ${c.newStatus} | ${c.direction} |\n`;
            } else {
                report += `| ${c.title} | $${c.oldPrice} | $${c.newPrice} | ${c.direction} ${c.changePercent} |\n`;
            }
        }
        report += `\n`;
    }

    report += `## Current Prices\n\n`;
    report += `| Product | Price | Availability | Source |\n`;
    report += `|---------|-------|--------------|--------|\n`;
    for (const [id, p] of Object.entries(prices)) {
        report += `| ${p.title || id} | $${p.price || 'N/A'} | ${p.availability || 'Unknown'} | ${p.source} |\n`;
    }

    const reportPath = path.join(outputDir, `prices-${timestamp}.md`);
    await fs.writeFile(reportPath, report);

    console.log(`\n📁 Report saved: ${reportPath}`);
    return reportPath;
}

/**
 * Load product configuration
 */
async function loadConfig(configPath) {
    try {
        const data = await fs.readFile(configPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Could not load config:', error.message);
        return null;
    }
}

/**
 * Main execution
 */
async function main() {
    const args = process.argv.slice(2);

    // Parse config path
    let configPath = path.join(__dirname, '..', 'products.json');
    const configIndex = args.indexOf('--config');
    if (configIndex !== -1 && args[configIndex + 1]) {
        configPath = args[configIndex + 1];
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('  COMPETITOR PRICE MONITOR');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  Config: ${configPath}`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Load config
    const config = await loadConfig(configPath);
    if (!config) {
        console.log('\nCreate a products.json file with your tracked products:');
        console.log(`
{
  "products": [
    { "type": "amazon", "asin": "B0XXXXXX", "name": "Competitor Product 1" },
    { "type": "shopify", "url": "https://store.com/products/item" },
    { "type": "generic", "url": "https://site.com/product", "priceSelector": ".price" }
  ]
}
        `);
        process.exit(1);
    }

    // Load history
    const history = await loadPriceHistory();
    const previousPrices = history.products;

    // Scrape all products
    console.log('🔍 Checking prices...\n');
    const currentPrices = {};

    for (const product of config.products) {
        let result = null;
        const id = product.asin || product.url || product.name;

        if (product.type === 'amazon') {
            result = await scrapeAmazon(product.asin, product.country);
        } else if (product.type === 'shopify') {
            result = await scrapeShopify(product.url);
        } else if (product.type === 'generic') {
            result = await scrapeGeneric(product.url, product.priceSelector);
        }

        if (result && !result.error) {
            currentPrices[id] = result;
            const price = result.price ? `$${result.price}` : 'N/A';
            console.log(`      → ${price} (${result.availability || 'Unknown'})`);
        }
    }

    // Detect changes
    const changes = detectPriceChanges(currentPrices, previousPrices);

    // Update history
    history.products = currentPrices;
    history.lastCheck = new Date().toISOString();
    await savePriceHistory(history);

    // Generate report
    await generateReport(currentPrices, changes);

    // Send alerts
    if (changes.length > 0) {
        console.log(`\n🚨 ${changes.length} price changes detected!`);
        for (const c of changes) {
            if (c.type === 'stock') {
                console.log(`   ${c.direction}: ${c.title}`);
            } else {
                console.log(`   ${c.direction}: ${c.title} ($${c.oldPrice} → $${c.newPrice})`);
            }
        }
        await sendSlackAlert(changes);
    } else {
        console.log('\n✅ No price changes detected');
    }

    console.log('\n✅ Price check complete!');
}

// Export for programmatic use
module.exports = { scrapeAmazon, scrapeShopify, scrapeGeneric, detectPriceChanges };

// Run if called directly
if (require.main === module) {
    main();
}
