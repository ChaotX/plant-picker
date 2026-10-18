# plant-picker

Filter and sort a big Google Sheet (one plant per row) and keep the result as a link. Build the query with a few
clicks — filters combined with AND / OR, each one can be inverted, sort keys, visible columns — and watch the
matching rows update below. The link always runs on the sheet's **current** content; if the sheet changes, filters
that no longer fit are skipped with a warning instead of breaking the link.

It is a static web app (plain JavaScript ES modules, no build step, no dependencies), hosted on GitHub Pages like
[PlanTape](https://github.com/ChaotX/plantape), whose Google sign-in, Picker and Sheets code it reuses.

## Using it

1. **Choose a spreadsheet:** paste its link (a `#gid=…` in it picks the tab), choose it in Google Drive, or open a
   recent one. Then pick the tab in the top bar (the last one used, else the largest).
2. **Add filters.** Each filter card: column → filter type → values. The type is guessed from the column's values:

   | Column holds | Example | Filter offered first |
   |---|---|---|
   | one value or yes/no | `●`, `Igen` | **has a value / is empty** |
   | numbers or ranges | `15–20`, `1,5–2`, `995 Ft` | **between** min … max (*overlaps* or *lies within*) |
   | a few distinct values | `Lombhullató cserje` | **is one of** (checkboxes with counts) |
   | scale values joined by dashes | `Napos–félárnyék` | **is one of** + *Match parts of ranges* (counts for Napos and Félárnyék) |
   | comma-separated lists | `Sövény, szoliter` | **includes** any / all of the items |
   | anything else | free text | **text matches**: contains, is exactly, wildcard (`Acer*`), regular expression |

   Any other type can be picked from the type menu. **Exclude** keeps the rows a filter does *not* match. The top
   line chooses whether *all* or *any* of the filters must match; a **Group** combines its filters the other way
   (e.g. "any of" inside "all of"). The green badge on a card says how many rows that filter lets through alone.
3. **Sort** by one or more columns (ranges by their lower or upper end), or click a column header. **Columns shown**
   picks the table columns (automatic: the first two plus the filtered / sorted ones). Click a row for all its fields.
4. **Keep it:** the address bar always holds the whole query (`?q=…`); **Copy link** copies it. **Short link** saves
   it in your Drive and copies `…/?l=abc234` (see below).

When nothing matches, the page says so and lists each filter with the number of rows it lets through alone and the
number you'd get without it, with a button to remove it.

### When the sheet changes

| Change | What happens |
|---|---|
| column renamed only in case / accents / spacing | used anyway, with a note |
| column removed or renamed | filter skipped (neither hides nor adds rows), with a one-click "Use *closest column*" |
| a chosen value no longer occurs | warning; the other values still filter (none left → nothing matches, said so) |
| a numeric column turned into text | warning with the share still numeric; non-numbers don't match |
| invalid regular expression | filter skipped |
| sort / shown column missing | dropped, with a note |
| tab renamed | found by its id (gid); tab deleted → choose another tab |
| spreadsheet deleted / no access | error page saying which, with the next step |

## Access and sign-in

Reading tries, in order:

1. **Sheets API with the API key** — no sign-in; works for sheets shared as *anyone with the link*. Gives numbers
   unformatted (exact).
2. **The public export** (`htmlview` + CSV) — no key at all; also only for link-shared sheets. Values as shown.
3. **Google sign-in** (scope `drive.file`) — private sheets. The app only sees spreadsheets you chose in the Drive
   Picker (or it created), so a private sheet is chosen once with **Choose it in Google Drive**.

The access token is kept in `localStorage`: reloads and new tabs within its hour need nothing; after that one click
(**Continue with Google**) gets a new one without any consent screen. A static page can't refresh tokens silently
(that needs a backend holding a refresh token — e.g. a small Cloudflare Worker; all token handling is behind
`getToken()` in [js/google-auth.js](js/google-auth.js), so one could be added later).

### Short links

`?l=<id>` links are stored in a spreadsheet named **`plant-picker links`** in *your* Drive (created on the first
save; columns `id`, `name`, `query`, `created`, `updated`). It is never shared, so it doesn't leak which
spreadsheets your filters point to — but it also means a short link opens only for you (signed in). Opened from a
short link, **Update** makes the link open the query as it is now; **Save as new** makes another one. **Saved ▾**
lists them. To give a filter to someone else, use the full **Copy link**.

## Running locally

```sh
node tools/serve.mjs   # or: npm run serve (in PowerShell: npm.cmd run serve)
node --test "tests/*.test.js"   # or: npm test — profiling, query, validation, link codec, CSV (Node ≥ 20)
```

Open <http://localhost:8000> and **Open the example plant sheet**.

## Google Cloud setup

The values in [js/config.js](js/config.js) are PlanTape's Google Cloud project (same `chaotx.github.io` origin).
Link-shared sheets work without any of this (step 2 above); sign-in needs it.

1. **APIs & Services → Library:** Google Sheets API, Google Drive API and Google Picker API enabled (done for
   PlanTape).
2. **Credentials → API key → API restrictions:** add **Google Sheets API** next to Google Picker API. Until then
   the key path is skipped (a console warning says so) and the public export is used.
3. **Credentials → OAuth client → Authorized JavaScript origins:** `https://chaotx.github.io` and
   `http://localhost:8000` (done for PlanTape).
4. The consent screen shows the project's app name (PlanTape). For a separate name, create a new project or OAuth
   client and put its values in `js/config.js`.

## Link format

`?q=` is `z` + base64url(deflate-raw(JSON)) (`j` + base64url(JSON) without CompressionStream):

```js
{ v: 1, s: '<spreadsheet id>', g: <tab gid>, t: '<tab title>',
  q: { op: 'and' | 'or', items: [filter | group] },   // group = { op, items, not }
  o: [{ c: '<column>', d: 'desc', by: 'max' }],         // sort keys
  cols: ['<column>', …] }                               // shown columns (absent = automatic)
filter = { c: '<column header>', k: 'in' | 'has' | 'range' | 'flag' | 'text', not, …
           v: [values], parts, all, min, max, how: 'within', set: false, m: 'equals' | 'wildcard' | 'regex', x, cs }
```

Columns are referenced by header name (so reordering columns doesn't matter), the tab by gid, then title.

## Project layout

```
index.html, style.css     UI shell (light / dark, phone layout with result cards)
js/app.js                 boot, screens, loading, URL sync, sharing, saved filters
js/profile.js             column kinds, number / range / list parsing, table building
js/query.js               query model, validation against the current columns, evaluation, sorting
js/codec.js               query ⇄ URL
js/data.js                key → public export → token access, error codes
js/public-sheet.js        htmlview tab list, CSV export
js/shortlinks.js          the private 'plant-picker links' spreadsheet
js/sheets-api.js, google-auth.js, picker.js, util.js, i18n.js   from PlanTape
js/ui/builder.js, results.js, start.js, dom.js
i18n/en.js, i18n/hu.js    UI strings (sheet content is never translated); language follows the system, switch kept
tests/                    node --test suites; fixtures/plants-sample.js = 40 rows of the example sheet
```

## Ideas

- Arbitrary nesting of groups in the UI (the query model and engine already support it).
- Ordered scales (Napos < Napos–félárnyék < Félárnyék …) so "at least half shade" can be asked.
- The month columns (`Jan` … `Dec`) as one "flowers in" filter.
