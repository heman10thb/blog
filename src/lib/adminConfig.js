// Centralized Admin Configuration
// Supports separate API keys for external (n8n) and internal (dashboard) use

// Default keys (set in .env.local)
const DEFAULT_EXTERNAL_KEY = '249d46520b660514e035752763aa4b14ce886bb9091243425a1be356cd9f6ca9';
const DEFAULT_INTERNAL_KEY = 'internal_8f7e9d6c5b4a3210fedcba9876543210abcdef1234567890';

// Storage keys
const EXTERNAL_KEY_STORAGE = 'admin_external_api_key';
const INTERNAL_KEY_STORAGE = 'admin_internal_api_key';

// Generate a secure random key
export function generateApiKey(prefix = '') {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
        window.crypto.getRandomValues(array);
    } else {
        // Fallback for server-side
        for (let i = 0; i < 32; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
    }
    const key = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return prefix ? `${prefix}_${key}` : key;
}

// ====================
// EXTERNAL API KEY (for n8n and external integrations)
// ====================

export function getExternalApiKey() {
    if (typeof window === 'undefined') {
        return process.env.ADMIN_API_KEY || DEFAULT_EXTERNAL_KEY;
    }
    const customKey = localStorage.getItem(EXTERNAL_KEY_STORAGE);
    return customKey || DEFAULT_EXTERNAL_KEY;
}

export function setExternalApiKey(key) {
    if (typeof window !== 'undefined') {
        if (key) {
            localStorage.setItem(EXTERNAL_KEY_STORAGE, key);
        } else {
            localStorage.removeItem(EXTERNAL_KEY_STORAGE);
        }
    }
}

export function isUsingCustomExternalKey() {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(EXTERNAL_KEY_STORAGE);
}

export function resetExternalApiKey() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(EXTERNAL_KEY_STORAGE);
    }
}

// ====================
// INTERNAL API KEY (for admin dashboard)
// ====================

export function getInternalApiKey() {
    if (typeof window === 'undefined') {
        return process.env.ADMIN_INTERNAL_API_KEY || DEFAULT_INTERNAL_KEY;
    }
    const customKey = localStorage.getItem(INTERNAL_KEY_STORAGE);
    return customKey || DEFAULT_INTERNAL_KEY;
}

export function setInternalApiKey(key) {
    if (typeof window !== 'undefined') {
        if (key) {
            localStorage.setItem(INTERNAL_KEY_STORAGE, key);
        } else {
            localStorage.removeItem(INTERNAL_KEY_STORAGE);
        }
    }
}

export function isUsingCustomInternalKey() {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(INTERNAL_KEY_STORAGE);
}

export function resetInternalApiKey() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(INTERNAL_KEY_STORAGE);
    }
}

// ====================
// LEGACY FUNCTIONS (for backward compatibility)
// Uses internal key for dashboard operations
// ====================

export function getApiKey() {
    return getInternalApiKey();
}

export function setApiKey(key) {
    setInternalApiKey(key);
}

export function isUsingCustomKey() {
    return isUsingCustomInternalKey();
}

export function resetApiKey() {
    resetInternalApiKey();
}

// ====================
// UTILITIES
// ====================

export function getApiBaseUrl() {
    if (typeof window === 'undefined') {
        return process.env.NEXT_PUBLIC_API_URL || '';
    }
    return window.location.origin;
}

// Helper to make authenticated API requests with internal key
export async function apiRequest(endpoint, options = {}) {
    const apiKey = getInternalApiKey();
    const baseUrl = getApiBaseUrl();

    const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            ...options.headers,
        },
    });

    return response;
}
