// Main JavaScript file for LPU Market

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load page-specific content
    loadPageContent();
});

// Initialize the application
function initializeApp() {
    // Update navigation based on auth state
    Auth.updateNavigation();
    
    // Set up mobile menu
    setupMobileMenu();
    
    // Set up search functionality
    setupSearch();
    
    // Set up theme toggle if exists
    setupThemeToggle();
}

// Set up event listeners
function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuToggle = Utils.DOM.select('#mobileMenuToggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Form submissions
    const loginForm = Utils.DOM.select('#loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', AuthForms.handleLogin);
        AuthForms.addValidation();
    }

    const registerForm = Utils.DOM.select('#registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', AuthForms.handleRegister);
        AuthForms.addValidation();
    }

    const productForm = Utils.DOM.select('#productForm');
    if (productForm) {
        productForm.addEventListener('submit', ProductUI.handleProductForm);
        setupProductFormValidation();
    }

    // Search form
    const searchForm = Utils.DOM.select('#searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }

    // Contact form
    const contactForm = Utils.DOM.select('#contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }

    // Image upload preview
    const imageInput = Utils.DOM.select('#productImage');
    if (imageInput) {
        imageInput.addEventListener('change', handleImagePreview);
    }

    // Category filter
    const categoryFilter = Utils.DOM.select('#categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleCategoryFilter);
    }
}

// Load page-specific content
function loadPageContent() {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch (currentPage) {
        case 'index.html':
        case '':
            loadHomePage();
            break;
        case 'category.html':
            loadCategoryPage();
            break;
        case 'product-details.html':
            loadProductDetailsPage();
            break;
        case 'profile.html':
            loadProfilePage();
            break;
        case 'post-product.html':
            loadPostProductPage();
            break;
    }
}

// Load home page content
function loadHomePage() {
    ProductUI.loadFeaturedProducts();
}

// Load category page content
function loadCategoryPage() {
    const category = Utils.URL.getParam('cat');
    const categoryTitle = Utils.DOM.select('#categoryTitle');
    
    if (categoryTitle) {
        const displayName = category ? 
            Products.getCategoryDisplayName(category) : 
            'All Products';
        categoryTitle.textContent = displayName;
    }
    
    ProductUI.loadCategoryProducts(category);
    setupCategoryFilters();
}

// Load product details page
function loadProductDetailsPage() {
    const productId = Utils.URL.getParam('id');
    if (!productId) {
        Utils.Notification.error('Product not found');
        window.location.href = 'category.html';
        return;
    }

    const product = Products.getProductById(productId);
    if (!product) {
        Utils.Notification.error('Product not found');
        window.location.href = 'category.html';
        return;
    }

    displayProductDetails(product);
}

// Load profile page
function loadProfilePage() {
    if (!Auth.requireAuth()) return;
    
    const currentUser = Auth.getCurrentUser();
    const userProducts = Products.getProductsBySeller(currentUser.id);
    
    // Display user info
    const userInfo = Utils.DOM.select('#userInfo');
    if (userInfo) {
        userInfo.innerHTML = `
            <h2>Welcome, ${currentUser.name}!</h2>
            <p>Email: ${currentUser.email}</p>
            <p>Member since: ${Utils.DateHelper.format(currentUser.createdAt)}</p>
        `;
    }
    
    // Display user products
    const userProductsContainer = Utils.DOM.select('#userProducts');
    if (userProductsContainer) {
        if (userProducts.length === 0) {
            userProductsContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No products posted yet</h3>
                    <p>Start selling by posting your first product!</p>
                    <a href="post-product.html" class="btn btn-primary">Post Product</a>
                </div>
            `;
        } else {
            userProductsContainer.innerHTML = '';
            userProducts.forEach(product => {
                const card = createUserProductCard(product);
                userProductsContainer.appendChild(card);
            });
        }
    }
}

// Load post product page
function loadPostProductPage() {
    if (!Auth.requireAuth()) return;
}

// Display product details
function displayProductDetails(product) {
    const container = Utils.DOM.select('#productDetails');
    if (!container) return;

    container.innerHTML = `
        <div class="product-details-container">
            <div class="product-image-large">
                ${product.image ? 
                    `<img src="${product.image}" alt="${product.title}">` :
                    `<div class="placeholder-large">${Utils.ImageHelper.getPlaceholder(product.category)}</div>`
                }
            </div>
            <div class="product-info-detailed">
                <h1>${product.title}</h1>
                <div class="product-price-large">${Utils.NumberHelper.formatPrice(product.price)}</div>
                <div class="product-meta">
                    <span class="category">Category: ${Products.getCategoryDisplayName(product.category)}</span>
                    <span class="date">Posted: ${Utils.DateHelper.timeAgo(product.createdAt)}</span>
                </div>
                <div class="product-description">
                    <h3>Description</h3>
                    <p>${product.description}</p>
                </div>
                <div class="seller-info">
                    <h3>Seller Information</h3>
                    <p><strong>Name:</strong> ${product.sellerName}</p>
                    <button class="btn btn-primary" onclick="contactSeller('${product.sellerId}')">
                        Contact Seller
                    </button>
                </div>
                <div class="product-actions">
                    <button class="btn btn-outline" onclick="history.back()">
                        ← Back to Listings
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Create user product card with edit/delete options
function createUserProductCard(product) {
    const card = Utils.DOM.create('div', 'product-card user-product-card');
    
    card.innerHTML = `
        <div class="product-image">
            ${product.image ? 
                `<img src="${product.image}" alt="${product.title}">` :
                `<span>${Utils.ImageHelper.getPlaceholder(product.category)}</span>`
            }
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            <div class="product-price">${Utils.NumberHelper.formatPrice(product.price)}</div>
            <div class="product-status">Status: ${product.status}</div>
            <div class="product-actions">
                <button class="btn btn-sm btn-outline" onclick="editProduct('${product.id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')">Delete</button>
            </div>
        </div>
    `;
    
    return card;
}

// Mobile menu functionality
function setupMobileMenu() {
    const mobileMenuToggle = Utils.DOM.select('#mobileMenuToggle');
    const navMenu = Utils.DOM.select('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            Utils.DOM.toggleClass(navMenu, 'active');
            Utils.DOM.toggleClass(mobileMenuToggle, 'active');
        });
    }
}

function toggleMobileMenu() {
    const navMenu = Utils.DOM.select('.nav-menu');
    const mobileMenuToggle = Utils.DOM.select('#mobileMenuToggle');
    
    Utils.DOM.toggleClass(navMenu, 'active');
    Utils.DOM.toggleClass(mobileMenuToggle, 'active');
}

// Search functionality
function setupSearch() {
    const searchInput = Utils.DOM.select('#searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(performSearch, 300));
    }
}

function handleSearch(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const query = formData.get('query');
    
    if (query.trim()) {
        window.location.href = `category.html?search=${encodeURIComponent(query)}`;
    }
}

function performSearch() {
    const searchInput = Utils.DOM.select('#searchInput');
    const query = searchInput.value.trim();
    
    if (query.length > 2) {
        const results = Products.searchProducts(query);
        displaySearchResults(results);
    }
}

// Category filters
function setupCategoryFilters() {
    const searchQuery = Utils.URL.getParam('search');
    if (searchQuery) {
        const searchInput = Utils.DOM.select('#searchInput');
        if (searchInput) {
            searchInput.value = searchQuery;
        }
        
        const results = Products.searchProducts(searchQuery);
        const container = Utils.DOM.select('#categoryProducts');
        ProductUI.renderProductsGrid(results, container);
    }
}

function handleCategoryFilter(event) {
    const category = event.target.value;
    const currentUrl = new URL(window.location);
    
    if (category) {
        currentUrl.searchParams.set('cat', category);
    } else {
        currentUrl.searchParams.delete('cat');
    }
    
    window.location.href = currentUrl.toString();
}

// Product form validation
function setupProductFormValidation() {
    const priceInput = Utils.DOM.select('#productPrice');
    if (priceInput) {
        priceInput.addEventListener('blur', () => {
            const isValid = Utils.Validator.positiveNumber(priceInput.value);
            toggleFieldError(priceInput, !isValid, 'Please enter a valid price');
        });
    }
}

// Image preview functionality
function handleImagePreview(event) {
    const file = event.target.files[0];
    const preview = Utils.DOM.select('#imagePreview');
    
    if (!preview) return;
    
    if (file) {
        const validation = Utils.ImageHelper.validateFile(file);
        if (!validation.valid) {
            Utils.Notification.error(validation.error);
            event.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px;">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
}

// Contact form handling
function handleContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };
    
    // Validate form
    if (!Utils.Validator.required(contactData.name)) {
        Utils.Notification.error('Name is required');
        return;
    }
    
    if (!Utils.Validator.email(contactData.email)) {
        Utils.Notification.error('Please enter a valid email');
        return;
    }
    
    if (!Utils.Validator.required(contactData.message)) {
        Utils.Notification.error('Message is required');
        return;
    }
    
    // Simulate form submission
    Utils.Notification.success('Thank you for your message! We will get back to you soon.');
    event.target.reset();
}

// Product actions
function editProduct(productId) {
    // In a real app, this would open an edit form
    Utils.Notification.info('Edit functionality would be implemented here');
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        const result = Products.deleteProduct(productId);
        if (result.success) {
            Utils.Notification.success(result.message);
            loadProfilePage(); // Reload the page
        } else {
            Utils.Notification.error(result.message);
        }
    }
}

function contactSeller(sellerId) {
    if (!Auth.isLoggedIn()) {
        Utils.Notification.error('Please login to contact the seller');
        return;
    }
    
    // In a real app, this would open a messaging system
    Utils.Notification.info('Contact functionality would be implemented here');
}

// Theme toggle functionality
function setupThemeToggle() {
    const themeToggle = Utils.DOM.select('#themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        
        // Load saved theme
        const savedTheme = Utils.Storage.get('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.setAttribute('data-theme', newTheme);
    Utils.Storage.set('theme', newTheme);
}

// Utility functions
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

function toggleFieldError(field, hasError, message) {
    const errorElement = field.parentNode.querySelector('.error-message');
    
    if (hasError) {
        Utils.DOM.addClass(field, 'error');
        if (!errorElement) {
            const error = Utils.DOM.create('div', 'error-message', message);
            field.parentNode.appendChild(error);
        }
    } else {
        Utils.DOM.removeClass(field, 'error');
        if (errorElement) {
            errorElement.remove();
        }
    }
}

// Export functions for global use
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.contactSeller = contactSeller;
