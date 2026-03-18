# sturla22.github.io

This repository generates [sturla22.github.io](http://sturla22.github.io).

## Golf tracker

The golf tracker page lives at [`golf.md`](/home/sturlalange/Dev/sturla22.github.io/golf.md) and is still published through Jekyll includes, but its JavaScript is now split into focused assets under [`assets/js/`](/home/sturlalange/Dev/sturla22.github.io/assets/js):

- [`golf-core.js`](/home/sturlalange/Dev/sturla22.github.io/assets/js/golf-core.js): shared SG math, settings defaults, and example-data builders
- [`golf-selectors.js`](/home/sturlalange/Dev/sturla22.github.io/assets/js/golf-selectors.js): centralized DOM ids/selectors
- [`golf-storage.js`](/home/sturlalange/Dev/sturla22.github.io/assets/js/golf-storage.js): localStorage load/save helpers and import id normalization
- [`golf-domain.js`](/home/sturlalange/Dev/sturla22.github.io/assets/js/golf-domain.js): hole scoring, round totals, stats aggregation, target-HCP comparison
- [`golf-render.js`](/home/sturlalange/Dev/sturla22.github.io/assets/js/golf-render.js): HTML/string render helpers
- [`golf-controller.js`](/home/sturlalange/Dev/sturla22.github.io/assets/js/golf-controller.js): page orchestration and browser-global handlers

The page markup and styling still enter through:

- [`_includes/golf/tracker.html`](/home/sturlalange/Dev/sturla22.github.io/_includes/golf/tracker.html)
- [`_includes/golf/styles.html`](/home/sturlalange/Dev/sturla22.github.io/_includes/golf/styles.html)
- [`_includes/golf/script.html`](/home/sturlalange/Dev/sturla22.github.io/_includes/golf/script.html)

Example import data is checked in at [`assets/data/golf-example-data.json`](/home/sturlalange/Dev/sturla22.github.io/assets/data/golf-example-data.json).

## Tests

```bash
npm run test:unit
npm run test:e2e
npm test
```

Playwright starts Jekyll automatically through [`playwright.config.js`](/home/sturlalange/Dev/sturla22.github.io/playwright.config.js).
