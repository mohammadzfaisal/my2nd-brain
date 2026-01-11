#!/usr/bin/env node

/**
 * Fetch Sanity Data at Build Time
 * This script fetches all notes from Sanity and saves them as JSON
 * for Hugo to use during the build process
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables if available
try {
    require('dotenv').config();
} catch (e) {
    // dotenv not installed or no .env file
}

// Sanity configuration
const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || '';
const SANITY_DATASET = process.env.SANITY_DATASET || 'production';
const SANITY_API_VERSION = '2024-01-01';

// GROQ query to fetch all notes with full data
const QUERY = `*[_type == "note"] | order(_createdAt desc) {
    _id,
    _createdAt,
    _updatedAt,
    title,
    slug,
    body,
    tags,
    references[]->{
        _id,
        title,
        slug
    }
}`;

// Build Sanity API URL
function buildQueryUrl(query) {
    const baseUrl = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`;
    const encodedQuery = encodeURIComponent(query);
    return `${baseUrl}?query=${encodedQuery}`;
}

// Fetch data from Sanity
function fetchSanityData() {
    return new Promise((resolve, reject) => {
        if (!SANITY_PROJECT_ID) {
            console.warn('⚠️  SANITY_PROJECT_ID not set. Skipping data fetch.');
            console.warn('   Set SANITY_PROJECT_ID environment variable to fetch data.');
            resolve({ result: [] });
            return;
        }

        const url = buildQueryUrl(QUERY);

        console.log('📡 Fetching data from Sanity...');
        console.log(`   Project: ${SANITY_PROJECT_ID}`);
        console.log(`   Dataset: ${SANITY_DATASET}`);

        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);

                    if (parsed.error) {
                        reject(new Error(`Sanity API error: ${parsed.error.description || parsed.error}`));
                        return;
                    }

                    resolve(parsed);
                } catch (error) {
                    reject(new Error(`Failed to parse Sanity response: ${error.message}`));
                }
            });
        }).on('error', (error) => {
            reject(new Error(`Failed to fetch from Sanity: ${error.message}`));
        });
    });
}

// Save data to file
function saveData(data) {
    const outputDir = path.join(__dirname, '..', 'data', 'sanity');
    const outputFile = path.join(outputDir, 'notes.json');

    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));

    console.log(`✅ Saved ${data.notes.length} notes to ${outputFile}`);
}

// Main execution
async function main() {
    try {
        console.log('🚀 Starting Sanity data fetch...\n');

        const response = await fetchSanityData();
        const notes = response.result || [];

        console.log(`📝 Fetched ${notes.length} notes from Sanity`);

        // Save as structured data
        const outputData = {
            notes: notes,
            fetchedAt: new Date().toISOString(),
            totalCount: notes.length
        };

        saveData(outputData);

        console.log('\n✨ Data fetch complete!\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error fetching Sanity data:');
        console.error(`   ${error.message}\n`);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { fetchSanityData, saveData };
