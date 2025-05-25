// Night mode functionality
let logoClickCount = 0;

function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    
    if (!toast) {
        console.error('Toast element not found. Make sure you have a div with id="toast" in your HTML.');
        // Fallback to alert if toast element isn't available
        alert(message);
        return;
    }
    
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

function toggleNightMode() {
    console.log('toggleNightMode called');
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const newMode = isDarkMode ? 'light' : 'dark';
    
    // Set the theme
    document.documentElement.setAttribute('data-theme', newMode);
    localStorage.setItem('nightMode', newMode);
    
    // Show notification
    showToast(isDarkMode ? '☀️ Light mode activated' : '🌙 Dark mode activated');
    
    console.log(`Theme toggled to: ${newMode}`);
}

// We don't need to set the initial theme here, as it's already set in the HTML head
// This was causing a conflict with the inline script in the HTML
// const savedMode = localStorage.getItem('nightMode');
// const currentPage = window.location.pathname;
// if (!currentPage.includes('staff-dashboard')) {
//     document.documentElement.setAttribute('data-theme', !savedMode || savedMode === 'dark' ? 'dark' : 'light');
// }

// Initialize night mode toggle functionality
function initNightMode() {
    const currentPage = window.location.pathname;
    console.log(`Current page: ${currentPage}`);
    
    if (currentPage.includes('staff-dashboard')) {
        console.log('Staff dashboard detected, skipping night mode toggle');
        return;
    }

    const nightModeToggle = document.getElementById('nightModeToggle');
    if (!nightModeToggle) {
        console.error('Night mode toggle not found on page! Make sure you have an element with id="nightModeToggle"');
        return;
    }

    console.log('Night mode toggle initialized');
    
    // Add JavaScript tooltip functionality
    nightModeToggle.addEventListener('mouseenter', function() {
        // Check if a tooltip div already exists
        if (!document.getElementById('nightModeTooltip')) {
            const tooltip = document.createElement('div');
            tooltip.id = 'nightModeTooltip';
            tooltip.innerText = 'Click to toggle dark/light mode';
            tooltip.style.position = 'absolute';
            tooltip.style.backgroundColor = '#333';
            tooltip.style.color = 'white';
            tooltip.style.padding = '5px 10px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.fontSize = '12px';
            tooltip.style.zIndex = '9999';
            tooltip.style.whiteSpace = 'nowrap';
            tooltip.style.bottom = '-30px';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translateX(-50%)';
            tooltip.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            
            // Add tooltip to the document
            nightModeToggle.parentNode.appendChild(tooltip);
        } else {
            document.getElementById('nightModeTooltip').style.display = 'block';
        }
    });
    
    nightModeToggle.addEventListener('mouseleave', function() {
        const tooltip = document.getElementById('nightModeTooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    });
    
    // Clear any previous event listeners by cloning and replacing
    const newToggle = nightModeToggle.cloneNode(true);
    nightModeToggle.parentNode.replaceChild(newToggle, nightModeToggle);
    
    // Add click event listener
    newToggle.addEventListener('click', function(e) {
        console.log('Night mode toggle clicked');
        e.preventDefault();
        e.stopPropagation();
        toggleNightMode();
    });
    
    // Re-add tooltip listeners to the new toggle
    newToggle.addEventListener('mouseenter', function() {
        if (!document.getElementById('nightModeTooltip')) {
            const tooltip = document.createElement('div');
            tooltip.id = 'nightModeTooltip';
            tooltip.innerText = 'Click to toggle dark/light mode';
            tooltip.style.position = 'absolute';
            tooltip.style.backgroundColor = '#333';
            tooltip.style.color = 'white';
            tooltip.style.padding = '5px 10px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.fontSize = '12px';
            tooltip.style.zIndex = '9999';
            tooltip.style.whiteSpace = 'nowrap';
            tooltip.style.bottom = '-30px';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translateX(-50%)';
            tooltip.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            
            // Add tooltip to the document
            newToggle.parentNode.appendChild(tooltip);
        } else {
            document.getElementById('nightModeTooltip').style.display = 'block';
        }
    });
    
    newToggle.addEventListener('mouseleave', function() {
        const tooltip = document.getElementById('nightModeTooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initNightMode);

// Add global access to toggle function
window.toggleNightMode = toggleNightMode; 