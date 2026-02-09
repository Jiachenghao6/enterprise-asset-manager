import axios from 'axios';

/**
 * Base URL for the API.
 */
export const API_BASE_URL = '/api/v1';

/**
 * LocalStorage key for storing the authentication token.
 */
export const AUTH_TOKEN_KEY = 'auth_token';

/**
 * Configured Axios instance for API requests.
 */
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If backend returns 401 Unauthorized (Token expired or invalid)
        if (error.response && error.response.status === 401) {
            console.warn('Session expired. Redirecting to login...');

            // 1. Clear local token
            localStorage.removeItem(AUTH_TOKEN_KEY); // Corrected from 'token' to constant

            // 2. Force redirect to login page
            // Note: window.location.href is used because this is not a React component
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
