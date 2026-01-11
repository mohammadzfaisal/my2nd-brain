/**
 * OpenPeeps Integration
 * Hand-drawn avatar illustrations for categories and profile
 */

(function() {
    'use strict';

    // OpenPeeps character assignment based on category
    const CATEGORY_PEEPS = {
        'development': 'dev-peep',
        'design': 'design-peep',
        'learning': 'learning-peep',
        'ideas': 'ideas-peep',
        'other': 'other-peep'
    };

    // Hash function for consistent peep selection
    function hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    // Get peep SVG for category
    function getPeepForCategory(category) {
        const peepName = CATEGORY_PEEPS[category.toLowerCase()] || CATEGORY_PEEPS['other'];
        return `/images/peeps/${peepName}.svg`;
    }

    // Generate placeholder SVG until OpenPeeps are downloaded
    function generatePlaceholderPeep(category, size = 80) {
        const colors = {
            'development': '#00B4D8',
            'design': '#FF9F1C',
            'learning': '#90BE6D',
            'ideas': '#F94144',
            'other': '#9D4EDD'
        };

        const color = colors[category.toLowerCase()] || colors['other'];
        const initial = category.charAt(0).toUpperCase();

        return `
            <svg viewBox="0 0 100 100" width="${size}" height="${size}" class="peep-placeholder">
                <circle cx="50" cy="50" r="40" fill="${color}" stroke="#1A1A1A" stroke-width="3" filter="url(#wobble)"/>
                <text x="50" y="65" text-anchor="middle" font-size="50" font-family="Architects Daughter, cursive" fill="#1A1A1A" font-weight="700">${initial}</text>
            </svg>
        `;
    }

    // Initialize OpenPeeps on category cards
    function initCategoryPeeps() {
        const categoryCards = document.querySelectorAll('.category-card');

        categoryCards.forEach(card => {
            const label = card.querySelector('.category-label');
            if (!label) return;

            const category = label.textContent.trim();
            const iconContainer = card.querySelector('.category-icon');

            if (iconContainer) {
                // For now, use placeholder
                // Replace with actual OpenPeeps SVG once downloaded
                iconContainer.innerHTML = generatePlaceholderPeep(category);
            }
        });
    }

    // Load profile peep
    function loadProfilePeep() {
        const profileContainer = document.querySelector('.profile-peep');
        if (profileContainer) {
            // Use a consistent hash for the profile
            const profileSeed = 'mohammad-faisal';
            const hash = hashCode(profileSeed);
            const peepIndex = hash % 5; // 5 different peep variations

            // Placeholder for now
            profileContainer.innerHTML = generatePlaceholderPeep('profile', 60);
        }
    }

    // Export functions
    window.openPeeps = {
        getPeepForCategory,
        generatePlaceholderPeep,
        initCategoryPeeps,
        loadProfilePeep
    };

    // Auto-initialize
    document.addEventListener('DOMContentLoaded', function() {
        initCategoryPeeps();
        loadProfilePeep();
    });

})();

/**
 * TODO: Download OpenPeeps Library
 *
 * 1. Visit https://www.openpeeps.com/
 * 2. Download the SVG library
 * 3. Extract to /static/images/peeps/
 * 4. Update CATEGORY_PEEPS mapping with actual filenames
 * 5. Replace generatePlaceholderPeep with actual SVG loading
 *
 * Example structure:
 * /static/images/peeps/
 *   ├── dev-peep.svg
 *   ├── design-peep.svg
 *   ├── learning-peep.svg
 *   ├── ideas-peep.svg
 *   └── profile-peep.svg
 */
