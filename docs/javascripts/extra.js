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
        <a href="https://discord.gg/kuX7rCBF" target="_blank" style="background: #374151; color: white; padding: 6px 12px; border-radius: 20px; text-decoration: none; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 6px;"><svg class="twemoji" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: white;"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.211.375-.445.865-.608 1.249a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.249a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/></svg>Discord</a>
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