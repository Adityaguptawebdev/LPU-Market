// Product Management System for LPU Market

class ProductManager {
    constructor() {
        this.products = [];
        this.categories = ['electronics', 'books', 'hostel', 'clothing', 'misc'];
        this.init();
    }

    init() {
        // Load products from localStorage
        this.products = Utils.Storage.get('products') || [];
        
        // Initialize with sample data if empty
        if (this.products.length === 0) {
            this.initializeSampleData();
        }
    }

    // Initialize with sample products
    initializeSampleData() {
        const sampleProducts = [
            {
                id: 'sample1',
                title: 'iPhone 12 Pro',
                description: 'Excellent condition iPhone 12 Pro, 128GB, Space Gray. Used for 1 year.',
                price: 45000,
                category: 'electronics',
                image: null,
                sellerId: 'sample_user',
                sellerName: 'Rahul Sharma',
                createdAt: Utils.DateHelper.now(),
                status: 'active'
            },
            {
                id: 'sample2',
                title: 'Data Structures & Algorithms Book',
                description: 'Complete book for CSE students. All chapters covered with examples.',
                price: 800,
                category: 'books',
                image: null,
                sellerId: 'sample_user2',
                sellerName: 'Priya Singh',
                createdAt: Utils.DateHelper.now(),
                status: 'active'
            },
            {
                id: 'sample3',
                title: 'Study Table with Chair',
                description: 'Wooden study table with comfortable chair. Perfect for hostel room.',
                price: 3500,
                category: 'hostel',
                image: null,
                sellerId: 'sample_user3',
                sellerName: 'Amit Kumar',
                createdAt: Utils.DateHelper.now(),
                status: 'active'
            },
            {
                id: 'sample4',
                title: 'Formal Shirt - Medium',
                description: 'Brand new formal shirt, size M. Perfect for placements and interviews.',
                price: 1200,
                category: 'clothing',
                image: null,
                sellerId: 'sample_user4',
                sellerName: 'Neha Gupta',
                createdAt: Utils.DateHelper.now(),
                status: 'active'
            }
        ];

        this.products = sampleProducts;
        Utils.Storage.set('products', this.products);
    }

    // Add new product
    addProduct(productData) {
        const validation = this.validateProduct(productData);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        const currentUser = Auth.getCurrentUser();
        if (!currentUser) {
            return { success: false, message: 'You must be logged in to post a product' };
        }

        const newProduct = {
            id: Utils.StringHelper.generateId(),
            title: productData.title.trim(),
            description: productData.description.trim(),
            price: parseFloat(productData.price),
            category: productData.category,
            image: productData.image || null,
            sellerId: currentUser.id,
            sellerName: currentUser.name,
            createdAt: Utils.DateHelper.now(),
            status: 'active'
        };

        this.products.unshift(newProduct); // Add to beginning
        Utils.Storage.set('products', this.products);

        return { success: true, message: 'Product posted successfully!', product: newProduct };
    }

    // Get all products
    getAllProducts() {
        return this.products.filter(product => product.status === 'active');
    }

    // Get products by category
    getProductsByCategory(category) {
        return this.products.filter(product => 
            product.category === category && product.status === 'active'
        );
    }

    // Get product by ID
    getProductById(id) {
        return this.products.find(product => product.id === id);
    }

    // Get products by seller
    getProductsBySeller(sellerId) {
        return this.products.filter(product => product.sellerId === sellerId);
    }

    // Search products
    searchProducts(query, category = null) {
        const searchTerm = query.toLowerCase().trim();
        
        return this.products.filter(product => {
            if (product.status !== 'active') return false;
            
            const matchesSearch = 
                product.title.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm);
            
            const matchesCategory = !category || product.category === category;
            
            return matchesSearch && matchesCategory;
        });
    }

    // Update product
    updateProduct(id, updateData) {
        const productIndex = this.products.findIndex(product => product.id === id);
        
        if (productIndex === -1) {
            return { success: false, message: 'Product not found' };
        }

        const currentUser = Auth.getCurrentUser();
        if (!currentUser || this.products[productIndex].sellerId !== currentUser.id) {
            return { success: false, message: 'You can only edit your own products' };
        }

        // Validate update data
        const validation = this.validateProduct(updateData);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        // Update product
        this.products[productIndex] = {
            ...this.products[productIndex],
            ...updateData,
            updatedAt: Utils.DateHelper.now()
        };

        Utils.Storage.set('products', this.products);
        return { success: true, message: 'Product updated successfully!' };
    }

    // Delete product
    deleteProduct(id) {
        const productIndex = this.products.findIndex(product => product.id === id);
        
        if (productIndex === -1) {
            return { success: false, message: 'Product not found' };
        }

        const currentUser = Auth.getCurrentUser();
        if (!currentUser || this.products[productIndex].sellerId !== currentUser.id) {
            return { success: false, message: 'You can only delete your own products' };
        }

        // Soft delete - mark as inactive
        this.products[productIndex].status = 'deleted';
        this.products[productIndex].deletedAt = Utils.DateHelper.now();

        Utils.Storage.set('products', this.products);
        return { success: true, message: 'Product deleted successfully!' };
    }

    // Validate product data
    validateProduct(data) {
        if (!Utils.Validator.required(data.title)) {
            return { valid: false, message: 'Product title is required' };
        }

        if (!Utils.Validator.minLength(data.title, 3)) {
            return { valid: false, message: 'Product title must be at least 3 characters long' };
        }

        if (!Utils.Validator.maxLength(data.title, 100)) {
            return { valid: false, message: 'Product title must be less than 100 characters' };
        }

        if (!Utils.Validator.required(data.description)) {
            return { valid: false, message: 'Product description is required' };
        }

        if (!Utils.Validator.minLength(data.description, 10)) {
            return { valid: false, message: 'Product description must be at least 10 characters long' };
        }

        if (!Utils.Validator.positiveNumber(data.price)) {
            return { valid: false, message: 'Please enter a valid price' };
        }

        if (parseFloat(data.price) > 1000000) {
            return { valid: false, message: 'Price cannot exceed ₹10,00,000' };
        }

        if (!this.categories.includes(data.category)) {
            return { valid: false, message: 'Please select a valid category' };
        }

        return { valid: true };
    }

    // Get category display name
    getCategoryDisplayName(category) {
        const categoryNames = {
            electronics: 'Electronics',
            books: 'Books',
            hostel: 'Hostel Essentials',
            clothing: 'Clothing',
            misc: 'Miscellaneous'
        };
        return categoryNames[category] || category;
    }

    // Get latest products
    getLatestProducts(limit = 6) {
        return this.getAllProducts()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }
}

// Product UI Helper Functions
const ProductUI = {
    // Render product card
    renderProductCard: (product) => {
        const card = Utils.DOM.create('div', 'product-card');
        card.onclick = () => ProductUI.viewProduct(product.id);
        
        card.innerHTML = `
            <div class="product-image">
                ${product.image ? 
                    `<img src="${product.image}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover;">` :
                    `<span>${Utils.ImageHelper.getPlaceholder(product.category)}</span>`
                }
            </div>
            <div class="product-info">
                <h3 class="product-title">${Utils.StringHelper.truncate(product.title, 50)}</h3>
                <div class="product-price">${Utils.NumberHelper.formatPrice(product.price)}</div>
                <div class="product-seller">By ${product.sellerName}</div>
                <div class="product-date">${Utils.DateHelper.timeAgo(product.createdAt)}</div>
            </div>
        `;
        
        return card;
    },

    // Render products grid
    renderProductsGrid: (products, container) => {
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No products found</h3>
                    <p>Be the first to post a product in this category!</p>
                    <a href="post-product.html" class="btn btn-primary">Post Product</a>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        products.forEach(product => {
            const card = ProductUI.renderProductCard(product);
            container.appendChild(card);
        });
    },

    // View product details
    viewProduct: (productId) => {
        const currentPage = window.location.pathname.split('/').pop();
        const basePath = currentPage === 'index.html' || currentPage === '' ? 'pages/' : '';
        window.location.href = `${basePath}product-details.html?id=${productId}`;
    },

    // Load and display featured products on home page
    loadFeaturedProducts: () => {
        const container = Utils.DOM.select('#featuredProducts');
        if (!container) return;

        const products = Products.getLatestProducts(6);
        ProductUI.renderProductsGrid(products, container);
    },

    // Load products by category
    loadCategoryProducts: (category) => {
        const container = Utils.DOM.select('#categoryProducts');
        if (!container) return;

        Utils.Loading.show(container);
        
        setTimeout(() => {
            const products = category ? 
                Products.getProductsByCategory(category) : 
                Products.getAllProducts();
            
            ProductUI.renderProductsGrid(products, container);
        }, 500);
    },

    // Handle product form submission
    handleProductForm: (event) => {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        const productData = {
            title: formData.get('title'),
            description: formData.get('description'),
            price: formData.get('price'),
            category: formData.get('category'),
            image: formData.get('image') // This would be handled differently in a real app
        };

        const result = Products.addProduct(productData);
        
        if (result.success) {
            Utils.Notification.success(result.message);
            form.reset();
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1000);
        } else {
            Utils.Notification.error(result.message);
        }
    }
};

// Initialize Product Manager
const Products = new ProductManager();

// Export for global use
window.Products = Products;
window.ProductUI = ProductUI;
