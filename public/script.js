// Products data
const products = [
    { id: 1, name: 'Smartphone', price: 699, image: 'images/products/smartphone.jpg', description: 'Latest model smartphone with amazing features' },
    { id: 2, name: 'Laptop', price: 999, image: 'images/products/laptop.jpg', description: 'Powerful laptop for work and gaming' },
    { id: 3, name: 'Headphones', price: 149, image: 'images/products/headphones.jpg', description: 'Premium wireless headphones' },
    { id: 4, name: 'Smart Watch', price: 299, image: 'images/products/smartwatch.jpg', description: 'Track your fitness and stay connected' },
    { id: 5, name: 'Camera', price: 599, image: 'images/products/camera.jpg', description: 'Capture memories with high quality' },
    { id: 6, name: 'Tablet', price: 449, image: 'images/products/tablet.jpg', description: 'Perfect for entertainment and work' },
    { id: 7, name: 'Speaker', price: 199, image: 'images/products/speaker.jpg', description: 'Powerful Bluetooth speaker' },
    { id: 8, name: 'Gaming Console', price: 499, image: 'images/products/gaming-console.jpg', description: 'Ultimate gaming experience' },
    { id: 9, name: 'T-Shirt', price: 29, image: 'images/products/t-shirt.jpg', description: 'Comfortable cotton t-shirt' },
    { id: 10, name: 'Sneakers', price: 89, image: 'images/products/sneakers.jpg', description: 'Trendy and comfortable sneakers' },
    { id: 11, name: 'Backpack', price: 59, image: 'images/products/backpack.jpg', description: 'Durable backpack for daily use' },
    { id: 12, name: 'Sunglasses', price: 39, image: 'images/products/sunglasses.jpg', description: 'Stylish UV protection sunglasses' }
];

// Cart
let cart = [];
let currentUser = null;

// Session timeout - 5 minutes (300000 ms)
const SESSION_TIMEOUT = 5 * 60 * 1000;
let sessionTimer = null;

// Reset session timer on user activity
function resetSessionTimer() {
    if (sessionTimer) clearTimeout(sessionTimer);
    if (currentUser) {
        sessionTimer = setTimeout(() => {
            logout();
            showPage('login');
            alert('Session expired. Please login again.');
        }, SESSION_TIMEOUT);
    }
}

// Initialize session activity listeners
function initSessionListeners() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
        document.addEventListener(event, resetSessionTimer, { passive: true });
    });

    // Handle browser/window close - clear session
    window.addEventListener('beforeunload', () => {
        if (currentUser) {
            localStorage.removeItem('user');
        }
    });

    // Handle page visibility (tab switch, minimize)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && currentUser) {
            // User switched tabs or minimized - pause timer
            if (sessionTimer) clearTimeout(sessionTimer);
        } else if (!document.hidden && currentUser) {
            // User returned - restart timer
            resetSessionTimer();
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    checkLoginStatus();
    initSessionListeners();
});

// Check login status
function checkLoginStatus() {
    const user = localStorage.getItem('user');
    if (user) {
        currentUser = JSON.parse(user);
        updateNavForLoggedIn();
    }
}

// Update navigation for logged in user
function updateNavForLoggedIn() {
    document.getElementById('nav-login').style.display = 'none';
    document.getElementById('nav-signup').style.display = 'none';
    document.getElementById('nav-logout').style.display = 'block';
    document.getElementById('nav-orders').style.display = 'block';
    const greeting = document.getElementById('user-greeting');
    greeting.style.display = 'inline';
    greeting.textContent = `Hi, ${currentUser.fullname}`;
    // Show cart icon after login
    document.getElementById('cart-icon').classList.remove('hidden');
}

// Logout
function logout() {
    if (sessionTimer) clearTimeout(sessionTimer);
    sessionTimer = null;
    localStorage.removeItem('user');
    currentUser = null;
    cart = [];
    updateCartCount();
    document.getElementById('nav-login').style.display = 'block';
    document.getElementById('nav-signup').style.display = 'block';
    document.getElementById('nav-logout').style.display = 'none';
    document.getElementById('nav-orders').style.display = 'none';
    document.getElementById('user-greeting').style.display = 'none';
    // Hide cart icon on logout
    document.getElementById('cart-icon').classList.add('hidden');
    showPage('home');
}

// Shop Now button handler
function handleShopNow() {
    if (currentUser) {
        showPage('products');
    } else {
        alert('Please login or sign up to view products');
        showPage('login');
    }
}

// Page navigation
function showPage(pageId) {
    // For products page, check if user is logged in
    if (pageId === 'products' && !currentUser) {
        alert('Please login or sign up to view products');
        showPage('login');
        return;
    }

    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });

    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        if (pageId === 'products') {
            document.getElementById('products').style.display = 'block';
        } else {
            targetPage.style.display = 'block';
        }
    }
    window.scrollTo(0, 0);
}

// Load products
function loadProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.parentElement.textContent='${product.name}'">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="description">${product.description}</p>
                <p class="price">$${product.price}</p>
                <div class="product-qty">
                    <button class="qty-btn" onclick="changeProductQty(${product.id}, -1)">-</button>
                    <span id="qty-${product.id}" class="qty-value">0</span>
                    <button class="qty-btn" onclick="changeProductQty(${product.id}, 1)">+</button>
                </div>
                <button class="btn-add-cart" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

// Product quantity controls
const productQtys = {};

function changeProductQty(productId, change) {
    if (!productQtys[productId]) productQtys[productId] = 0;
    productQtys[productId] += change;
    if (productQtys[productId] < 0) productQtys[productId] = 0;
    document.getElementById(`qty-${productId}`).textContent = productQtys[productId];
}

// Cart functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const qty = productQtys[productId] || 0;

    if (qty === 0) {
        alert('Please select at least 1 item');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += qty;
    } else {
        cart.push({ ...product, quantity: qty });
    }

    // Reset product quantity to 0 after adding
    productQtys[productId] = 0;
    document.getElementById(`qty-${productId}`).textContent = 0;

    updateCartCount();
    alert(`${product.name} (x${qty}) added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
    updateCartCount();
}

function incrementQty(productId) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity++;
        updateCartDisplay();
        updateCartCount();
    }
}

function decrementQty(productId) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        if (item.quantity > 1) {
            item.quantity--;
        } else {
            cart = cart.filter(i => i.id !== productId);
        }
        updateCartDisplay();
        updateCartCount();
    }
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
    updateCartDisplay();
}

function showOrderHistory() {
    if (!currentUser) {
        alert('Please login to view your orders');
        showPage('login');
        return;
    }
    toggleOrderHistory();
    loadOrderHistory();
}

function toggleOrderHistory() {
    const modal = document.getElementById('order-history-modal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

async function loadOrderHistory() {
    const orderItems = document.getElementById('order-history-items');

    try {
        const response = await fetch(`/api/my-orders?userId=${currentUser.id}`);
        const data = await response.json();

        if (response.ok && data.orders && data.orders.length > 0) {
            orderItems.innerHTML = data.orders.map(order => {
                const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                const itemsList = order.order_data.map(item =>
                    `<div class="order-item-row">
                        <span><img src="${item.image}" alt="${item.name}" class="order-item-icon" onerror="this.style.display='none'"></span>
                        <span>${item.name}</span>
                        <span>x${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>`
                ).join('');
                return `
                    <div class="order-card">
                        <div class="order-header">
                            <span class="order-id">Order #${order.id}</span>
                            <span class="order-date">${orderDate}</span>
                        </div>
                        <div class="order-items">
                            ${itemsList}
                        </div>
                        <div class="order-total">
                            <strong>Total: $${order.total_amount.toFixed(2)}</strong>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            orderItems.innerHTML = '<p style="text-align: center; color: #666;">No orders yet</p>';
        }
    } catch (error) {
        orderItems.innerHTML = '<p style="text-align: center; color: #666;">Error loading orders</p>';
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartItemsCount = document.getElementById('cart-items-count');

    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666;">Your cart is empty</p>';
        cartTotal.textContent = '0.00';
        cartItemsCount.textContent = '0';
        return;
    }

    let total = 0;
    let itemCount = 0;
    cartItems.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        itemCount += item.quantity;
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4><img src="${item.image}" alt="${item.name}" class="cart-item-icon" onerror="this.style.display='none'"> ${item.name}</h4>
                    <p>$${item.price} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}</p>
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="decrementQty(${item.id})">-</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-btn" onclick="incrementQty(${item.id})">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `;
    }).join('');

    cartTotal.textContent = total.toFixed(2);
    cartItemsCount.textContent = itemCount;
}

async function checkout() {
    if (!currentUser) {
        alert('Please login to checkout');
        showPage('login');
        return;
    }

    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                total: total,
                cart: cart
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Thank you for your purchase!\nTotal: $${total.toFixed(2)}\n\nOrder placed successfully!`);
            cart = [];
            updateCartCount();
            updateCartDisplay();
            toggleCart();
        } else {
            alert('Error placing order');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Form handlers
document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const fullname = this.querySelectorAll('input[type="text"]')[0].value;
    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelectorAll('input[type="password"]')[0].value;
    const confirmPassword = this.querySelectorAll('input[type="password"]')[1].value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullname, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Account created successfully! Please login.');
            this.reset();
            showPage('login');
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelector('input[type="password"]').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(data.user));
            resetSessionTimer(); // Start session timer on login
            updateNavForLoggedIn();
            this.reset();
            showPage('products');
            alert(`Welcome back, ${data.user.fullname}!`);
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Close cart when clicking outside
document.getElementById('cart-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        toggleCart();
    }
});

// Close order history when clicking outside
document.getElementById('order-history-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        toggleOrderHistory();
    }
});