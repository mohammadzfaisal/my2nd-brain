// Sanity Client for MY 2ND BRAIN
// Client-side integration for live data fetching

(function() {
    'use strict';

    // Sanity configuration (will be set from Hugo params or env)
    const SANITY_CONFIG = {
        projectId: window.SANITY_PROJECT_ID || '',
        dataset: window.SANITY_DATASET || 'production',
        apiVersion: '2024-01-01',
        useCdn: true
    };

    // Base URL for Sanity API
    const getApiUrl = () => {
        return `https://${SANITY_CONFIG.projectId}.api.sanity.io/v${SANITY_CONFIG.apiVersion}/data/query/${SANITY_CONFIG.dataset}`;
    };

    // Execute GROQ query
    async function queryGroq(query, params = {}) {
        if (!SANITY_CONFIG.projectId) {
            console.warn('Sanity Project ID not configured');
            return { result: [] };
        }

        const url = new URL(getApiUrl());
        url.searchParams.append('query', query);

        // Add parameters
        Object.keys(params).forEach(key => {
            url.searchParams.append(`$${key}`, JSON.stringify(params[key]));
        });

        try {
            const response = await fetch(url.toString());
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Sanity query error:', error);
            return { result: [] };
        }
    }

    // Fetch all notes
    async function fetchAllNotes() {
        const query = `*[_type == "note"] | order(_createdAt desc) {
            _id,
            title,
            slug,
            body,
            tags,
            references[]->{_id, title, slug},
            _createdAt,
            _updatedAt
        }`;

        const data = await queryGroq(query);
        return data.result || [];
    }

    // Fetch single note with backlinks
    async function fetchNoteWithBacklinks(slug) {
        const query = `*[_type == "note" && slug.current == $slug][0]{
            _id,
            title,
            slug,
            body,
            tags,
            references[]->{_id, title, slug},
            "backlinks": *[_type == "note" && references[]._ref == ^._id]{
                _id,
                title,
                slug
            },
            _createdAt,
            _updatedAt
        }`;

        const data = await queryGroq(query, { slug });
        return data.result;
    }

    // Fetch notes for graph view
    async function fetchNotesForGraph() {
        const query = `*[_type == "note"] {
            _id,
            title,
            slug,
            tags,
            "referenceIds": references[]._ref,
            _createdAt
        }`;

        const data = await queryGroq(query);
        return data.result || [];
    }

    // Update stats on dashboard
    async function updateDashboardStats() {
        const notes = await fetchAllNotes();

        // Total notes
        const totalNotesEl = document.getElementById('total-notes');
        if (totalNotesEl) {
            totalNotesEl.textContent = notes.length;
        }

        // Unique tags
        const allTags = new Set();
        notes.forEach(note => {
            if (note.tags) {
                note.tags.forEach(tag => allTags.add(tag));
            }
        });

        const totalTagsEl = document.getElementById('total-tags');
        if (totalTagsEl) {
            totalTagsEl.textContent = allTags.size;
        }

        // Total connections
        let totalConnections = 0;
        notes.forEach(note => {
            if (note.references) {
                totalConnections += note.references.length;
            }
        });

        const totalConnectionsEl = document.getElementById('total-connections');
        if (totalConnectionsEl) {
            totalConnectionsEl.textContent = totalConnections;
        }

        return notes;
    }

    // Render portable text (simplified)
    function renderPortableText(blocks) {
        if (!blocks || !Array.isArray(blocks)) return '';

        return blocks.map(block => {
            if (block._type === 'block') {
                const text = block.children?.map(child => child.text).join('') || '';
                const style = block.style || 'normal';

                switch (style) {
                    case 'h1': return `<h1>${text}</h1>`;
                    case 'h2': return `<h2>${text}</h2>`;
                    case 'h3': return `<h3>${text}</h3>`;
                    default: return `<p>${text}</p>`;
                }
            }
            return '';
        }).join('');
    }

    // Render backlinks for single note page
    async function renderBacklinks(noteSlug) {
        const note = await fetchNoteWithBacklinks(noteSlug);

        if (!note || !note.backlinks || note.backlinks.length === 0) {
            return;
        }

        const container = document.getElementById('backlinks-container');
        const count = document.getElementById('backlinks-count');
        const list = document.getElementById('backlinks-list');

        if (!container || !count || !list) return;

        count.textContent = note.backlinks.length;

        note.backlinks.forEach(backlink => {
            const card = document.createElement('div');
            card.className = 'note-card note-card-compact';
            card.innerHTML = `
                <h4 class="note-card-title">
                    <a href="/notes/${backlink.slug.current}/" style="border: none; color: inherit;">
                        ${backlink.title}
                    </a>
                </h4>
            `;
            list.appendChild(card);
        });

        container.style.display = 'block';
    }

    // Initialize search functionality
    function initSearch() {
        const searchInput = document.getElementById('search-notes');
        if (!searchInput) return;

        let notesData = [];

        fetchAllNotes().then(notes => {
            notesData = notes;
        });

        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();

            if (!query) {
                // Reset display
                return;
            }

            // Simple search - can be enhanced with Fuse.js
            const results = notesData.filter(note => {
                const titleMatch = note.title?.toLowerCase().includes(query);
                const bodyText = note.body?.map(b => b.children?.map(c => c.text).join('')).join('') || '';
                const bodyMatch = bodyText.toLowerCase().includes(query);
                const tagMatch = note.tags?.some(tag => tag.toLowerCase().includes(query));

                return titleMatch || bodyMatch || tagMatch;
            });

            console.log('Search results:', results.length);
            // Results can be rendered dynamically here
        });
    }

    // Export to window
    window.sanityClient = {
        queryGroq,
        fetchAllNotes,
        fetchNoteWithBacklinks,
        fetchNotesForGraph,
        updateDashboardStats,
        renderPortableText,
        renderBacklinks,
        initSearch
    };

    // Auto-initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Sanity client initialized');

        // Update stats if on dashboard
        if (document.getElementById('total-notes')) {
            updateDashboardStats();
        }

        // Initialize search
        initSearch();
    });
})();
