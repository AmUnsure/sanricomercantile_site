// Toast notification functionality
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

// Function to show a confirmation dialog
// This is a placeholder that will be overridden by the custom implementation in profile.html
function showConfirm(message) {
    return confirm(message);
} 