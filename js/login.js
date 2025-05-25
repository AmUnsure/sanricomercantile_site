// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const modalClose = document.getElementById('modalClose');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Only set up event listeners if elements exist
    if (loginBtn && loginModal && modalClose) {
        loginBtn.addEventListener('click', () => {
            if (Auth.isLoggedIn()) {
                const currentUser = Auth.getCurrentUser();
                if (currentUser.isStaff) {
                    window.location.href = 'staff-dashboard.html';
                } else {
                    window.location.href = 'profile.html';
                }
            } else {
                loginModal.classList.add('show');
                activateTab('user-login');
            }
        });

        modalClose.addEventListener('click', () => {
            loginModal.classList.remove('show');
        });

        window.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.classList.remove('show');
            }
        });
    }

    // Tab functionality
    if (tabButtons.length > 0 && tabContents.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const activeContent = document.querySelector('.tab-content.active');
                if (activeContent) {
                    const currentTabId = activeContent.id;
                    const newTabId = button.dataset.tab;
                    
                    if (currentTabId !== newTabId) {
                        activateTab(newTabId);
                    }
                }
            });
        });
    }

    // Staff login functionality
    const staffLoginBtn = document.getElementById('staffLoginSubmitBtn');
    const staffIdInput = document.getElementById('staff-id');
    const staffPasswordInput = document.getElementById('staff-password');
    
    if (staffLoginBtn) {
        // Function to handle the staff login submission
        const handleStaffLogin = () => {
            const staffId = staffIdInput?.value;
            const password = staffPasswordInput?.value;
            
            if (!staffId || !password) {
                showToast('Please enter both staff ID and password');
                return;
            }
            
            const result = Auth.staffLogin(staffId, password);
            
            if (result.success) {
                updateAccountButton();
                loginModal.classList.remove('show');
                // Redirect immediately to staff dashboard without delay
                window.location.href = 'staff-dashboard.html';
            } else {
                showToast(result.message);
    }
        };
        
        // Click event for the login button
        staffLoginBtn.addEventListener('click', handleStaffLogin);
        
        // Add keypress event listeners to input fields
        if (staffIdInput && staffPasswordInput) {
            // Handle Enter key press in staff ID field
            staffIdInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    if (!staffPasswordInput.value) {
                        // If password is empty, focus on password field
                        staffPasswordInput.focus();
                    } else {
                        // If password has a value, submit the form
                        handleStaffLogin();
                    }
                }
            });
            
            // Handle Enter key press in password field
            staffPasswordInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    handleStaffLogin();
                }
            });
        }
    }

    // Initialize tab indicator position
    const activeButton = document.querySelector('.tab-btn.active');
    if (activeButton) {
        const buttonWidth = activeButton.offsetWidth;
        const buttonOffsetLeft = activeButton.offsetLeft;
        const tabButtonsContainer = document.querySelector('.tab-buttons');
        
        if (tabButtonsContainer) {
            tabButtonsContainer.style.setProperty('--tab-width', `${buttonWidth}px`);
            tabButtonsContainer.style.setProperty('--tab-offset', `${buttonOffsetLeft}px`);
        }

        // Initialize with the active tab content
        const activeTabId = activeButton.dataset.tab;
        if (activeTabId) {
            activateTab(activeTabId);
        }
    }
});

// Helper Functions
function activateTab(tabId) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const activeButton = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    const tabButtonsContainer = document.querySelector('.tab-buttons');
    const modalContent = document.querySelector('.modal-content');
    const activeContent = document.getElementById(tabId);

    if (!activeButton || !tabButtonsContainer || !modalContent || !activeContent) {
        console.error('Required elements not found for tab activation');
        return;
    }

    // Remove active class from all tabs and buttons
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    // Add active class to selected tab and button
    activeButton.classList.add('active');
    activeContent.classList.add('active');

    // Update the indicator position
    const buttonWidth = activeButton.offsetWidth;
    const buttonOffsetLeft = activeButton.offsetLeft;
    
    tabButtonsContainer.style.setProperty('--tab-width', `${buttonWidth}px`);
    tabButtonsContainer.style.setProperty('--tab-offset', `${buttonOffsetLeft}px`);

    // Animate modal height transition
    requestAnimationFrame(() => {
        const contentHeight = activeContent.offsetHeight;
        const headerHeight = 100; // Approximate height of modal header elements
        const extraPadding = 40;  // Extra padding for better appearance
        modalContent.style.height = `${contentHeight + headerHeight + extraPadding}px`;
        
        // Reset to auto height after animation completes
        setTimeout(() => {
            modalContent.style.height = '';
        }, 300); // Match this to the CSS transition time
    });
}

// Google Sign-In handler
function handleGoogleSignIn(response) {
    console.log('Google Sign-In Response:', response);
    const idToken = response.credential;
    if (!idToken) {
        console.error('No idToken received');
        showToast('Google Sign-In failed: No token received');
        return;
    }

    // Try login first
    let result = Auth.googleLogin(idToken);
    console.log('Login Result:', result);
    if (!result.success && result.message.includes("not registered")) {
        // If login fails due to user not existing, attempt registration
        result = Auth.googleRegister(idToken);
        console.log('Registration Result:', result);
    }
    showToast(result.message);
    if (result.success) {
        updateAccountButton();
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.classList.remove('show');
        }
        // Refresh the page to update all components
        window.location.reload();
    }
}

function updateAccountButton() {
    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) return;

    // Remove any existing click listeners
    const newBtn = loginBtn.cloneNode(true);
    loginBtn.parentNode.replaceChild(newBtn, loginBtn);
    
    if (Auth.isLoggedIn()) {
        const currentUser = Auth.getCurrentUser();
        newBtn.addEventListener('click', () => {
            if (currentUser.isStaff) {
                window.location.href = 'staff-dashboard.html';
            } else {
                window.location.href = 'profile.html';
            }
        });
        newBtn.textContent = currentUser.isStaff ? 'Staff Dashboard' : 'My Account';
    } else {
        newBtn.textContent = 'Log In';
        newBtn.addEventListener('click', () => {
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.classList.add('show');
            }
        });
    }

    // Update cart button visibility
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        if (Auth.isLoggedIn() && !Auth.getCurrentUser().isStaff) {
            cartBtn.classList.remove('hidden');
            Auth.updateCartCount();
        } else {
            cartBtn.classList.add('hidden');
        }
    }
}