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
    body[]{
        ...,
        asset->{
            _id,
            url
        },
        markDefs[]{
            ...,
            reference->{
                _id,
                slug
            },
            file{
                asset->{
                    _id,
                    url
                }
            }
        }
    },
    category,
    isFavorite,
    status,
    tags,
    references[]->{
        _id,
        title,
        slug
    }
}`;

const FAVORITES_QUERY = `*[_type == "note" && isFavorite == true] | order(_createdAt desc) {
    _id,
    _createdAt,
    _updatedAt,
    title,
    slug,
    body[]{
        ...,
        asset->{
            _id,
            url
        }
    },
    category,
    isFavorite,
    status,
    tags,
    references[]->{
        _id,
        title,
        slug
    }
}`;

const ARCHIVE_QUERY = `*[_type == "note" && status == "archived"] | order(_createdAt desc) {
    _id,
    _createdAt,
    _updatedAt,
    title,
    slug,
    body[]{
        ...,
        asset->{
            _id,
            url
        }
    },
    category,
    isFavorite,
    status,
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
function fetchSanityData(query) {
    return new Promise((resolve, reject) => {
        if (!SANITY_PROJECT_ID) {
            console.warn('??  SANITY_PROJECT_ID not set. Skipping data fetch.');
            console.warn('   Set SANITY_PROJECT_ID environment variable to fetch data.');
            resolve({ result: [] });
            return;
        }

        const url = buildQueryUrl(query);

        console.log('?? Fetching data from Sanity...');
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
function saveData(data, filename) {
    const outputDir = path.join(__dirname, '..', 'data', 'sanity');
    const outputFile = path.join(outputDir, filename);

    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));

    console.log(`? Saved ${data.notes.length} notes to ${outputFile}`);
}

function toPlainText(children) {
    if (!Array.isArray(children)) return '';
    return children.map((child) => child.text || '').join('');
}

function getPlainText(children) {
    if (!Array.isArray(children)) return '';
    return children.map((child) => child.text || '').join('');
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function renderAnnotation(markDef, text, notesById) {
    if (!markDef || !markDef._type) return text;

    if (markDef._type === 'link') {
        return markDef.href ? `[${text}](${markDef.href})` : text;
    }

    if (markDef._type === 'internalLink') {
        const ref = markDef.reference;
        const slug = ref && ref.slug && ref.slug.current ? ref.slug.current : (ref && ref._id ? notesById[ref._id] : null);
        return slug ? `[${text}](/notes/${slug}/)` : text;
    }

    if (markDef._type === 'fileLink') {
        const url = markDef.file && markDef.file.asset && markDef.file.asset.url ? markDef.file.asset.url : '';
        const label = markDef.label || text;
        return url ? `[${label}](${url})` : text;
    }

    if (markDef._type === 'buttonLink') {
        const label = markDef.label || text;
        const href = markDef.href || '';
        const variant = markDef.variant === 'secondary' ? 'btn-secondary' : 'btn-primary';
        return href ? `<a class="btn ${variant}" href="${href}">${escapeHtml(label)}</a>` : text;
    }

    return text;
}

function applyDecorator(mark, text) {
    if (mark === 'strong') return `**${text}**`;
    if (mark === 'em') return `*${text}*`;
    if (mark === 'code') return `\`${text.replace(/`/g, '\\`')}\``;
    if (mark === 'underline') return `<u>${text}</u>`;
    if (mark === 'strike-through') return `~~${text}~~`;
    if (mark === 'highlight') return `<mark>${text}</mark>`;
    if (mark === 'kbd') return `<kbd>${text}</kbd>`;
    if (mark === 'code-strong') return `<code class="code-strong">${escapeHtml(text)}</code>`;
    if (mark === 'code-muted') return `<code class="code-muted">${escapeHtml(text)}</code>`;
    return text;
}

function renderSpan(child, markDefsMap, notesById) {
    let text = child.text || '';
    const marks = Array.isArray(child.marks) ? child.marks : [];

    marks.forEach((mark) => {
        if (markDefsMap[mark]) {
            text = renderAnnotation(markDefsMap[mark], text, notesById);
        } else {
            text = applyDecorator(mark, text);
        }
    });

    return text;
}

function renderChildren(children, markDefsMap, notesById) {
    if (!Array.isArray(children)) return '';
    return children.map((child) => renderSpan(child, markDefsMap, notesById)).join('');
}

function renderPortableTextToMarkdown(blocks, notesById) {
    if (!Array.isArray(blocks)) return '';

    const lines = [];
    let listType = null;
    let listIndex = 1;

    blocks.forEach((block) => {
        if (!block) return;

        if (block._type === 'image') {
            if (listType) {
                listType = null;
                listIndex = 1;
                lines.push('');
            }

            const alt = (block.alt || '').replace(/\s+/g, ' ').trim();
            const url = block.asset && block.asset.url ? block.asset.url : '';
            if (url) {
                lines.push(`![${alt}](${url})`);
                lines.push('');
            }
            return;
        }

        if (block._type === 'code') {
            if (listType) {
                listType = null;
                listIndex = 1;
                lines.push('');
            }

            const language = block.language || '';
            const code = block.code || '';
            lines.push(`\`\`\`${language}`);
            lines.push(code);
            lines.push('```');
            lines.push('');
            return;
        }

        if (block._type === 'callout') {
            const tone = block.tone || 'info';
            const title = (block.title || '').replace(/"/g, '\\"');
            const body = renderPortableTextToMarkdown(block.body || [], notesById);
            lines.push(`{{< callout tone="${tone}" title="${title}" >}}`);
            if (body) lines.push(body);
            lines.push('{{< /callout >}}');
            lines.push('');
            return;
        }

        if (block._type === 'checklist') {
            const items = Array.isArray(block.items) ? block.items : [];
            lines.push('<ul class="checklist">');
            items.forEach((item) => {
                const label = escapeHtml(item.text || 'Untitled');
                const doneClass = item.done ? ' is-done' : '';
                const check = item.done ? '[x]' : '[ ]';
                lines.push(`  <li class="checklist-item${doneClass}">${check} ${label}</li>`);
            });
            lines.push('</ul>');
            lines.push('');
            return;
        }

        if (block._type === 'table') {
            const rows = Array.isArray(block.rows) ? block.rows : [];
            if (rows.length) {
                const header = rows[0].cells || [];
                lines.push(`| ${header.join(' | ')} |`);
                lines.push(`| ${header.map(() => '---').join(' | ')} |`);
                rows.slice(1).forEach((row) => {
                    const cells = row.cells || [];
                    lines.push(`| ${cells.join(' | ')} |`);
                });
                lines.push('');
            }
            return;
        }

        if (block._type === 'embed') {
            const url = block.url || '';
            const title = (block.title || '').replace(/"/g, '\\"');
            const caption = (block.caption || '').replace(/"/g, '\\"');
            lines.push(`{{< embed url="${url}" title="${title}" caption="${caption}" >}}`);
            lines.push('');
            return;
        }

        if (block._type === 'divider') {
            const style = block.style || 'solid';
            lines.push(`{{< divider style="${style}" >}}`);
            lines.push('');
            return;
        }

        if (block._type !== 'block') return;

        const markDefsMap = {};
        if (Array.isArray(block.markDefs)) {
            block.markDefs.forEach((def) => {
                if (def && def._key) markDefsMap[def._key] = def;
            });
        }

        const text = renderChildren(block.children, markDefsMap, notesById).trim();
        const style = block.style || 'normal';

        if (block.listItem) {
            if (listType !== block.listItem) {
                listType = block.listItem;
                listIndex = 1;
            }

            if (block.listItem === 'number') {
                lines.push(`${listIndex}. ${text}`);
                listIndex += 1;
            } else {
                lines.push(`- ${text}`);
            }
            return;
        }

        if (listType) {
            listType = null;
            listIndex = 1;
            lines.push('');
        }

        if (style === 'h1') {
            lines.push(`# ${text}`);
        } else if (style === 'h2') {
            lines.push(`## ${text}`);
        } else if (style === 'h3') {
            lines.push(`### ${text}`);
        } else if (style === 'lead') {
            lines.push(`<p class="text-lead">${text}</p>`);
        } else if (style === 'small') {
            lines.push(`<p class="text-small">${text}</p>`);
        } else if (style === 'caption') {
            lines.push(`<p class="text-caption">${text}</p>`);
        } else if (style === 'code-title') {
            lines.push(`<p class="text-code-title">${text}</p>`);
        } else if (style === 'blockquote') {
            lines.push(`> ${text}`);
        } else {
            lines.push(text);
        }

        lines.push('');
    });

    return lines.join('\n').trim();
}

function sanitizeSlug(slug) {
    return (slug || '')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function writeNoteMarkdown(notes, notesById) {
    const notesDir = path.join(__dirname, '..', 'content', 'notes');
    if (!fs.existsSync(notesDir)) {
        fs.mkdirSync(notesDir, { recursive: true });
    }

    notes.forEach((note) => {
        const slug = sanitizeSlug(note.slug && note.slug.current ? note.slug.current : note.slug);
        if (!slug) return;

        const filePath = path.join(notesDir, `${slug}.md`);
        const title = note.title || 'Untitled';
        const date = note._createdAt || new Date().toISOString();
        const tags = Array.isArray(note.tags) ? note.tags : [];
        const category = note.category || '';
        const isFavorite = Boolean(note.isFavorite);
        const status = note.status || 'active';
        const references = Array.isArray(note.references) ? note.references : [];
        const referenceSlugs = references
            .map((ref) => (ref.slug && ref.slug.current) ? ref.slug.current : ref.slug)
            .filter(Boolean);

        const frontMatter = [
            '---',
            `title: "${title.replace(/"/g, '\\"')}"`,
            `date: "${date}"`,
            category ? `category: "${category}"` : null,
            `isFavorite: ${isFavorite}`,
            status ? `status: "${status}"` : null,
            tags.length ? `tags: [${tags.map((tag) => `"${tag.replace(/"/g, '\\"')}"`).join(', ')}]` : null,
            referenceSlugs.length ? `references: [${referenceSlugs.map((ref) => `"${ref.replace(/"/g, '\\"')}"`).join(', ')}]` : null,
            '---'
        ].filter(Boolean).join('\n');

        const body = renderPortableTextToMarkdown(note.body, notesById);
        const content = `${frontMatter}\n\n${body}\n`;

        fs.writeFileSync(filePath, content);
    });
}

// Main execution
async function main() {
    try {
        console.log('?? Starting Sanity data fetch...\n');

        const response = await fetchSanityData(QUERY);
        const notes = response.result || [];

        console.log(`?? Fetched ${notes.length} notes from Sanity`);

        // Save as structured data
        const outputData = {
            notes: notes,
            fetchedAt: new Date().toISOString(),
            totalCount: notes.length
        };

        const notesById = {};
        notes.forEach((note) => {
            if (note && note._id) {
                const slug = note.slug && note.slug.current ? note.slug.current : note.slug;
                if (slug) notesById[note._id] = sanitizeSlug(slug);
            }
        });

        saveData(outputData, 'notes.json');
        writeNoteMarkdown(notes, notesById);

        const favoritesResponse = await fetchSanityData(FAVORITES_QUERY);
        const favorites = favoritesResponse.result || [];
        saveData({
            notes: favorites,
            fetchedAt: new Date().toISOString(),
            totalCount: favorites.length
        }, 'favorites.json');

        const archiveResponse = await fetchSanityData(ARCHIVE_QUERY);
        const archived = archiveResponse.result || [];
        saveData({
            notes: archived,
            fetchedAt: new Date().toISOString(),
            totalCount: archived.length
        }, 'archive.json');

        console.log('\n? Data fetch complete!\n');
        process.exit(0);
    } catch (error) {
        console.error('\n? Error fetching Sanity data:');
        console.error(`   ${error.message}\n`);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { fetchSanityData, saveData };
