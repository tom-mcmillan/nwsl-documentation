// NWSL Documentation custom navigation
console.log('NWSL Documentation loaded');

document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for MkDocs to fully render
    setTimeout(function() {
        addCustomNavigation();
    }, 100);
});

function addCustomNavigation() {
    // Find the header inner container
    const headerInner = document.querySelector('.md-header__inner');
    if (!headerInner) {
        console.warn('Header inner not found, retrying...');
        setTimeout(addCustomNavigation, 200);
        return;
    }

    // Check if buttons already exist
    if (document.querySelector('.nwsl-custom-nav')) {
        return;
    }

    // Create navigation container
    const navContainer = document.createElement('div');
    navContainer.className = 'nwsl-custom-nav';

    // Create navigation buttons HTML
    navContainer.innerHTML = `
        <div class="nwsl-nav-buttons">
            <a href="https://docs.nwsldata.com" class="nwsl-nav-link">Docs</a>
            <a href="https://nwsl-database-proxy-78453984015.us-central1.run.app" target="_blank" rel="noopener noreferrer" class="nwsl-nav-link">API</a>
            <a href="https://research.nwsldata.com" target="_blank" rel="noopener noreferrer" class="nwsl-nav-link">Research</a>
            <a href="https://discord.gg/kuX7rCBF" target="_blank" rel="noopener noreferrer" class="nwsl-discord-btn">
                <span class="discord-icon">💬</span>
                Discord
            </a>
        </div>
    `;

    // Insert before the search form or at the end
    const searchForm = headerInner.querySelector('.md-search');
    if (searchForm) {
        headerInner.insertBefore(navContainer, searchForm);
    } else {
        headerInner.appendChild(navContainer);
    }

    console.log('Custom navigation added');
}