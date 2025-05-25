/**
 * Loading screen functions for Sanrico Mercantile
 * These functions manage the site-wide loading screen
 */

// Loading screen functions
function showLoading(message = "Loading...") {
    document.getElementById('loadingText').textContent = message;
    document.getElementById('loadingScreen').style.opacity = "1";
    document.getElementById('loadingScreen').style.display = "flex";
    document.body.style.overflow = "hidden"; // Prevent scrolling while loading
}

function hideLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.style.opacity = "0";
    setTimeout(() => {
        loadingScreen.style.display = "none";
        document.body.style.overflow = ""; // Re-enable scrolling
    }, 500);
}

// Helper function to add loading to navigation actions
function addLoadingToNavigation() {
    // Common page navigation elements
    const navigationElements = {
        'homeLink': 'Loading Home Page...',
        'shopLink': 'Loading Shop...',
        'cartLink': 'Loading Cart...',
        'aboutLink': 'Loading About Us...',
        'faqLink': 'Loading FAQ...',
        'loginBtn': 'Opening Login...',
        'logoutBtn': 'Logging Out...'
    };

    // Add loading events to common elements if they exist
    Object.keys(navigationElements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const originalClick = element.onclick;
            element.onclick = function(e) {
                showLoading(navigationElements[id]);
                if (originalClick) {
                    // If there was a previous click handler, delay it slightly
                    setTimeout(() => {
                        originalClick.call(this, e);
                    }, 100);
                    return false;
                }
                return true; // Allow default navigation
            };
        }
    });

    // Add loading to all general navigation links
    document.querySelectorAll('a[href]:not([href^="#"]):not([href^="javascript"])').forEach(link => {
        const originalClick = link.onclick;
        link.onclick = function(e) {
            const href = this.getAttribute('href');
            // Don't show loading for external links
            if (href && !href.startsWith('http') && !href.startsWith('//')) {
                const pageName = href.split('/').pop().split('.')[0];
                const message = `Loading ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}...`;
                showLoading(message);
            }
            
            if (originalClick) {
                setTimeout(() => {
                    originalClick.call(this, e);
                }, 100);
                return false;
            }
            return true; // Allow default navigation
        };
    });

    // Add loading to form submissions
    document.querySelectorAll('form').forEach(form => {
        const originalSubmit = form.onsubmit;
        form.onsubmit = function(e) {
            showLoading('Processing...');
            if (originalSubmit) {
                return originalSubmit.call(this, e);
            }
            return true;
        };
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Hide loading screen once page is loaded
    if (document.getElementById('loadingScreen')) {
        // Delay hiding to ensure resources are loaded
        setTimeout(hideLoading, 500);
    }
    
    // Apply loading screen to navigation elements
    addLoadingToNavigation();
});

// Show loading on initial page load
window.addEventListener('load', function() {
    // Add loading screen to popstate events (browser back/forward)
    window.addEventListener('popstate', function() {
        showLoading('Loading Page...');
    });
});

// Show loading when leaving the page
window.addEventListener('beforeunload', function() {
    showLoading('Loading...');
}); 