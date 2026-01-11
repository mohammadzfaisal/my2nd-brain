# MY 2ND BRAIN 🧠

A Knowledge Base Dashboard with a hand-drawn sketchnote aesthetic, built with Hugo, Sanity.io, and featuring Obsidian-style interlinking.

## Features

- ✨ **Sketchnote Aesthetic**: Hand-drawn wobbly borders, SVG filters, and organic visual style
- 🔗 **Obsidian-Style Linking**: Bidirectional note references and backlinks
- 🕸️ **Force-Directed Graph**: Visualize connections between notes with Cytoscape.js
- 🎨 **Hand-Drawn Illustrations**: OpenPeeps character avatars for categories
- ⚡ **Hybrid Data Fetching**: Build-time SSG + client-side live updates
- 📱 **Responsive Design**: Works beautifully on all devices

## Tech Stack

- **Static Site Generator**: [Hugo](https://gohugo.io/)
- **CMS**: [Sanity.io](https://www.sanity.io/) (Headless)
- **Graph Visualization**: [Cytoscape.js](https://js.cytoscape.org/)
- **Deployment**: [Vercel](https://vercel.com/)
- **Illustrations**: [OpenPeeps](https://www.openpeeps.com/)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Hugo Extended (latest version)
- Sanity CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd MY2ND-BRAIN
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize Sanity Studio**
   ```bash
   npm create sanity@latest -- --create-project "MY2ND-BRAIN" --dataset production --output-path ./studio
   ```

   Follow the prompts to:
   - Log in with Google, GitHub, or email
   - Create a new Sanity project
   - Note your **Project ID**

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Sanity Project ID:
   ```
   SANITY_PROJECT_ID=your-project-id-here
   SANITY_DATASET=production
   ```

5. **Update Hugo configuration**

   Edit `hugo.toml` and set:
   ```toml
   [params]
     sanityProjectId = "your-project-id-here"
   ```

6. **Copy schema files to Sanity Studio**

   The note schema is already created in `studio/schemas/`. If the Sanity init created a default config, replace it:

   Edit `studio/sanity.config.js` (or create it):
   ```javascript
   import {defineConfig} from 'sanity'
   import {deskTool} from 'sanity/desk'
   import {schemaTypes} from './schemas'

   export default defineConfig({
     name: 'default',
     title: 'MY 2ND BRAIN',
     projectId: 'your-project-id',
     dataset: 'production',
     plugins: [deskTool()],
     schema: {
       types: schemaTypes,
     },
   })
   ```

### Development

1. **Start Hugo development server**
   ```bash
   npm run dev
   ```

   Site will be available at `http://localhost:1313`

2. **Start Sanity Studio** (in a new terminal)
   ```bash
   npm run studio
   ```

   Studio will be available at `http://localhost:3333`

3. **Create your first note**
   - Open Sanity Studio at `http://localhost:3333`
   - Click "Note" → "Create new Note"
   - Add a title, content, tags, and references
   - Publish!

4. **Fetch Sanity data** (for build-time rendering)
   ```bash
   npm run fetch-sanity
   ```

### Building for Production

```bash
npm run build
```

This will:
1. Fetch all notes from Sanity
2. Build the Hugo site with minification
3. Build Sanity Studio
4. Copy Studio build to `public/studio/`

Output will be in the `public/` directory.

## Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will detect the configuration automatically

3. **Add Environment Variables**

   In Vercel dashboard → Project Settings → Environment Variables:
   ```
   SANITY_PROJECT_ID = your-project-id
   SANITY_DATASET = production
   SANITY_TOKEN = your-sanity-read-token (optional)
   ```

4. **Deploy!**

   Vercel will automatically build and deploy your site.

## Project Structure

```
MY2ND-BRAIN/
├── archetypes/          # Hugo content templates
├── assets/              # CSS and JavaScript
│   ├── css/            # Stylesheets (wobble effects, cards, graph)
│   └── js/             # Client-side scripts
├── content/             # Hugo content (notes)
├── data/                # Build-time data from Sanity
├── layouts/             # Hugo templates
│   ├── _default/       # Default templates
│   ├── partials/       # Reusable components
│   ├── shortcodes/     # Custom shortcodes
│   └── graph/          # Graph view template
├── static/              # Static assets
│   ├── images/peeps/   # OpenPeeps illustrations
│   └── fonts/          # Local fonts
├── studio/              # Sanity CMS
│   └── schemas/        # Sanity schemas
├── scripts/             # Build scripts
└── hugo.toml           # Hugo configuration
```

## Customization

### Visual Style

The sketchnote aesthetic is controlled by:
- `assets/css/main.css` - Core styles and color palette
- `assets/css/wobble.css` - Hand-drawn effects
- `layouts/partials/head.html` - SVG filter definitions

To adjust wobble intensity, edit the `scale` value in the SVG filter:
```html
<feDisplacementMap ... scale="2.5" />
```

### Color Palette

Edit CSS variables in `assets/css/main.css`:
```css
:root {
  --color-bg: #FFFFFF;
  --color-ink: #1A1A1A;
  --color-teal: #00B4D8;
  --color-orange: #FF9F1C;
  --color-red: #E63946;
}
```

### Graph Layout

Graph settings are in `assets/js/graph-view.js`:
```javascript
layout: {
  name: 'cose-bilkent',
  nodeRepulsion: 8000,
  idealEdgeLength: 100,
  // ... other options
}
```

## Adding OpenPeeps Illustrations

1. Visit [openpeeps.com](https://www.openpeeps.com/)
2. Download the SVG library (free for personal use)
3. Extract SVGs to `static/images/peeps/`
4. Update `assets/js/openpeeps.js` with actual filenames
5. Replace placeholder peeps in category cards

## License

This project is open source. OpenPeeps illustrations are licensed separately - check [their license](https://www.openpeeps.com/#license) for usage terms.

## Credits

- **Framework**: Hugo
- **CMS**: Sanity.io
- **Graph**: Cytoscape.js
- **Illustrations**: OpenPeeps by Pablo Stanley
- **Font**: Architects Daughter (Google Fonts)

---

**Built with ❤️ and a hand-drawn aesthetic**
