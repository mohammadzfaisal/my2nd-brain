# Quick Start Guide 🚀

Get your Knowledge Base up and running in 5 minutes!

## Step 1: Initialize Sanity Studio

**IMPORTANT**: You need to complete this step manually.

Open your terminal in this directory and run:

```bash
npm create sanity@latest -- --create-project "MY2ND-BRAIN" --dataset production --output-path ./studio
```

Follow the prompts:
1. Choose login method (Google, GitHub, or Email)
2. Authorize Sanity CLI
3. Wait for the project to be created
4. **Save your Project ID** - you'll need it!

## Step 2: Configure Your Project ID

After Sanity initialization, you'll see output like:
```
Success! Below are your project details:

Project ID: abc123xyz
Dataset: production
```

### A. Update `.env`

Copy the example file:
```bash
cp .env.example .env
```

Edit `.env` and add your Project ID:
```
SANITY_PROJECT_ID=abc123xyz
SANITY_DATASET=production
```

### B. Update `hugo.toml`

Edit [hugo.toml](hugo.toml) (line 9):
```toml
[params]
  sanityProjectId = "abc123xyz"  # ← Put your Project ID here
```

### C. Update `studio/sanity.config.js`

The Sanity init should have created `studio/sanity.config.js`. Update it to use our schema:

```javascript
import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {schemaTypes} from './schemas'

export default defineConfig({
  name: 'default',
  title: 'MY 2ND BRAIN',
  projectId: 'abc123xyz', // ← Your Project ID
  dataset: 'production',
  plugins: [deskTool()],
  schema: {
    types: schemaTypes,
  },
})
```

## Step 3: Start Development

### Terminal 1: Hugo Dev Server

```bash
npm run dev
```

Visit: **http://localhost:1313**

### Terminal 2: Sanity Studio

```bash
npm run studio
```

Visit: **http://localhost:3333**

## Step 4: Create Your First Note

1. Go to http://localhost:3333
2. Click **"Note"** in the sidebar
3. Click **"Create new Note"**
4. Fill in:
   - **Title**: "My First Note"
   - **Slug**: Click "Generate" (auto-fills from title)
   - **Body**: Add some content
   - **Tags**: Add tags like "test", "getting-started"
   - **Category**: Choose one (e.g., "Learning")
5. Click **"Publish"**

## Step 5: See Your Note on the Site

### Option A: Build-time (Recommended for testing)

```bash
npm run fetch-sanity
```

Refresh http://localhost:1313 - your note appears!

### Option B: Client-side (Live)

Just refresh the page - the JavaScript will fetch it automatically (if Sanity Project ID is configured).

## Step 6: Test the Graph View

1. Create 2-3 more notes in Sanity Studio
2. In one note, use **"References"** field to link to another note
3. Visit http://localhost:1313/graph/
4. See your notes visualized as a network!

## What's Next?

### Add OpenPeeps Illustrations

1. Download OpenPeeps from https://www.openpeeps.com/
2. Extract SVGs to `static/images/peeps/`
3. Update `assets/js/openpeeps.js` with actual filenames

### Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variable: `SANITY_PROJECT_ID`
4. Deploy!

See [README.md](README.md) for full documentation.

## Troubleshooting

### "No notes yet!" on homepage

- **Cause**: Sanity data not fetched
- **Fix**: Run `npm run fetch-sanity`

### Graph view shows error

- **Cause**: Sanity Project ID not configured
- **Fix**: Check `hugo.toml` and `.env` have correct Project ID

### Sanity Studio login issues

- **Cause**: Browser blocking cookies
- **Fix**: Allow cookies for sanity.io domains

### Build errors

- **Cause**: Missing dependencies
- **Fix**: Run `npm install` again

---

**Need help?** Check [README.md](README.md) for detailed documentation.
