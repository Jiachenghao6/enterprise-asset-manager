import api from '../lib/api';
import { UserSummary } from '../types/asset';

export const userService = {
    /**
     * 获取所有用户列表 (用于下拉框选择)
     * 对应后端: GET /api/v1/users
     */
    getAllUsers: async () => {
        const response = await api.get<UserSummary[]>('/users');
        return response.data;
    }
};