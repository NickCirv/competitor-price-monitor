<div align="center">

# competitor-price-monitor

**Track Amazon, Shopify, and custom product pages — get Slack alerts the moment a competitor changes their price.**

[![License: MIT](https://img.shields.io/badge/License-MIT-0B0A09?style=flat-square&logo=opensourceinitiative&logoColor=white)](LICENSE)
[![Node](https://img.shields.io/badge/Node-18%2B-0B0A09?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)

</div>

## Install

```bash
git clone https://github.com/NickCirv/competitor-price-monitor.git
cd competitor-price-monitor
npm install
cp .env.example .env   # add APIFY_TOKEN and SLACK_WEBHOOK
```

## Usage

```bash
# Run a price check against your product list
node src/index.js --config products.json
```

**products.json** format:

```json
{
  "products": [
    { "type": "amazon",  "asin": "B0XXXXXX",                          "name": "Rival Product" },
    { "type": "shopify", "url": "https://store.example.com/products/item" },
    { "type": "generic", "url": "https://site.example.com/product",    "priceSelector": ".price" }
  ]
}
```

| Flag | Description |
|------|-------------|
| `--config <path>` | Path to products JSON file (default: `products.json`) |

## What it does

Reads a list of product URLs, scrapes current prices via Apify (Amazon, Shopify, or any site with a CSS price selector), and compares against the last saved snapshot. When a price or stock status changes, it sends a Slack block-kit alert and saves a Markdown report to `reports/`. History is persisted in `data/price_history.json` so every subsequent run only reports net-new changes.

---

<sub>Dependencies: apify-client, axios, dotenv · Node 18+ · MIT · by <a href="https://github.com/NickCirv">NickCirv</a></sub>
