class Auth {
    static googleRegister(idToken) {
        const payload = this.decodeGoogleToken(idToken);
        if (!payload.email) {
            return { success: false, message: 'Invalid Google token' };
        }

        const users = this.getUsers();
        if (users.find(user => user.email === payload.email)) {
            return { success: false, message: 'Email already registered' };
        }

        const username = payload.email.split('@')[0];
        const user = {
            id: Date.now(),
            fullName: payload.name || 'Google User',
            email: payload.email,
            username: username,
            createdAt: new Date().toISOString(),
            isGoogleAccount: true
        };

        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        this.setCurrentUser(user);
        return { success: true, message: 'Google registration successful' };
    }

    static googleLogin(idToken) {
        const payload = this.decodeGoogleToken(idToken);
        if (!payload.email) {
            return { success: false, message: 'Invalid Google token' };
        }

        const users = this.getUsers();
        const user = users.find(u => u.email === payload.email && u.isGoogleAccount);
        
        if (!user) {
            return { success: false, message: 'User not registered with Google' };
        }
        
        this.setCurrentUser(user);
        return { success: true, message: 'Google login successful' };
    }

    static decodeGoogleToken(idToken) {
        try {
            const base64Url = idToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('Error decoding Google token:', e);
            return {};
        }
    }

    static staffLogin(staffId, password) {
        // Hardcoded staff credentials
        if (staffId === 'admin' && password === 'admin123') {
            const staffUser = {
                id: 'admin',
                fullName: 'Admin Staff',
                staffId: staffId,
                isStaff: true,
                createdAt: new Date().toISOString()
            };
            this.setCurrentUser(staffUser);
            return { success: true, message: 'Staff login successful' };
        }
        
        return { success: false, message: 'Invalid staff ID or password' };
    }

    static logout() {
        console.log('Auth.logout called at:', new Date().toISOString());
        try {
            // First remove any user-specific data
            const currentUser = this.getCurrentUser();
            if (currentUser) {
                console.log('Logging out user:', currentUser.id);
                
                // Clear any user-specific cart
                const userId = currentUser.id;
                const cartKey = `cart_${userId}`;
                localStorage.removeItem(cartKey);
            }
            
            // Then clear the current user from localStorage
            localStorage.removeItem('currentUser');
            
            console.log('Current user after logout:', localStorage.getItem('currentUser'));
            return { success: true, message: 'Logout successful' };
        } catch (error) {
            console.error('Error during logout:', error);
            return { success: false, message: 'Logout failed due to an error: ' + error.message };
        }
    }

    static getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    }

    static setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    static getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    static isLoggedIn() {
        return !!this.getCurrentUser();
    }

    static updateUserDetails(userId, fullName, email) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return { success: false, message: 'User not found' };
        }

        if (users.some(u => u.email === email && u.id !== userId)) {
            return { success: false, message: 'Email already in use' };
        }

        users[userIndex].fullName = fullName;
        users[userIndex].email = email;
        users[userIndex].username = email.split('@')[0];
        localStorage.setItem('users', JSON.stringify(users));

        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            this.setCurrentUser(users[userIndex]);
        }

        return { success: true, message: 'Details updated successfully' };
    }

    static getUserAddress(userId) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.id === userId);
        return user?.address || '';
    }

    static getUserPhone(userId) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.id === userId);
        return user?.phoneNumber || '';
    }

    static updateUserProfile(userId, updates) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updates };
            if (updates.email) {
                users[userIndex].username = updates.email.split('@')[0];
            }
            localStorage.setItem('users', JSON.stringify(users));
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                this.setCurrentUser(users[userIndex]);
            }
        }
    }

    static addToCart(product) {
        if (!this.isLoggedIn()) {
            return { success: false, message: 'Please log in to add items to the cart.' };
        }
        const productWithCategory = {
            ...product,
            category: product.category || 'unknown'
        };
        const cart = new Cart();
        const result = cart.addItem(productWithCategory);
        this.updateCartCount();
        return result;
    }

    static getCartCount() {
        const cart = new Cart();
        return cart.items.reduce((total, item) => total + item.quantity, 0);
    }

    static updateCartCount() {
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            cartCountElement.textContent = this.getCartCount();
        }
        
        // Update cart tooltip with subtotal
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            const currentUser = this.getCurrentUser();
            const userId = currentUser ? currentUser.id : 'guest';
            const cartKey = `cart_${userId}`;
            
            try {
                const cartData = JSON.parse(localStorage.getItem(cartKey) || '{}');
                const items = cartData.items || [];
                const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                cartBtn.setAttribute('data-tooltip', `₱${subtotal.toFixed(2)}`);
            } catch (error) {
                console.error('Error calculating cart subtotal for tooltip:', error);
                cartBtn.setAttribute('data-tooltip', '₱0.00');
            }
        }
    }

    static getUserOrders(userId) {
        try {
            const userCarts = JSON.parse(localStorage.getItem('userCarts') || '{}');
            return userCarts[userId] || [];
        } catch (error) {
            console.error('Error parsing userCarts:', error);
            return [];
        }
    }

    static updateOrderPaymentDetails(userId, orderIndex, paymentUpdates) {
        try {
            const userCarts = JSON.parse(localStorage.getItem('userCarts') || '{}');
            if (userCarts[userId] && userCarts[userId][orderIndex]) {
                userCarts[userId][orderIndex].payment = {
                    ...userCarts[userId][orderIndex].payment,
                    ...paymentUpdates
                };
                localStorage.setItem('userCarts', JSON.stringify(userCarts));
                return { success: true, message: 'Payment details updated successfully' };
            }
            return { success: false, message: 'Order not found' };
        } catch (error) {
            console.error('Error updating order payment details:', error);
            return { success: false, message: 'Failed to update payment details' };
        }
    }

    static checkout(paymentDetails = {}, shippingDetails = {}) {
        if (!this.isLoggedIn()) {
            return { success: false, message: 'Please login to checkout.' };
        }
    
        const myCart = new Cart();
        if (myCart.items.length === 0) {
            return { success: false, message: 'Your cart is empty.' };
        }
    
        const currentUser = this.getCurrentUser();
        const order = {
            items: myCart.items,
            notes: myCart.notes,
            date: new Date().toISOString(),
            payment: paymentDetails,
            shipping: shippingDetails,
            status: 'Pending'
        };
    
        try {
            let userCarts = JSON.parse(localStorage.getItem('userCarts') || '{}');
            if (!userCarts[currentUser.id]) {
                userCarts[currentUser.id] = [];
            }
            userCarts[currentUser.id].push(order);
            localStorage.setItem('userCarts', JSON.stringify(userCarts));
            console.log('Order saved for user:', currentUser.id, 'Orders:', userCarts[currentUser.id]);
        } catch (error) {
            console.error('Error saving order to userCarts:', error);
            return { success: false, message: 'Checkout failed: Unable to save order.' };
        }
    
        if (shippingDetails.address || shippingDetails.phoneNumber) {
            this.updateUserProfile(currentUser.id, {
                address: shippingDetails.address,
                phoneNumber: shippingDetails.phoneNumber
            });
        }
    
        myCart.clearCart();
        return { success: true, message: 'Checkout successful! Order placed.' };
    }

    static redirectIfStaff() {
        if (this.isLoggedIn()) {
            const currentUser = this.getCurrentUser();
            if (currentUser.isStaff && !window.location.href.includes('staff-dashboard.html')) {
                window.location.href = 'staff-dashboard.html';
                return true;
            }
        }
        return false;
    }
}

class Cart {
    constructor() {
        const cartData = this.getCart();
        this.items = cartData.items || [];
        this.notes = cartData.notes || '';
        this.shipping = 150;
    }
    
    getCart() {
        // Get current user to associate cart with user
        const currentUser = Auth.getCurrentUser();
        const userId = currentUser ? currentUser.id : 'guest';
        const cartKey = `cart_${userId}`;
        
        const cartData = localStorage.getItem(cartKey);
        return cartData ? JSON.parse(cartData) : {};
    }
    
    saveCart() {
        const cartData = {
            items: this.items,
            notes: this.notes
        };
        
        // Save cart associated with current user
        const currentUser = Auth.getCurrentUser();
        const userId = currentUser ? currentUser.id : 'guest';
        const cartKey = `cart_${userId}`;
        
        localStorage.setItem(cartKey, JSON.stringify(cartData));
        Auth.updateCartCount();
    }
    
    addItem(product, quantity = 1) {
        console.log('Adding item to cart:', product, 'Quantity:', quantity);
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                ...product,
                quantity
            });
        }
        
        this.saveCart();
        console.log('Cart after adding item:', this.items);
        return { success: true, message: 'Product added to cart!' };
    }
    
    updateItem(productId, quantity) {
        const itemIndex = this.items.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
            if (quantity > 0) {
                this.items[itemIndex].quantity = quantity;
            } else {
                this.removeItem(productId);
                return;
            }
            
            this.saveCart();
            this.renderCart?.();
        }
    }
    
    updateQuantity(productId, quantity) {
        return this.updateItem(productId, quantity);
    }
    
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.renderCart?.();
    }
    
    clearCart() {
        this.items = [];
        this.notes = '';
        this.saveCart();
        this.renderCart?.();
    }
    
    calculateSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    calculateTotal() {
        const subtotal = this.calculateSubtotal();
        return subtotal + this.shipping;
    }
    
    getCartCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }
    
    getItems() {
        return this.items;
    }
}

function updateAccountButton() {
    console.log('updateAccountButton called');
    const loginBtn = document.getElementById('loginBtn');
    const cartBtn = document.getElementById('cartBtn');
    const currentUser = Auth.getCurrentUser();
    
    if (!loginBtn) {
        console.warn('Login button not found');
        return;
    }

    // Remove any existing click listeners
    const newBtn = loginBtn.cloneNode(true);
    loginBtn.parentNode.replaceChild(newBtn, loginBtn);

    if (currentUser) {
        // Logged in state
        newBtn.innerHTML = `
            <span class="profile-icon">👤</span>
            ${currentUser.fullName}
        `;
        newBtn.onclick = () => {
            if (currentUser.isStaff) {
                window.location.href = 'staff-dashboard.html';
            } else {
                window.location.href = 'profile.html';
            }
        };
        if (cartBtn) {
            if (currentUser.isStaff) {
                cartBtn.classList.add('hidden');
            } else {
                cartBtn.classList.remove('hidden');
                Auth.updateCartCount();
            }
        }
    } else {
        // Logged out state
        newBtn.innerHTML = `
            <span class="profile-icon">👤</span>
            Log In
        `;
        newBtn.onclick = () => {
            document.getElementById('loginModal').classList.add('show');
        };
        if (cartBtn) {
            cartBtn.classList.remove('hidden'); // Show cart for guest users
        }
    }

    // Add hover event listeners
    const profileIcon = newBtn.querySelector('.profile-icon');
    if (profileIcon) {
        newBtn.addEventListener('mouseenter', () => {
            profileIcon.textContent = '👥';
        });
        newBtn.addEventListener('mouseleave', () => {
            profileIcon.textContent = '👤';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing account button');
    updateAccountButton();
});