import axios from 'axios';

export const API_BASE_URL = '/api/v1';
export const AUTH_TOKEN_KEY = 'auth_token';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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

api.interceptors.response.use(
    (response) => response, // 如果成功，直接返回
    (error) => {
        // 如果后端返回 401 Unauthorized (Token 过期或无效)
        if (error.response && error.response.status === 401) {
            console.warn('Session expired. Redirecting to login...');

            // 1. 清除本地 Token
            localStorage.removeItem('token');

            // 2. 强制跳转回登录页
            // 注意：这里不能直接用 useNavigate，因为这不是 React 组件。
            // 使用 window.location.href 是最简单粗暴有效的方法。
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
