// Graph View with Cytoscape.js
// Force-Directed Network Visualization

(function() {
    'use strict';

    let cy = null; // Cytoscape instance

    // Initialize graph view
    async function initGraphView() {
        const container = document.getElementById('cy');
        if (!container) {
            console.error('Graph container not found');
            return;
        }

        // Show loading
        showLoading(true);

        try {
            // Fetch notes data
            const notes = await window.sanityClient.fetchNotesForGraph();
            console.log('Loaded notes for graph:', notes.length);

            // Build graph elements
            const elements = buildGraphElements(notes);

            // Initialize Cytoscape
            cy = cytoscape({
                container: container,
                elements: elements,
                style: getGraphStyle(),
                layout: {
                    name: 'cose-bilkent', // Force-directed layout
                    animate: true,
                    animationDuration: 1000,
                    randomize: false,
                    nodeRepulsion: 8000,
                    idealEdgeLength: 100,
                    edgeElasticity: 0.45,
                    nestingFactor: 0.1,
                    gravity: 0.25,
                    numIter: 2500,
                    tile: true,
                    tilingPaddingVertical: 10,
                    tilingPaddingHorizontal: 10
                },
                minZoom: 0.3,
                maxZoom: 3,
                wheelSensitivity: 0.2
            });

            // Update stats
            updateGraphStats(notes, elements.edges);

            // Setup interactions
            setupGraphInteractions(cy);

            // Setup controls
            setupGraphControls(cy);

            // Hide loading
            showLoading(false);

        } catch (error) {
            console.error('Graph initialization error:', error);
            showLoading(false);
            showError('Failed to load graph. Please ensure Sanity is configured.');
        }
    }

    // Build Cytoscape elements from notes
    function buildGraphElements(notes) {
        const nodes = [];
        const edges = [];
        const nodeIds = new Set();

        notes.forEach(note => {
            const nodeId = note._id;
            nodeIds.add(nodeId);

            // Calculate connection count for styling
            const connectionCount = (note.referenceIds?.length || 0);

            nodes.push({
                data: {
                    id: nodeId,
                    label: note.title,
                    slug: note.slug?.current || note.slug,
                    tags: note.tags || [],
                    connectionCount: connectionCount
                }
            });

            // Add edges for references
            if (note.referenceIds) {
                note.referenceIds.forEach(refId => {
                    edges.push({
                        data: {
                            id: `${nodeId}-${refId}`,
                            source: nodeId,
                            target: refId
                        }
                    });
                });
            }
        });

        return { nodes, edges };
    }

    // Graph visual style with hand-drawn aesthetic
    function getGraphStyle() {
        return [
            {
                selector: 'node',
                style: {
                    'label': 'data(label)',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'font-family': 'Architects Daughter, cursive',
                    'font-size': '14px',
                    'text-wrap': 'wrap',
                    'text-max-width': '100px',
                    'color': '#1A1A1A',
                    'background-color': '#00B4D8',
                    'border-width': 3,
                    'border-color': '#1A1A1A',
                    'width': 'label',
                    'height': 'label',
                    'padding': '15px',
                    'text-transform': 'uppercase',
                    'shape': 'roundrectangle'
                }
            },
            {
                selector: 'node[connectionCount >= 3]',
                style: {
                    'background-color': '#FF9F1C', // Orange for hub nodes
                    'border-width': 4
                }
            },
            {
                selector: 'node:selected',
                style: {
                    'background-color': '#E63946', // Red for selected
                    'border-width': 5,
                    'z-index': 999
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#1A1A1A',
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle',
                    'target-arrow-color': '#1A1A1A',
                    'arrow-scale': 1.2,
                    'opacity': 0.6
                }
            },
            {
                selector: 'edge:selected',
                style: {
                    'line-color': '#00B4D8',
                    'target-arrow-color': '#00B4D8',
                    'width': 4,
                    'opacity': 1
                }
            },
            {
                selector: '.highlighted',
                style: {
                    'background-color': '#E63946',
                    'line-color': '#E63946',
                    'target-arrow-color': '#E63946',
                    'opacity': 1,
                    'z-index': 999
                }
            },
            {
                selector: '.dimmed',
                style: {
                    'opacity': 0.2
                }
            }
        ];
    }

    // Setup graph interactions
    function setupGraphInteractions(cy) {
        const tooltip = document.getElementById('node-tooltip');

        // Click to navigate
        cy.on('tap', 'node', function(evt) {
            const node = evt.target;
            const slug = node.data('slug');

            if (slug) {
                window.location.href = `/notes/${slug}/`;
            }
        });

        // Double-click to focus and highlight
        cy.on('dbltap', 'node', function(evt) {
            const node = evt.target;

            // Reset previous highlighting
            cy.elements().removeClass('highlighted dimmed');

            // Highlight connected nodes and edges
            const neighborhood = node.neighborhood().add(node);
            neighborhood.addClass('highlighted');

            // Dim unconnected nodes
            cy.elements().not(neighborhood).addClass('dimmed');

            // Center on node
            cy.animate({
                fit: {
                    eles: neighborhood,
                    padding: 50
                },
                duration: 500
            });
        });

        // Hover tooltip
        cy.on('mouseover', 'node', function(evt) {
            const node = evt.target;
            const renderedPosition = node.renderedPosition();

            if (tooltip) {
                const title = tooltip.querySelector('.node-tooltip-title');
                const meta = tooltip.querySelector('.node-tooltip-meta');

                title.textContent = node.data('label');
                const tags = node.data('tags');
                const connections = node.data('connectionCount');
                meta.textContent = `${connections} connection(s)${tags.length > 0 ? ' • ' + tags.join(', ') : ''}`;

                tooltip.style.left = `${renderedPosition.x + 20}px`;
                tooltip.style.top = `${renderedPosition.y - 10}px`;
                tooltip.style.display = 'block';
            }
        });

        cy.on('mouseout', 'node', function() {
            if (tooltip) {
                tooltip.style.display = 'none';
            }
        });

        // Click background to reset
        cy.on('tap', function(evt) {
            if (evt.target === cy) {
                cy.elements().removeClass('highlighted dimmed');
            }
        });
    }

    // Setup graph control buttons
    function setupGraphControls(cy) {
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        const zoomResetBtn = document.getElementById('zoom-reset');
        const fullscreenBtn = document.getElementById('fullscreen');

        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                cy.zoom(cy.zoom() * 1.2);
            });
        }

        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                cy.zoom(cy.zoom() * 0.8);
            });
        }

        if (zoomResetBtn) {
            zoomResetBtn.addEventListener('click', () => {
                cy.fit(null, 50);
                cy.elements().removeClass('highlighted dimmed');
            });
        }

        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                const container = document.querySelector('.graph-container');
                if (container) {
                    container.classList.toggle('graph-fullscreen');
                    setTimeout(() => cy.resize(), 100);
                }
            });
        }

        // Graph search
        setupGraphSearch(cy);
    }

    // Setup graph search functionality
    function setupGraphSearch(cy) {
        const searchInput = document.getElementById('graph-search');
        const searchResults = document.getElementById('graph-search-results');

        if (!searchInput || !searchResults) return;

        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();

            if (!query) {
                searchResults.style.display = 'none';
                cy.elements().removeClass('highlighted dimmed');
                return;
            }

            // Find matching nodes
            const matches = cy.nodes().filter(node => {
                return node.data('label').toLowerCase().includes(query);
            });

            // Display results
            searchResults.innerHTML = '';
            matches.forEach(node => {
                const item = document.createElement('div');
                item.className = 'graph-search-result-item';
                item.textContent = node.data('label');
                item.addEventListener('click', () => {
                    cy.elements().removeClass('highlighted dimmed');
                    node.addClass('highlighted');
                    cy.animate({
                        fit: { eles: node, padding: 100 },
                        duration: 500
                    });
                    searchResults.style.display = 'none';
                    searchInput.value = '';
                });
                searchResults.appendChild(item);
            });

            searchResults.style.display = matches.length > 0 ? 'block' : 'none';
        });
    }

    // Update graph statistics
    function updateGraphStats(notes, edges) {
        const nodesCount = document.getElementById('graph-nodes-count');
        const edgesCount = document.getElementById('graph-edges-count');

        if (nodesCount) {
            nodesCount.textContent = notes.length;
        }

        if (edgesCount) {
            edgesCount.textContent = edges.length;
        }
    }

    // Show/hide loading indicator
    function showLoading(show) {
        const loading = document.getElementById('graph-loading');
        if (loading) {
            loading.style.display = show ? 'block' : 'none';
        }
    }

    // Show error message
    function showError(message) {
        const container = document.getElementById('cy');
        if (container) {
            container.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; text-align: center;">
                    <div>
                        <h3 style="color: var(--color-red);">⚠️ ${message}</h3>
                        <p>Check console for details.</p>
                    </div>
                </div>
            `;
        }
    }

    // Export to window
    window.initGraphView = initGraphView;

})();
