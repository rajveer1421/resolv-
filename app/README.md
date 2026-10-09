# Resolv: entity resolution showcase

The showcase site for team The Epoch Warriors' Amazon ML Challenge 2026 entry. It finds every record of the same business across three sources and three countries (France, India and the US), including names in Indic scripts. The site is static: Vite, React, TypeScript, Tailwind CSS and React Router.

## Setup

Requires Node 22 or newer.

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # check-facts, type-check, production build into dist/
npm run preview      # serve dist/ on http://localhost:4173
npm run lint
```

## Where the numbers come from

Every number and model name on the site lives in `src/content/` as a `fact()` or `docText()`. Each one quotes `../The_Epoch_Warriors_submission/Documentation_template.md` and names the section it comes from. `npm run check-facts` runs before every build. It fails the build if a quote is missing from its section, doesn't parse to the stored value, or is approximate in the doc but not marked as approximate. `formatFact` never rounds up, with one exception: the public leaderboard 0.985978 may be shown as 0.986.

## How demo mode works

The trained models were not saved, so the site replays our real submission instead of running inference.

- `npm run demo-data` streams the submitted `candidate_pairs.tsv` and `matching_results.tsv` (ID lists only) together with the challenge inputs in `../../Resources/student_resource/dataset/`. Before writing anything, it re-measures the submitted files against the doc and stops if any number differs. It writes `public/demo/`:
  - `sample_source{1,2,3}.tsv`: a stratified sample of 1,000 test businesses per country and all their candidate records, in the challenge's input format.
  - `candidate_pairs.tsv` and `matching_results.tsv`: our submitted rows for those businesses.
  - `showcase.json`: the landing-page examples. India and US examples are train ground truth ("verified"); French examples are test predictions ("matched by our pipeline").
  - `manifest.json`: the seed, the sampling design and every check.
- "Load sample data" fetches the three sample files and runs them through the same parser and schema checks as an upload.
- Visitors' own files (CSV, TSV or XLSX) are parsed and validated in the browser, and nothing is uploaded. Pressing Refine then says plainly that live inference isn't connected and offers the sample data instead. `DemoResolver` also refuses `origin: 'upload'` input, so the rule holds in code as well as in the UI.
- Results carry a "Demo mode: precomputed results" badge.

Set `ER_DATA_DIR` or `ER_OUTPUT_DIR` if the data lives somewhere else. The script needs about 100 s on a free disk.

## Connecting a real backend

The UI talks only to the `Resolver` interface in `src/lib/resolver/types.ts`:

```ts
resolve(input: ResolverInput): ResolverRun   // { events: AsyncIterable<ResolverEvent>, skip(), cancel() }
```

`ResolverEvent` is `stage-start`, `progress` (with a counter key, value and total), `stage-end`, `done` (with the result) or `error`. To connect a backend:

1. Implement `src/lib/resolver/ApiResolver.ts`. POST the three sources to your server, read back a stream of `ResolverEvent` objects (server-sent events or NDJSON) and yield them. The `StageId` values are listed in `src/content/pipeline.ts`.
2. Set `liveInference = true` (already set on `ApiResolver`). The upload page then lets visitors' files through to the run.
3. Build with `VITE_RESOLVER=api VITE_API_URL=https://your-server npm run build`. Without these variables the build uses `DemoResolver`.

## Deploying

The output is a static single-page app in `dist/`. Every route needs to fall back to `index.html`.

- **Vercel:** import the repo and set the Root Directory to `Website/app`. The framework preset is Vite: build `npm run build`, output `dist`. `vercel.json` already contains the SPA rewrite. Keep "Include files outside the root directory" enabled, because the docs page and `check-facts` read `../The_Epoch_Warriors_submission/Documentation_template.md`.
- **Netlify:** set the base directory to `Website/app`, the build command to `npm run build` and the publish directory to `dist`. `public/_redirects` already contains the SPA fallback.

## Checks

`npm run smoke` (with `npm run preview` running) opens every route in the installed Chrome at 360, 768 and 1440 px. It fails on console errors, more than one `h1` per page, or horizontal overflow. It also runs the whole workspace flow: sample data, refine, skip, validator, preview, then all five download formats, each checked for content. Finally it checks that a visitor's own files stop at the honest notice. Screenshots go to `.checks/`.

## Known limits

- PDF exports hold at most 500 rows, and only rows written entirely in Latin script, because jsPDF's fonts can't display Indic scripts. The file says so. Word exports hold at most 500 rows. CSV, Excel and the challenge `.tsv` hold every row.
- Workspace results live in memory, so reloading the results page empties it.
- Uploads are parsed in the browser, up to 30 MB per file.
