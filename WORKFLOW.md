# Workflow (Local -> Vercel)

This is the end-to-end workflow for the Sanity-powered site.

## 1) Create/edit content in Sanity

- Start Studio:
  - `cd studio`
  - `npx sanity dev`
- Open `http://localhost:3333` to add/edit notes, then **Publish**.

## 2) Pull content into the repo

- From repo root: `npm run fetch-sanity`
- This updates:
  - `content/notes/*.md`
  - `data/sanity/*.json`

## 3) Test locally

- `hugo server -D`
- Visit `http://localhost:1313`

## 4) Commit + push

```bash
git add content/notes data/sanity
git commit -m "Update notes"
git push
```

## 5) Vercel deploy

- Vercel auto-builds on push.
- Build command: `npm run fetch-sanity && npx hugo`
- Output directory: `public`

## Required Vercel environment variables

- `SANITY_PROJECT_ID=mvggkjnh`
- `SANITY_DATASET=production`
- Optional: `SANITY_TOKEN` (only needed for private datasets)

## Local troubleshooting (Windows)

- If `npx hugo` fails, run `npm install` first.
- If it still fails, use `.\node_modules\.bin\hugo.exe`.
