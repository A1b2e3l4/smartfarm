/**
 * SmartFarm Admin Panel - JavaScript
 * 
 * Handles all admin panel functionality:
 * - Authentication
 * - Navigation
 * - Data fetching and display
 * - User/Crop/Order management
 */

// API Configuration
const API_URL = 'https://your-smartfarm-backend.onrender.com/api';

// State
let currentUser = null;
let authToken = localStorage.getItem('adminToken');
let currentPage = 'home';
let usersData = [];
let cropsData = [];
let ordersData = [];

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.querySelector('.sidebar');
const logoutBtn = document.getElementById('logout-btn');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        validateToken();
    }
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);

    // Navigation
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateToPage(page);
        });
    });

    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Logout
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });

    // Modal close
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Search inputs
    document.getElementById('user-search')?.addEventListener('input', debounce(filterUsers, 300));
    document.getElementById('crop-search')?.addEventListener('input', debounce(filterCrops, 300));
    document.getElementById('order-search')?.addEventListener('input', debounce(filterOrders, 300));

    // Filter buttons
    setupFilterButtons('users', filterUsersByRole);
    setupFilterButtons('crops', filterCropsByStatus);
    setupFilterButtons('orders', filterOrdersByStatus);
}

// Authentication
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            if (data.data.user.role !== 'admin') {
                loginError.textContent = 'Access denied. Admin only.';
                return;
            }

            authToken = data.data.token;
            currentUser = data.data.user;
            localStorage.setItem('adminToken', authToken);
            
            showDashboard();
            loadDashboardData();
        } else {
            loginError.textContent = data.message || 'Login failed';
        }
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = 'Network error. Please try again.';
    }
}

async function validateToken() {
    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.role === 'admin') {
                currentUser = data.data;
                showDashboard();
                loadDashboardData();
            } else {
                handleLogout();
            }
        } else {
            handleLogout();
        }
    } catch (error) {
        console.error('Token validation error:', error);
        handleLogout();
    }
}

function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('adminToken');
    loginScreen.classList.remove('hidden');
    dashboard.classList.add('hidden');
    loginForm.reset();
}

function showDashboard() {
    loginScreen.classList.add('hidden');
    dashboard.classList.remove('hidden');
    
    // Update admin info
    document.getElementById('admin-name').textContent = currentUser?.name || 'Admin';
    if (currentUser?.profile_image) {
        document.getElementById('admin-avatar').src = currentUser.profile_image;
    }
}

// Navigation
function navigateToPage(page) {
    currentPage = page;
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');

    // Show active page
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    document.getElementById(`page-${page}`)?.classList.add('active');

    // Close mobile sidebar
    sidebar.classList.remove('open');

    // Load page data
    switch (page) {
        case 'home':
            loadDashboardData();
            break;
        case 'users':
            loadUsers();
            break;
        case 'farmers':
            loadFarmers();
            break;
        case 'buyers':
            loadBuyers();
            break;
        case 'crops':
            loadCrops();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'analytics':
            loadAnalytics();
            break;
    }
}

// API Helper
async function apiCall(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const config = {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        return await response.json();
    } catch (error) {
        console.error('API error:', error);
        return { success: false, message: 'Network error' };
    }
}

// Dashboard Data
async function loadDashboardData() {
    const response = await apiCall('/dashboard');
    
    if (response.success) {
        const data = response.data;
        
        // Update stats
        document.getElementById('stat-total-users').textContent = 
            (parseInt(data.summary?.total_farmers || 0) + parseInt(data.summary?.total_buyers || 0)).toLocaleString();
        document.getElementById('stat-total-farmers').textContent = parseInt(data.summary?.total_farmers || 0).toLocaleString();
        document.getElementById('stat-total-buyers').textContent = parseInt(data.summary?.total_buyers || 0).toLocaleString();
        document.getElementById('stat-total-crops').textContent = parseInt(data.summary?.total_crops || 0).toLocaleString();
        document.getElementById('stat-total-orders').textContent = parseInt(data.summary?.total_orders || 0).toLocaleString();
        document.getElementById('stat-total-revenue').textContent = 
            `$${parseFloat(data.summary?.total_revenue || 0).toLocaleString()}`;

        // Update recent orders
        updateRecentOrdersTable(data.recent_orders || []);
        
        // Update top crops
        updateTopCropsList(data.top_crops || []);
    }
}

function updateRecentOrdersTable(orders) {
    const tbody = document.getElementById('recent-orders-table');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No recent orders</td></tr>';
        return;
    }

    tbody.innerHTML = orders.slice(0, 5).map(order => `
        <tr>
            <td>#${order.id.slice(-6)}</td>
            <td>${order.crop_name}</td>
            <td>${order.buyer_name}</td>
            <td>$${parseFloat(order.total_price).toFixed(2)}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
        </tr>
    `).join('');
}

function updateTopCropsList(crops) {
    const container = document.getElementById('top-crops-list');
    
    if (crops.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No crops data available</p></div>';
        return;
    }

    container.innerHTML = crops.slice(0, 5).map((crop, index) => `
        <div class="top-crop-item">
            <div class="top-crop-rank">${index + 1}</div>
            <div class="top-crop-info">
                <div class="top-crop-name">${crop.crop_name}</div>
                <div class="top-crop-farmer">${crop.farmer_name}</div>
            </div>
            <div class="top-crop-stats">
                <div class="top-crop-revenue">$${parseFloat(crop.total_revenue || 0).toFixed(2)}</div>
                <div class="top-crop-orders">${crop.order_count} orders</div>
            </div>
        </div>
    `).join('');
}

// Users
async function loadUsers() {
    const response = await apiCall('/admin/users?limit=100');
    
    if (response.success) {
        usersData = response.data.users;
        renderUsersTable(usersData);
    }
}

function renderUsersTable(users) {
    const tbody = document.getElementById('users-table');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No users found</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>
                <div class="user-avatar">
                    ${user.profile_image 
                        ? `<img src="${user.profile_image}" alt="${user.name}">`
                        : `<div class="avatar-placeholder">${user.name.charAt(0).toUpperCase()}</div>`
                    }
                    <div class="user-info">
                        <span class="user-name">${user.name}</span>
                        <span class="user-email">${user.email}</span>
                    </div>
                </div>
            </td>
            <td>${user.email}</td>
            <td><span class="status-badge status-${user.role}">${user.role}</span></td>
            <td><span class="status-badge status-${user.status}">${user.status}</span></td>
            <td>${new Date(user.created_at).toLocaleDateString()}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-primary" onclick="viewUser('${user.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn ${user.status === 'active' ? 'btn-danger' : 'btn-success'}" 
                            onclick="toggleUserStatus('${user.id}', '${user.status}')">
                        <i class="fas fa-${user.status === 'active' ? 'ban' : 'check'}"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterUsers(e) {
    const query = e.target.value.toLowerCase();
    const filtered = usersData.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
    renderUsersTable(filtered);
}

function filterUsersByRole(role) {
    if (role === 'all') {
        renderUsersTable(usersData);
    } else {
        const filtered = usersData.filter(user => user.role === role);
        renderUsersTable(filtered);
    }
}

// Farmers
async function loadFarmers() {
    const response = await apiCall('/admin/users?role=farmer&limit=100');
    
    if (response.success) {
        const farmers = response.data.users;
        const tbody = document.getElementById('farmers-table');
        
        tbody.innerHTML = farmers.map(farmer => `
            <tr>
                <td>
                    <div class="user-avatar">
                        ${farmer.profile_image 
                            ? `<img src="${farmer.profile_image}" alt="${farmer.name}">`
                            : `<div class="avatar-placeholder">${farmer.name.charAt(0).toUpperCase()}</div>`
                        }
                        <div class="user-info">
                            <span class="user-name">${farmer.name}</span>
                            <span class="user-email">${farmer.email}</span>
                        </div>
                    </div>
                </td>
                <td>${farmer.email}</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn btn-primary" onclick="viewUser('${farmer.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// Buyers
async function loadBuyers() {
    const response = await apiCall('/admin/users?role=buyer&limit=100');
    
    if (response.success) {
        const buyers = response.data.users;
        const tbody = document.getElementById('buyers-table');
        
        tbody.innerHTML = buyers.map(buyer => `
            <tr>
                <td>
                    <div class="user-avatar">
                        ${buyer.profile_image 
                            ? `<img src="${buyer.profile_image}" alt="${buyer.name}">`
                            : `<div class="avatar-placeholder">${buyer.name.charAt(0).toUpperCase()}</div>`
                        }
                        <div class="user-info">
                            <span class="user-name">${buyer.name}</span>
                            <span class="user-email">${buyer.email}</span>
                        </div>
                    </div>
                </td>
                <td>${buyer.email}</td>
                <td>-</td>
                <td>-</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn btn-primary" onclick="viewUser('${buyer.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// Crops
async function loadCrops() {
    const response = await apiCall('/crops?limit=100');
    
    if (response.success) {
        cropsData = response.data.crops;
        renderCropsTable(cropsData);
    }
}

function renderCropsTable(crops) {
    const tbody = document.getElementById('crops-table');
    
    if (crops.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No crops found</td></tr>';
        return;
    }

    tbody.innerHTML = crops.map(crop => `
        <tr>
            <td>
                <div class="user-avatar">
                    ${crop.image 
                        ? `<img src="${crop.image}" alt="${crop.name}">`
                        : `<div class="avatar-placeholder">🌾</div>`
                    }
                    <div class="user-info">
                        <span class="user-name">${crop.name}</span>
                        <span class="user-email">${crop.category}</span>
                    </div>
                </div>
            </td>
            <td>${crop.category}</td>
            <td>${crop.farmer_name}</td>
            <td>$${parseFloat(crop.price).toFixed(2)}</td>
            <td>${crop.quantity} ${crop.unit}</td>
            <td><span class="status-badge status-${crop.status}">${crop.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-primary" onclick="viewCrop('${crop.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn btn-danger" onclick="deleteCrop('${crop.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterCrops(e) {
    const query = e.target.value.toLowerCase();
    const filtered = cropsData.filter(crop => 
        crop.name.toLowerCase().includes(query) ||
        crop.category.toLowerCase().includes(query)
    );
    renderCropsTable(filtered);
}

function filterCropsByStatus(status) {
    if (status === 'all') {
        renderCropsTable(cropsData);
    } else {
        const filtered = cropsData.filter(crop => crop.status === status);
        renderCropsTable(filtered);
    }
}

// Orders
async function loadOrders() {
    const response = await apiCall('/orders?limit=100');
    
    if (response.success) {
        ordersData = response.data.orders;
        renderOrdersTable(ordersData);
    }
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById('orders-table');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No orders found</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.id.slice(-6)}</td>
            <td>${order.crop_name}</td>
            <td>${order.buyer_name}</td>
            <td>${order.farmer_name}</td>
            <td>${order.quantity} ${order.unit}</td>
            <td>$${parseFloat(order.total_price).toFixed(2)}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-primary" onclick="viewOrder('${order.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${order.status === 'pending' ? `
                        <button class="action-btn btn-success" onclick="updateOrderStatus('${order.id}', 'accepted')">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function filterOrders(e) {
    const query = e.target.value.toLowerCase();
    const filtered = ordersData.filter(order => 
        order.crop_name.toLowerCase().includes(query) ||
        order.buyer_name.toLowerCase().includes(query) ||
        order.farmer_name.toLowerCase().includes(query)
    );
    renderOrdersTable(filtered);
}

function filterOrdersByStatus(status) {
    if (status === 'all') {
        renderOrdersTable(ordersData);
    } else {
        const filtered = ordersData.filter(order => order.status === status);
        renderOrdersTable(filtered);
    }
}

// Analytics
async function loadAnalytics() {
    const response = await apiCall('/admin/stats');
    
    if (response.success) {
        const data = response.data;
        document.getElementById('analytics-orders-today').textContent = 
            data.summary?.total_orders || 0;
        document.getElementById('analytics-revenue-today').textContent = 
            `$${parseFloat(data.summary?.total_revenue || 0).toLocaleString()}`;
    }
}

// Actions
async function viewUser(userId) {
    const response = await apiCall(`/admin/users/${userId}`);
    
    if (response.success) {
        const user = response.data;
        showModal('User Details', `
            <div class="user-detail">
                <p><strong>Name:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Role:</strong> ${user.role}</p>
                <p><strong>Status:</strong> ${user.status}</p>
                <p><strong>Phone:</strong> ${user.phone || 'N/A'}</p>
                <p><strong>Address:</strong> ${user.address || 'N/A'}</p>
                <p><strong>Joined:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
            </div>
        `);
    }
}

async function toggleUserStatus(userId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const action = currentStatus === 'active' ? 'suspend' : 'activate';
    
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    const response = await apiCall(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
    });

    if (response.success) {
        loadUsers();
    } else {
        alert('Failed to update user status');
    }
}

async function viewCrop(cropId) {
    const response = await apiCall(`/crops/${cropId}`);
    
    if (response.success) {
        const crop = response.data;
        showModal('Crop Details', `
            <div class="crop-detail">
                <p><strong>Name:</strong> ${crop.name}</p>
                <p><strong>Category:</strong> ${crop.category}</p>
                <p><strong>Price:</strong> $${parseFloat(crop.price).toFixed(2)} per ${crop.unit}</p>
                <p><strong>Quantity:</strong> ${crop.quantity} ${crop.unit}</p>
                <p><strong>Status:</strong> ${crop.status}</p>
                <p><strong>Farmer:</strong> ${crop.farmer_name}</p>
                <p><strong>Description:</strong> ${crop.description || 'N/A'}</p>
            </div>
        `);
    }
}

async function deleteCrop(cropId) {
    if (!confirm('Are you sure you want to delete this crop?')) return;

    const response = await apiCall(`/crops/${cropId}`, {
        method: 'DELETE'
    });

    if (response.success) {
        loadCrops();
    } else {
        alert('Failed to delete crop');
    }
}

async function viewOrder(orderId) {
    const response = await apiCall(`/orders/${orderId}`);
    
    if (response.success) {
        const order = response.data;
        showModal('Order Details', `
            <div class="order-detail">
                <p><strong>Order ID:</strong> #${order.id.slice(-6)}</p>
                <p><strong>Crop:</strong> ${order.crop_name}</p>
                <p><strong>Buyer:</strong> ${order.buyer_name}</p>
                <p><strong>Farmer:</strong> ${order.farmer_name}</p>
                <p><strong>Quantity:</strong> ${order.quantity} ${order.unit}</p>
                <p><strong>Total:</strong> $${parseFloat(order.total_price).toFixed(2)}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status}</span></p>
                <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
            </div>
        `);
    }
}

async function updateOrderStatus(orderId, status) {
    const response = await apiCall(`/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    });

    if (response.success) {
        loadOrders();
    } else {
        alert('Failed to update order status');
    }
}

// Modal
function showModal(title, content) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
}

// Filter Buttons
function setupFilterButtons(page, callback) {
    const container = document.querySelector(`#page-${page} .filter-buttons`);
    if (!container) return;

    container.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            callback(btn.dataset.filter);
        });
    });
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make functions globally accessible for onclick handlers
window.viewUser = viewUser;
window.toggleUserStatus = toggleUserStatus;
window.viewCrop = viewCrop;
window.deleteCrop = deleteCrop;
window.viewOrder = viewOrder;
window.updateOrderStatus = updateOrderStatus;
