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

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        // 直接发送 data，因为接口定义已经和后端 RegisterRequest DTO 匹配了
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
