/**
 * Style Toggle
 * Switch between Terminal and Yahoo-inspired styles
 */

(function() {
    'use strict';

    const STORAGE_KEY = 'my2ndbrain-style-mode';
    const YAHOO_MODE_CLASS = 'yahoo-mode';

    // Check for saved preference or default to terminal
    function getSavedMode() {
        return localStorage.getItem(STORAGE_KEY) || 'terminal';
    }

    // Save mode preference
    function saveMode(mode) {
        localStorage.setItem(STORAGE_KEY, mode);
    }

    // Apply Yahoo mode
    function applyYahooMode() {
        document.body.classList.add(YAHOO_MODE_CLASS);
        updateToggleButton('terminal');
    }

    // Apply Terminal mode
    function applyTerminalMode() {
        document.body.classList.remove(YAHOO_MODE_CLASS);
        updateToggleButton('yahoo');
    }

    // Update toggle button text
    function updateToggleButton(nextMode) {
        const button = document.getElementById('style-toggle');
        if (!button) return;

        if (nextMode === 'yahoo') {
            button.textContent = 'Yahoo Mode';
            button.title = 'Switch to Yahoo-style clean design';
        } else {
            button.textContent = 'Terminal Mode';
            button.title = 'Switch to terminal-inspired design';
        }
    }

    // Toggle between modes
    function toggleMode() {
        const currentMode = getSavedMode();
        const newMode = currentMode === 'yahoo' ? 'terminal' : 'yahoo';

        if (newMode === 'yahoo') {
            applyYahooMode();
        } else {
            applyTerminalMode();
        }

        saveMode(newMode);
        console.log(`Style mode changed to: ${newMode}`);
    }

    // Initialize on page load
    function init() {
        const savedMode = getSavedMode();

        if (savedMode === 'yahoo') {
            applyYahooMode();
        } else {
            applyTerminalMode();
        }

        const toggleButton = document.getElementById('style-toggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', toggleMode);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.styleToggle = {
        toYahoo: applyYahooMode,
        toTerminal: applyTerminalMode,
        toggle: toggleMode,
        getCurrentMode: getSavedMode
    };

})();
