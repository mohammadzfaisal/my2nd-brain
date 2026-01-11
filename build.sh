#!/bin/bash

# Build Script for MY 2ND BRAIN
# Handles both Sanity data fetching and Hugo build

set -e  # Exit on error

echo "🚀 Starting build process..."

# Step 1: Fetch data from Sanity
echo ""
echo "📡 Step 1: Fetching data from Sanity..."
if [ -f "scripts/fetch-sanity-data.js" ]; then
    node scripts/fetch-sanity-data.js
else
    echo "⚠️  Warning: fetch-sanity-data.js not found, skipping..."
fi

# Step 2: Build Hugo site
echo ""
echo "🏗️  Step 2: Building Hugo site..."
hugo --minify

# Step 3: Build Sanity Studio (if exists)
echo ""
echo "🎨 Step 3: Building Sanity Studio..."
if [ -d "studio" ]; then
    cd studio
    if [ -f "package.json" ]; then
        echo "   Installing Sanity Studio dependencies..."
        npm install --silent
        echo "   Building Sanity Studio..."
        npm run build
        cd ..

        # Copy Sanity Studio build to Hugo public directory
        echo "   Copying Sanity Studio to public/studio..."
        mkdir -p public/studio
        cp -r studio/dist/* public/studio/
    else
        echo "⚠️  Warning: studio/package.json not found, skipping Sanity build..."
        cd ..
    fi
else
    echo "⚠️  Warning: studio directory not found, skipping..."
fi

# Step 4: Create empty data file if none exists
echo ""
echo "📝 Step 4: Ensuring data files exist..."
mkdir -p data/sanity
if [ ! -f "data/sanity/notes.json" ]; then
    echo '{"notes": [], "fetchedAt": "", "totalCount": 0}' > data/sanity/notes.json
    echo "   Created empty data/sanity/notes.json"
fi

echo ""
echo "✅ Build complete!"
echo "   Output: public/"
echo ""
