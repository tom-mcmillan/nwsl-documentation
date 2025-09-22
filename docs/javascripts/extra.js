// NWSL Documentation custom navigation
console.log('NWSL Documentation loaded');

// Simple function that runs immediately and repeatedly tries to add navigation
function tryAddNavigation() {
    console.log('Trying to add navigation...');

    // Remove any existing navigation first to ensure updates
    const existingNav = document.querySelector('.nwsl-custom-nav');
    if (existingNav) {
        console.log('Removing existing navigation');
        existingNav.remove();
    }

    // Find search bar first
    const searchForm = document.querySelector('.md-search');
    console.log('Search form found:', searchForm);

    if (!searchForm) {
        console.log('No search form found yet');
        return false;
    }

    // Create the navigation
    const nav = document.createElement('div');
    nav.className = 'nwsl-custom-nav';
    nav.innerHTML = `
        <a href="https://docs.nwsldata.com" style="margin-left: 1rem; margin-right: 1rem; color: #6b7280; text-decoration: none; font-size: 14px;">Docs</a>
        <a href="https://nwsldata.com/api" target="_blank" style="margin-right: 1rem; color: #6b7280; text-decoration: none; font-size: 14px;">API</a>
        <a href="https://research.nwsldata.com" target="_blank" style="margin-right: 1rem; color: #6b7280; text-decoration: none; font-size: 14px;">Research</a>
        <a href="https://discord.gg/kuX7rCBF" target="_blank" style="background: #374151; color: white; padding: 8px 20px; border-radius: 20px; text-decoration: none; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 10px; min-width: 100px;"><img src="./assets/images/Discord-Symbol-White.png" alt="Discord" style="height: 16px; width: auto;">Discord</a>
    `;
    nav.style.cssText = 'display: flex; align-items: center; margin-left: auto;';

    // Insert after the search form
    searchForm.parentNode.insertBefore(nav, searchForm.nextSibling);

    console.log('Navigation added after search form successfully!');
    return true;
}

// Try immediately
tryAddNavigation();

// Try again after short delay
setTimeout(tryAddNavigation, 100);
setTimeout(tryAddNavigation, 500);
setTimeout(tryAddNavigation, 1000);

// Try on DOM ready and window load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryAddNavigation);
} else {
    tryAddNavigation();
}

window.addEventListener('load', tryAddNavigation);