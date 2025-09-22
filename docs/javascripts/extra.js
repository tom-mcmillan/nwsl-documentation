// NWSL Documentation custom navigation
console.log('NWSL Documentation loaded');

// Simple function that runs immediately and repeatedly tries to add navigation
function tryAddNavigation() {
    console.log('Trying to add navigation...');

    // Check if already added
    if (document.querySelector('.nwsl-custom-nav')) {
        console.log('Navigation already exists');
        return true;
    }

    // Find header - try multiple selectors
    const header = document.querySelector('.md-header__inner') ||
                  document.querySelector('.md-header') ||
                  document.querySelector('header');

    console.log('Header found:', header);

    if (!header) {
        console.log('No header found yet');
        return false;
    }

    // Create the navigation
    const nav = document.createElement('div');
    nav.className = 'nwsl-custom-nav';
    nav.innerHTML = `
        <a href="https://docs.nwsldata.com" style="margin-right: 1rem; color: #6b7280; text-decoration: none; font-size: 14px;">Docs</a>
        <a href="https://nwsl-database-proxy-78453984015.us-central1.run.app" target="_blank" style="margin-right: 1rem; color: #6b7280; text-decoration: none; font-size: 14px;">API</a>
        <a href="https://research.nwsldata.com" target="_blank" style="margin-right: 1rem; color: #6b7280; text-decoration: none; font-size: 14px;">Research</a>
        <a href="https://discord.gg/kuX7rCBF" target="_blank" style="background: #374151; color: white; padding: 6px 12px; border-radius: 20px; text-decoration: none; font-size: 14px; font-weight: 500;">💬 Discord</a>
    `;
    nav.style.cssText = 'position: absolute; right: 10px; top: 50%; transform: translateY(-50%); display: flex; align-items: center; z-index: 1000; background: none;';

    header.style.position = 'relative'; // Ensure header is positioned
    header.appendChild(nav);

    console.log('Navigation added successfully!');
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