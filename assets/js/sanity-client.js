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

    let cachedNotes = null;

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
            category,
            tags,
            references[]->{_id, title, slug},
            _createdAt,
            _updatedAt
        }`;

        const data = await queryGroq(query);
        return data.result || [];
    }

    async function getNotes() {
        if (cachedNotes) return cachedNotes;
        cachedNotes = await fetchAllNotes();
        return cachedNotes;
    }

    // Fetch single note with backlinks
    async function fetchNoteWithBacklinks(slug) {
        const query = `*[_type == "note" && slug.current == $slug][0]{
            _id,
            title,
            slug,
            body,
            category,
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
            category,
            _createdAt
        }`;

        const data = await queryGroq(query);
        return data.result || [];
    }

    // Update stats on dashboard
    async function updateDashboardStats() {
        const notes = await getNotes();

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

        if (notes.length > 0) {
            updateCategoryCounts(notes);
        }

        return notes;
    }

    function updateCategoryCounts(notes) {
        if (!notes || notes.length === 0) return;
        const counts = {};

        notes.forEach(note => {
            const category = (note.category || 'other').toString().toLowerCase();
            counts[category] = (counts[category] || 0) + 1;
        });

        document.querySelectorAll('.category-card').forEach(card => {
            const countEl = card.querySelector('.category-count');
            if (!countEl) return;

            const key = (card.dataset.category || '')
                .toString()
                .trim()
                .toLowerCase();
            const label = card.querySelector('.category-label');
            const fallback = label ? label.textContent.trim().toLowerCase() : '';
            const categoryKey = key || fallback || 'other';

            countEl.textContent = counts[categoryKey] || 0;
        });
    }

    function getPreviewText(body) {
        if (!Array.isArray(body)) return '';
        for (const block of body) {
            if (block && block._type === 'block') {
                const text = (block.children || []).map(child => child.text || '').join('').trim();
                if (text) return text;
            }
        }
        return '';
    }

    function renderNotesList(notes) {
        renderNotesListTo('recent-notes', notes);
    }

    function renderNotesListTo(containerId, notes) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!notes || notes.length === 0) {
            container.innerHTML = `
                <div class="card-empty-state" style="grid-column: 1 / -1;">
                    <div class="card-empty-state-icon">??</div>
                    <h3>No notes in this category yet!</h3>
                    <p>Create a note in Sanity Studio to see it here.</p>
                    <a href="/studio/" class="btn btn-primary mt-md">Open Sanity Studio</a>
                </div>
            `;
            return;
        }

        container.innerHTML = notes.map(note => {
            const slug = (note.slug && note.slug.current) ? note.slug.current : (note.slug || '');
            const title = note.title || 'Untitled';
            const preview = getPreviewText(note.body) || 'No content preview available';
            const tags = Array.isArray(note.tags) ? note.tags : [];
            const refCount = Array.isArray(note.references) ? note.references.length : 0;
            const date = note._createdAt ? new Date(note._createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }) : '';

            const tagsHtml = tags.length
                ? `<div class="note-tags">${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>`
                : '';
            const refsHtml = refCount ? `<span class="connection-count">${refCount}</span>` : '';
            const dateHtml = date ? `<span class="note-date">${date}</span>` : '';

            return `
                <article class="note-card">
                    <div class="note-card-header">
                        <h3 class="note-card-title">
                            <a href="/notes/${slug}/" style="border: none; color: inherit;">
                                ${title}
                            </a>
                        </h3>
                    </div>
                    <div class="note-card-body">${preview}</div>
                    <div class="note-card-footer">
                        ${tagsHtml}
                        ${refsHtml}
                        ${dateHtml}
                    </div>
                </article>
            `;
        }).join('');
    }

    function refreshLiveNotes(notes) {
        if (!notes || notes.length === 0) return;

        updateCategoryCounts(notes);

        const recentNotes = notes.slice(0, 6);
        renderNotesListTo('recent-notes', recentNotes);

        if (document.getElementById('notes-list')) {
            renderNotesListTo('notes-list', notes);
        }
    }

    function initCategoryFilters() {
        const cards = document.querySelectorAll('.category-card');
        if (!cards.length) return;

        const notesContainer = document.getElementById('recent-notes');
        const renderedCards = notesContainer ? notesContainer.querySelectorAll('.note-card') : [];
        const hasRenderedNotes = renderedCards.length > 0;

        let activeCategory = null;

        cards.forEach(card => {
            card.addEventListener('click', async () => {
                const label = card.querySelector('.category-label');
                const category = (card.dataset.category || (label && label.textContent) || 'other')
                    .toString()
                    .trim()
                    .toLowerCase();

                if (hasRenderedNotes) {
                    const nextCategory = activeCategory === category ? null : category;
                    activeCategory = nextCategory;

                    renderedCards.forEach(noteCard => {
                        const noteCategory = (noteCard.dataset.category || 'other')
                            .toString()
                            .trim()
                            .toLowerCase();
                        const shouldShow = !activeCategory || noteCategory === activeCategory;
                        noteCard.style.display = shouldShow ? 'flex' : 'none';
                    });
                    return;
                }

                const notes = await getNotes();

                if (activeCategory === category) {
                    activeCategory = null;
                    renderNotesList(notes);
                    return;
                }

                activeCategory = category;
                const filtered = notes.filter(note => {
                    const noteCategory = (note.category || 'other').toString().toLowerCase();
                    return noteCategory === category;
                });
                renderNotesList(filtered);
            });
        });
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

        // Category filters (home page)
        initCategoryFilters();

        // Live refresh for lists (hybrid mode)
        getNotes().then((notes) => {
            refreshLiveNotes(notes);
        });
    });
})();
