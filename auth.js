// Authentication System for LPU Market

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check if user is already logged in
        this.currentUser = Utils.Storage.get('currentUser');
        this.updateNavigation();

        // Initialize users storage if it doesn't exist
        if (!Utils.Storage.get('users')) {
            Utils.Storage.set('users', []);
        }
    }

    // Register new user
    register(userData) {
        const { name, email, password, confirmPassword } = userData;

        // Validation
        const validation = this.validateRegistration(userData);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        // Check if user already exists
        const users = Utils.Storage.get('users') || [];
        const existingUser = users.find(user => user.email === email.toLowerCase().trim());

        if (existingUser) {
            return { success: false, message: 'User with this email already exists' };
        }

        // Create new user
        const newUser = {
            id: Utils.StringHelper.generateId(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password, // In real app, this would be hashed
            createdAt: Utils.DateHelper.now(),
            products: []
        };

        // Save user
        users.push(newUser);
        Utils.Storage.set('users', users);

        // Auto login after registration
        this.login({ email, password });

        return { success: true, message: 'Registration successful!' };
    }

    // Login user
    login(credentials) {
        const { email, password } = credentials;

        // Validation
        if (!Utils.Validator.email(email)) {
            return { success: false, message: 'Please enter a valid email address' };
        }

        if (!Utils.Validator.required(password)) {
            return { success: false, message: 'Password is required' };
        }

        // Find user
        const users = Utils.Storage.get('users') || [];
        const user = users.find(u =>
            u.email === email.toLowerCase().trim() && u.password === password
        );

        if (!user) {
            return { success: false, message: 'Invalid email or password' };
        }

        // Set current user
        this.currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        };

        Utils.Storage.set('currentUser', this.currentUser);
        this.updateNavigation();

        return { success: true, message: 'Login successful!', user: this.currentUser };
    }

    // Logout user
    logout() {
        this.currentUser = null;
        Utils.Storage.remove('currentUser');
        this.updateNavigation();

        // Redirect to home page if on protected page
        const protectedPages = ['profile.html', 'post-product.html'];
        const currentPage = window.location.pathname.split('/').pop();

        if (protectedPages.includes(currentPage)) {
            window.location.href = '../index.html';
        }

        return { success: true, message: 'Logged out successfully!' };
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Update navigation based on auth state
    updateNavigation() {
        const navAuth = Utils.DOM.select('#navAuth');
        if (!navAuth) return;

        // Determine if we're on a page in the pages directory
        const currentPath = window.location.pathname;
        const isInPagesDir = currentPath.includes('/pages/');
        const pathPrefix = isInPagesDir ? '' : 'pages/';

        if (this.isLoggedIn()) {
            navAuth.innerHTML = `
                <div class="user-menu">
                    <span class="user-name">Hi, ${this.currentUser.name}</span>
                    <div class="dropdown">
                        <a href="#" class="nav-link dropdown-toggle">Account</a>
                        <div class="dropdown-content">
                            <a href="${pathPrefix}profile.html">My Profile</a>
                            <a href="${pathPrefix}post-product.html">Post Product</a>
                            <a href="#" onclick="Auth.logout(); return false;">Logout</a>
                        </div>
                    </div>
                </div>
            `;
        } else {
            navAuth.innerHTML = `
                <a href="${pathPrefix}login.html" class="btn btn-outline">Login</a>
                <a href="${pathPrefix}signup.html" class="btn btn-primary">Sign Up</a>
            `;
        }
    }

    // Validate registration data
    validateRegistration(data) {
        const { name, email, password, confirmPassword } = data;

        if (!Utils.Validator.required(name)) {
            return { valid: false, message: 'Name is required' };
        }

        if (!Utils.Validator.minLength(name, 2)) {
            return { valid: false, message: 'Name must be at least 2 characters long' };
        }

        if (!Utils.Validator.email(email)) {
            return { valid: false, message: 'Please enter a valid email address' };
        }

        if (!Utils.Validator.password(password)) {
            return { valid: false, message: 'Password must be at least 6 characters long' };
        }

        if (password !== confirmPassword) {
            return { valid: false, message: 'Passwords do not match' };
        }

        return { valid: true };
    }

    // Protect routes (redirect to login if not authenticated)
    requireAuth() {
        if (!this.isLoggedIn()) {
            Utils.Notification.error('Please login to access this page');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
            return false;
        }
        return true;
    }

    // Get user by ID
    getUserById(userId) {
        const users = Utils.Storage.get('users') || [];
        return users.find(user => user.id === userId);
    }

    // Update user data
    updateUser(userId, updateData) {
        const users = Utils.Storage.get('users') || [];
        const userIndex = users.findIndex(user => user.id === userId);

        if (userIndex === -1) {
            return { success: false, message: 'User not found' };
        }

        // Update user data
        users[userIndex] = { ...users[userIndex], ...updateData };
        Utils.Storage.set('users', users);

        // Update current user if it's the same user
        if (this.currentUser && this.currentUser.id === userId) {
            this.currentUser = { ...this.currentUser, ...updateData };
            Utils.Storage.set('currentUser', this.currentUser);
        }

        return { success: true, message: 'User updated successfully' };
    }
}

// Form handling functions
const AuthForms = {
    // Handle login form
    handleLogin: (event) => {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);

        const credentials = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        const result = Auth.login(credentials);

        if (result.success) {
            Utils.Notification.success(result.message);
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
        } else {
            Utils.Notification.error(result.message);
        }
    },

    // Handle registration form
    handleRegister: (event) => {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);

        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword')
        };

        // Check if terms checkbox is checked
        const termsCheckbox = form.querySelector('input[name="terms"]');
        if (termsCheckbox && !termsCheckbox.checked) {
            Utils.Notification.error('Please accept the Terms of Service to continue');
            return;
        }

        const result = Auth.register(userData);

        if (result.success) {
            Utils.Notification.success(result.message);
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
        } else {
            Utils.Notification.error(result.message);
        }
    },

    // Add real-time validation
    addValidation: () => {
        // Email validation
        const emailInputs = Utils.DOM.selectAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', () => {
                const isValid = Utils.Validator.email(input.value);
                AuthForms.toggleFieldError(input, !isValid, 'Please enter a valid email address');
            });
        });

        // Password validation
        const passwordInputs = Utils.DOM.selectAll('input[type="password"]');
        passwordInputs.forEach(input => {
            if (input.name === 'password') {
                input.addEventListener('blur', () => {
                    const isValid = Utils.Validator.password(input.value);
                    AuthForms.toggleFieldError(input, !isValid, 'Password must be at least 6 characters long');
                });
            }
        });

        // Confirm password validation
        const confirmPasswordInput = Utils.DOM.select('input[name="confirmPassword"]');
        const passwordInput = Utils.DOM.select('input[name="password"]');

        if (confirmPasswordInput && passwordInput) {
            confirmPasswordInput.addEventListener('blur', () => {
                const isValid = confirmPasswordInput.value === passwordInput.value;
                AuthForms.toggleFieldError(confirmPasswordInput, !isValid, 'Passwords do not match');
            });
        }
    },

    // Toggle field error state
    toggleFieldError: (field, hasError, message) => {
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
};

// Initialize Auth system
const Auth = new AuthSystem();

// Export for global use
window.Auth = Auth;
window.AuthForms = AuthForms;
