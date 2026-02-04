import api, { AUTH_TOKEN_KEY } from '../lib/api';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    // Add other user fields if returned by backend, e.g.,
    // user: {
    //   id: string;
    //   email: string;
    //   firstName: string;
    //   lastName: string;
    // }
}

export const authService = {
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/authenticate', credentials);
        if (response.data.token) {
            localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
        }
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', data);
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
