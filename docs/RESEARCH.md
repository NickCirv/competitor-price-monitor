# competitor-price-monitor — documentation research

Reviewed 21 September 2026. Public GitHub source only.

## Revision and scope

- Commit: [`eca3946d49c78c52a4f762bfe02c992ef2c01b38`](https://github.com/NickCirv/competitor-price-monitor/commit/eca3946d49c78c52a4f762bfe02c992ef2c01b38).
- Tree: `8b9806dfe195a618b86b772fcd1aa350291ab43c`; truncated: `false`.
- Capture: 7 of 7 eligible text files; all eligible text files.
- Method: package and entrypoint inspection, implementation-interface review, targeted behavior/limitation inspection, and test-source review. This is not an exhaustive correctness or security audit.
- Commands run against repository code: **none**. External services, deployment and npm publication were not verified.

## Claim and evidence map

| Documentation claim | Pinned evidence | Assessment |
| --- | --- | --- |
| Runtime, executable and development commands | [package.json](https://github.com/NickCirv/competitor-price-monitor/blob/eca3946d49c78c52a4f762bfe02c992ef2c01b38/package.json) | Source declaration inspected; runtime unverified |
| Collects configured product prices and compares them with saved observations. | [src/index.js](https://github.com/NickCirv/competitor-price-monitor/blob/eca3946d49c78c52a4f762bfe02c992ef2c01b38/src/index.js) | Implementation interfaces inspected; behavior not executed |
| Amazon, Shopify and selector-based inputs; saved price history; change detection; Markdown reporting and optional Slack alerts. | [src/index.js](https://github.com/NickCirv/competitor-price-monitor/blob/eca3946d49c78c52a4f762bfe02c992ef2c01b38/src/index.js) | Source-backed scope, not a test result |
| Amazon/generic capture uses Apify; optional alerts use SLACK_WEBHOOK. Shopify uses the first variant and defaults currency to USD, so prices are not normalized across markets. The script itself does not provide a scheduler. | [src/index.js](https://github.com/NickCirv/competitor-price-monitor/blob/eca3946d49c78c52a4f762bfe02c992ef2c01b38/src/index.js) | Material limits documented; service compatibility remains open |
| Existing checks | [test/smoke.test.js](https://github.com/NickCirv/competitor-price-monitor/blob/eca3946d49c78c52a4f762bfe02c992ef2c01b38/test/smoke.test.js) | Test source read; no passing-run claim |

## Documentation inventory and disposition

| Existing document | Decision |
| --- | --- |
| [README.md](https://github.com/NickCirv/competitor-price-monitor/blob/eca3946d49c78c52a4f762bfe02c992ef2c01b38/README.md) | Rewritten with source-specific purpose, direct checkout setup, limitations and verification status. Old section fragments retained where practical. |

Added `docs/REFERENCE.md` for the observed implementation and command surface, and this research record. Protected license and attribution files remain in their original locations without edits. No source or product UI was changed.

## Quality dimensions

| Dimension | Status | Evidence / next step |
| --- | --- | --- |
| Pinned provenance | Verified | Captured commit, tree and per-file hashes recorded below |
| Interface documentation | Partially verified | Source inspection only; run clean-checkout quickstart |
| Runtime behavior | Unverified | No repository execution in this review |
| Test results | Unverified | Existing tests were not run |
| Deployment / package availability | Unverified | No remote publish or live-service check |
| Visual / link checks | Unverified | Portfolio renderer and independent QA are separate from this authoring step |

## Unresolved issues

Amazon/generic capture uses Apify; optional alerts use SLACK_WEBHOOK. Shopify uses the first variant and defaults currency to USD, so prices are not normalized across markets. The script itself does not provide a scheduler.

## Captured source inventory

This lists captured provenance, not a claim that every line received a full audit. Binary/generated/excluded files are outside the eligible text capture.

| File | SHA-256 | Bytes |
| --- | --- | --- |
| [LICENSE](https://github.com/NickCirv/competitor-price-monitor/blob/eca3946d49c78c52a4f762bfe02c992ef2c01b38/LICENSE) | `68729cab364d82364078b08d8580ccfa51dc69c81a7d64e8d8d47a1da6c9349d` | 1072 |
| [README.md](https://github.com/NickCirv/competitor-price-monitor/blob/eca3946d49c78c52a4f762bfe02c992ef2c01b38/README.md) | `51a45dc5abb910e8d5ccb0471f1ad556b45eef315fc083202910c5114aee2a09` | 1741 |
| [package.json](https://github.com/NickCirv/competitor-price-monitor/blob/eca3946d49c78c52a4f762bfe02c992ef2c01b38/package.json) | `f0389870dfae93baa3e63c87631c9aafc80620e675f56680a75eafe8ae3d99a3` | 580 |
| [.github/workflows/ci.yml](https://github.com/NickCirv/competitor-price-monitor/blob/eca3946d49c78c52a4f762bfe02c992ef2c01b38/.github/workflows/ci.yml) | `e818f4e6bd805f798665dbbf04964d02f12fc59dd7f18903ad63d26d374ae3f0` | 380 |
| [render.yaml](https://github.com/NickCirv/competitor-price-monitor/blob/eca3946d49c78c52a4f762bfe02c992ef2c01b38/render.yaml) | `0dd0d9c9e8b052c489624a532b37277526fc1ceb9fc1443db88eb18959ce1ef0` | 415 |
| [src/index.js](https://github.com/NickCirv/competitor-price-monitor/blob/eca3946d49c78c52a4f762bfe02c992ef2c01b38/src/index.js) | `5fa9182d3ccf18b7eb74f253ce00a2ab283ecf7113a4009908523f7aa5f9aa52` | 12748 |
| [test/smoke.test.js](https://github.com/NickCirv/competitor-price-monitor/blob/eca3946d49c78c52a4f762bfe02c992ef2c01b38/test/smoke.test.js) | `bdefa1af6a07c254a27a8a0dbdb5875b14311e72ef9884a0ef2807a94f415a3b` | 250 |
