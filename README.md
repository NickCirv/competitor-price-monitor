![Nicholas Ashkar — competitor-price-monitor](assets/nicholas-ashkar/banner.png)

# competitor-price-monitor

Collects configured product prices and compares them with saved observations.



<a id="usage"></a>

<a id="run-a-price-check-against-your-product-list"></a>

## What it does

- Amazon, Shopify and selector-based inputs.
- Saved price history.
- Change detection.
- Markdown reporting and optional Slack alerts.


<a id="install"></a>

## Quickstart

Prerequisites: Node.js `>=20` and npm. The checkout below pins the source used for this documentation.

```sh
git clone https://github.com/NickCirv/competitor-price-monitor.git
cd competitor-price-monitor
git checkout eca3946d49c78c52a4f762bfe02c992ef2c01b38
npm install
```

In the cloned directory:

Create `products.json` with a product endpoint you are authorized to query. This shape is illustrative; replace the example URL:

```json
{"products":[{"type":"shopify","url":"https://store.example/products/item"}]}
```

```sh
node src/index.js --config products.json
```

**Expected behavior (illustrative, not captured):** With a valid product config and required credentials, generates price observations and a change report.

Examples are source-inspected, **not runtime-tested**. See the research record for verification gaps.

## Boundaries and data

Amazon/generic capture uses Apify; optional alerts use SLACK_WEBHOOK. Shopify uses the first variant and defaults currency to USD, so prices are not normalized across markets. The script itself does not provide a scheduler.

## Development

The manifest defines `npm test` as:

```sh
node --test
```

The captured suite is a smoke check, not end-to-end behavior coverage. Examples include “entry is valid JavaScript”. Tests were not run for this documentation revision.

See [implementation and command reference](docs/REFERENCE.md) for the package scripts and inspected interfaces, and [research record](docs/RESEARCH.md) for the pinned source, document decisions and unresolved checks.

## License and contact

See [LICENSE](LICENSE) for the original terms and attribution. Legal text is unchanged.

[Nicholas Ashkar](https://nicholashkar.com/) · [Discuss a project](https://nicholashkar.com/#oxblood-contact)
