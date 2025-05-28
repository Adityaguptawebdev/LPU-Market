// Utility Functions for LPU Market

// Local Storage Helper Functions
const Storage = {
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error getting from localStorage:', error);
            return null;
        }
    },

    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error setting to localStorage:', error);
            return false;
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// Form Validation Functions
const Validator = {
    email: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    password: (password) => {
        return password.length >= 6;
    },

    required: (value) => {
        return value && value.trim().length > 0;
    },

    minLength: (value, min) => {
        return value && value.length >= min;
    },

    maxLength: (value, max) => {
        return value && value.length <= max;
    },

    number: (value) => {
        return !isNaN(value) && !isNaN(parseFloat(value));
    },

    positiveNumber: (value) => {
        return Validator.number(value) && parseFloat(value) > 0;
    }
};

// DOM Helper Functions
const DOM = {
    select: (selector) => document.querySelector(selector),
    selectAll: (selector) => document.querySelectorAll(selector),
    
    create: (tag, className = '', content = '') => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.textContent = content;
        return element;
    },

    show: (element) => {
        if (element) element.style.display = 'block';
    },

    hide: (element) => {
        if (element) element.style.display = 'none';
    },

    toggle: (element) => {
        if (element) {
            element.style.display = element.style.display === 'none' ? 'block' : 'none';
        }
    },

    addClass: (element, className) => {
        if (element) element.classList.add(className);
    },

    removeClass: (element, className) => {
        if (element) element.classList.remove(className);
    },

    toggleClass: (element, className) => {
        if (element) element.classList.toggle(className);
    }
};

// URL Helper Functions
const URL = {
    getParams: () => {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },

    getParam: (name) => {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    },

    setParam: (name, value) => {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.pushState({}, '', url);
    },

    removeParam: (name) => {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.pushState({}, '', url);
    }
};

// Date Helper Functions
const DateHelper = {
    format: (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    timeAgo: (date) => {
        const now = new Date();
        const past = new Date(date);
        const diffInSeconds = Math.floor((now - past) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        
        return DateHelper.format(date);
    },

    now: () => new Date().toISOString()
};

// String Helper Functions
const StringHelper = {
    capitalize: (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    truncate: (str, length = 100) => {
        return str.length > length ? str.substring(0, length) + '...' : str;
    },

    slugify: (str) => {
        return str
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// Number Helper Functions
const NumberHelper = {
    formatPrice: (price) => {
        return `₹${parseFloat(price).toLocaleString('en-IN')}`;
    },

    formatNumber: (num) => {
        return parseFloat(num).toLocaleString('en-IN');
    }
};

// Image Helper Functions
const ImageHelper = {
    getPlaceholder: (category) => {
        const placeholders = {
            electronics: '📱',
            books: '📚',
            hostel: '🏠',
            clothing: '👕',
            misc: '🎯',
            default: '📦'
        };
        return placeholders[category] || placeholders.default;
    },

    validateFile: (file) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            return { valid: false, error: 'Please select a valid image file (JPEG, PNG, GIF)' };
        }

        if (file.size > maxSize) {
            return { valid: false, error: 'Image size should be less than 5MB' };
        }

        return { valid: true };
    },

    toBase64: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
};

// Notification Helper Functions
const Notification = {
    show: (message, type = 'info', duration = 3000) => {
        const notification = DOM.create('div', `notification notification-${type}`, message);
        document.body.appendChild(notification);

        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Show notification
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Hide notification
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    },

    success: (message) => Notification.show(message, 'success'),
    error: (message) => Notification.show(message, 'error'),
    warning: (message) => Notification.show(message, 'warning'),
    info: (message) => Notification.show(message, 'info')
};

// Loading Helper Functions
const Loading = {
    show: (element) => {
        if (element) {
            element.innerHTML = '<div class="loading">Loading...</div>';
        }
    },

    hide: (element) => {
        if (element) {
            const loading = element.querySelector('.loading');
            if (loading) {
                loading.remove();
            }
        }
    }
};

// Export for use in other files
window.Utils = {
    Storage,
    Validator,
    DOM,
    URL,
    DateHelper,
    StringHelper,
    NumberHelper,
    ImageHelper,
    Notification,
    Loading
};
