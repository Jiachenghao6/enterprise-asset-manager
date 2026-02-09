import api, { AUTH_TOKEN_KEY } from '../lib/api';

/**
 * Interface for login credentials.
 */
export interface LoginRequest {
    username: string;
    password: string;
}

/**
 * Interface for user registration data.
 */
export interface RegisterRequest {
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
}

/**
 * Interface for authentication response.
 */
export interface AuthResponse {
    token: string;
}

/**
 * Service for handling user authentication.
 * <p>
 * Manages login, registration, and token storage using LocalStorage.
 * </p>
 */
export const authService = {
    /**
     * Authenticates a user.
     * <p>
     * On success, the JWT token is stored in LocalStorage.
     * </p>
     * 
     * @param {LoginRequest} credentials - The username and password.
     * @returns {Promise<AuthResponse>} A promise resolving to the auth response.
     */
    login: async (credentials: { username: string, password: string }): Promise<AuthResponse> => {
        const payload: LoginRequest = {
            username: credentials.username,
            password: credentials.password
        };
        const response = await api.post<AuthResponse>('/auth/authenticate', payload);
        if (response.data.token) {
            localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
        }
        return response.data;
    },

    /**
     * Registers a new user.
     * <p>
     * On success, the user is automatically logged in (token stored).
     * </p>
     * 
     * @param {RegisterRequest} data - The user registration details.
     * @returns {Promise<AuthResponse>} A promise resolving to the auth response.
     */
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', data);

        if (response.data.token) {
            localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
        }
        return response.data;
    },

    /**
     * Logs out the current user by removing the token.
     */
    logout: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
    },

    /**
     * Retrieves the current authentication token.
     * 
     * @returns {string | null} The token or null if not found.
     */
    getToken: () => {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    },

    /**
     * Checks if a user is currently authenticated.
     * 
     * @returns {boolean} True if a token exists, false otherwise.
     */
    isAuthenticated: () => {
        return !!localStorage.getItem(AUTH_TOKEN_KEY);
    }
};
