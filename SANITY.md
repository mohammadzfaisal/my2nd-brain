# Sanity Configuration (MY2ND-BRAIN)

This doc summarizes the Sanity Studio setup and how it connects to the Hugo site.

## Studio configuration

- Config file: `studio/sanity.config.ts`
- Project ID and dataset are set in the config (and should match `hugo.toml` and `.env`).
- Vision tool is enabled for GROQ queries.
- Schema types are loaded from `studio/schemas/index.ts`.

### Vision tool

- Package: `@sanity/vision` (installed in `studio/package.json`).
- Enabled by adding the plugin in `studio/sanity.config.ts`:
  - `plugins: [visionTool(), ...]`
- Result: the Vision tab appears in Studio so you can run GROQ queries.

## Schemas

- Note schema: `studio/schemas/note.js`
  - Fields: title, slug, body (Portable Text), tags, references, category, isFeatured.
  - Body supports: headings, lists, blockquotes, inline marks, links, images, code blocks.

- Schema index: `studio/schemas/index.ts`
  - Exports `note` and `postType` (if present).

## Data fetching (Sanity → Hugo)

- Script: `scripts/fetch-sanity-data.js`
  - Fetches all `note` documents via GROQ.
  - Writes JSON to `data/sanity/notes.json`.
  - Generates Markdown for each note in `content/notes/<slug>.md`.
  - Images: resolves `asset->url` and renders Markdown `![alt](url)` entries.

## Environment and IDs

- `.env`
  - `SANITY_PROJECT_ID`
  - `SANITY_DATASET` (default `production`)
- `hugo.toml`
  - `sanityProjectId` must match the Studio project ID.
- `studio/sanity.config.ts`
  - `projectId` and `dataset` must match the above.

## Integrating Sanity with the site (end-to-end)

These are the required pieces for a fully functional Sanity → Hugo pipeline:

### 1. Sanity Studio

- Studio config: `studio/sanity.config.ts`
  - Sets `projectId`, `dataset`, and `apiVersion`.
  - Registers schemas and plugins (Vision).
- Schema definition: `studio/schemas/note.js`
  - Defines the fields used by the site.
  - New fields must be published and fetched to show on the site.

### 2. Data fetch pipeline

- Fetch script: `scripts/fetch-sanity-data.js`
  - Uses GROQ to pull notes from Sanity.
  - Writes `data/sanity/notes.json` for list pages.
  - Generates Markdown in `content/notes/<slug>.md` so Hugo can render note pages.

### 3. Hugo templates and data sources

- Home and list templates:
  - `layouts/index.html` uses `data/sanity/notes.json` for recent notes.
  - `layouts/_default/list.html` uses the generated Markdown pages for `/notes/`.
- Favorites and Archive:
  - `layouts/favorites/list.html` filters by `Params.isFavorite`.
  - `layouts/archive/list.html` filters by `Params.status`.
- Single note:
  - `layouts/_default/single.html` renders individual note pages.

### 4. Static site build

- Run `npm run fetch-sanity` before `hugo server` or `hugo build`.
- Commit the generated `content/notes/*.md` and `data/sanity/*.json` if you deploy from Git.

### 5. Minimum checklist

- Sanity Studio runs locally (`npx sanity dev`).
- Project ID and dataset match in `.env`, `hugo.toml`, and `studio/sanity.config.ts`.
- Notes are published in Sanity.
- Fetch script runs without errors.
- Hugo pages render notes and list pages.

## Local workflow

1. Start Studio:
   - `cd studio`
   - `npm install`
   - `npx sanity dev`
2. Add or edit notes, then Publish.
3. Fetch data into Hugo:
   - From repo root: `npm run fetch-sanity`
4. Run Hugo:
   - `hugo server -D`

## Publish from Sanity (quick checklist)

1. Edit or create a note in Sanity Studio, then Publish.
2. Run `npm run fetch-sanity` in the repo root.
3. Commit + push to deploy on Vercel.

## Notes about unpublishing

- Unpublishing removes notes from Sanity,
  but the generated Markdown file in `content/notes/` remains.
- Delete the stale Markdown file if you want it removed from the site,
  or ask to add auto-cleanup to the fetch script.

## Troubleshooting

- No notes show up:
  - Verify project ID/dataset match in `.env`, `hugo.toml`, and `studio/sanity.config.ts`.
  - Ensure notes are published in Studio.
  - Re-run `npm run fetch-sanity`.
- Images not showing:
  - Make sure images are added inside the body field.
  - Re-run `npm run fetch-sanity` to regenerate Markdown.
