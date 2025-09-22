// NWSL Documentation custom navigation
console.log('NWSL Documentation loaded');

// Debug function to explore header structure
function debugHeader() {
    console.log('=== Header Debug ===');
    console.log('Header inner:', document.querySelector('.md-header__inner'));
    console.log('Search form:', document.querySelector('.md-search'));
    console.log('Header nav:', document.querySelector('.md-header__nav'));
    console.log('All header elements:', document.querySelectorAll('.md-header *'));
}

document.addEventListener('DOMContentLoaded', function() {
    debugHeader();
    // Try multiple approaches with different timings
    setTimeout(addCustomNavigation, 100);
    setTimeout(addCustomNavigation, 500);
    setTimeout(addCustomNavigation, 1000);
});

// Also try on window load
window.addEventListener('load', function() {
    setTimeout(addCustomNavigation, 100);
});

function addCustomNavigation() {
    console.log('Attempting to add custom navigation...');

    // Try multiple selectors
    let headerContainer = document.querySelector('.md-header__inner');
    if (!headerContainer) {
        headerContainer = document.querySelector('.md-header');
        console.log('Using .md-header as fallback');
    }

    if (!headerContainer) {
        console.warn('No header container found, available elements:');
        console.log(document.querySelectorAll('[class*="header"]'));
        return;
    }

    // Check if buttons already exist
    if (document.querySelector('.nwsl-custom-nav')) {
        console.log('Custom nav already exists');
        return;
    }

    console.log('Header container found:', headerContainer);

    // Create navigation container
    const navContainer = document.createElement('div');
    navContainer.className = 'nwsl-custom-nav';
    navContainer.style.cssText = `
        display: flex !important;
        align-items: center !important;
        margin-left: auto !important;
        margin-right: 1rem !important;
        background: rgba(255,0,0,0.1) !important;
        padding: 4px !important;
    `;

    // Create navigation buttons HTML
    navContainer.innerHTML = `
        <div class="nwsl-nav-buttons" style="display: flex !important; align-items: center !important; gap: 1rem !important;">
            <a href="https://docs.nwsldata.com" class="nwsl-nav-link" style="color: #6b7280 !important; text-decoration: none !important;">Docs</a>
            <a href="https://nwsl-database-proxy-78453984015.us-central1.run.app" target="_blank" rel="noopener noreferrer" class="nwsl-nav-link" style="color: #6b7280 !important; text-decoration: none !important;">API</a>
            <a href="https://research.nwsldata.com" target="_blank" rel="noopener noreferrer" class="nwsl-nav-link" style="color: #6b7280 !important; text-decoration: none !important;">Research</a>
            <a href="https://discord.gg/kuX7rCBF" target="_blank" rel="noopener noreferrer" class="nwsl-discord-btn" style="display: flex !important; align-items: center !important; gap: 0.5rem !important; color: white !important; background-color: #374151 !important; padding: 0.375rem 0.75rem !important; border-radius: 9999px !important; text-decoration: none !important;">
                💬 Discord
            </a>
        </div>
    `;

    // Try different insertion points
    const searchForm = headerContainer.querySelector('.md-search');
    if (searchForm) {
        console.log('Inserting before search form');
        headerContainer.insertBefore(navContainer, searchForm);
    } else {
        console.log('Appending to header container');
        headerContainer.appendChild(navContainer);
    }

    console.log('Custom navigation added successfully!');
}