# plant-picker

Pick plants from a Google Sheet: filter and sort a plant list (one plant per row) and keep the result as a link.
Served by GitHub Pages at <https://chaotx.github.io/plant-picker/>.

plant-picker is [row-picker](https://github.com/ChaotX/row-picker) with plant settings: everything — filters,
counts, links, short links, Google access — comes from row-picker; this repository only holds

```
index.html     loads row-picker v1.0.0 from jsDelivr and starts it with config.js
config.js      name, icon, Hungarian sorting, texts, browser storage and short-link spreadsheet names, Google ids
favicon.svg
tools/serve.mjs
```

How to use the page, the link format and the Google Cloud setup are in
[row-picker's README](https://github.com/ChaotX/row-picker#readme).

## Moving to a new row-picker version

1. Release row-picker: tag it (`git tag v1.1.0 && git push origin v1.1.0`).
2. Change `@v1.0.0` in the import map of [index.html](index.html) (and the link in [config.js](config.js)).

## Running locally

```sh
node tools/serve.mjs                             # row-picker from jsDelivr (the version in index.html)
node tools/serve.mjs --row-picker ../row-picker  # row-picker from a local folder, to try changes to both
```

(or `npm run serve` / `npm run serve:local`; in PowerShell `npm.cmd …`). Open <http://localhost:8000>.

Links (`?q=…`, `?l=…`), the sign-in, recent sheets and the `plant-picker links` spreadsheet of short links work as
before the move to row-picker: `storagePrefix` and `linksTitle` keep the old names.
