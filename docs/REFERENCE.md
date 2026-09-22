# competitor-price-monitor — implementation reference

Source revision: `eca3946d49c78c52a4f762bfe02c992ef2c01b38`. This reference records source declarations; it is not a transcript of a successful run.

## Entrypoint and runtime

[package.json](https://github.com/NickCirv/competitor-price-monitor/blob/eca3946d49c78c52a4f762bfe02c992ef2c01b38/package.json) declares `src/index.js`. Node.js `>=20` and npm.

## Supported workflow

Amazon, Shopify and selector-based inputs; saved price history; change detection; Markdown reporting and optional Slack alerts.

Amazon/generic capture uses Apify; optional alerts use SLACK_WEBHOOK. Shopify uses the first variant and defaults currency to USD, so prices are not normalized across markets. The script itself does not provide a scheduler.

## Command reference

The commands below use the installed executable name. From the pinned checkout, replace it with the `node` entrypoint shown above. Options and command branches were cross-checked against captured source; examples are not execution transcripts.

| Flag | Description |
|------|-------------|
| `--config <path>` | Path to products JSON file (default: `products.json`) |

## Package scripts

| Script | Exact command |
| --- | --- |
| `start` | `node src/index.js` |
| `check` | `node src/index.js --config products.json` |
| `test` | `node --test` |

## Environment references

The implementation reads `APIFY_TOKEN`, `SLACK_WEBHOOK`. Some are optional or mode-specific; inspect their call sites before configuring a service. Credentials and endpoint values are never supplied by this document.

## Implementation sources

[src/index.js](https://github.com/NickCirv/competitor-price-monitor/blob/eca3946d49c78c52a4f762bfe02c992ef2c01b38/src/index.js).

## Verification boundary

No repository code, tests, network operation, hook installer or migration was executed for this review. Source inspection supports the documented interface; runtime correctness and external-service compatibility remain unverified.
