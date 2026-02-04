import api, { AUTH_TOKEN_KEY } from '../lib/api';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
    role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
    token: string;
}

// ... types updated below ...

export const authService = {
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

    register: async (data: { firstname: string, lastname: string, username: string, email: string, password: string, role?: 'USER' | 'ADMIN' }): Promise<AuthResponse> => {
        const payload: RegisterRequest = {
            firstname: data.firstname,
            lastname: data.lastname,
            username: data.username,
            email: data.email,
            password: data.password,
            role: data.role || 'USER'
        };
        const response = await api.post<AuthResponse>('/auth/register', payload);
        if (response.data.token) {
            localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
    },

    getToken: () => {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    },

    isAuthenticated: () => {
        return !!localStorage.getItem(AUTH_TOKEN_KEY);
    }
};
