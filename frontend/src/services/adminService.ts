import api from '../lib/api';

// 定义完整的用户接口 (包含角色)
export interface UserFull {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    role: 'USER' | 'ADMIN';
}

export const adminService = {
    /**
     * 获取所有用户完整列表 (仅限管理员)
     */
    getAllUsers: async () => {
        const response = await api.get<UserFull[]>('/admin/users');
        return response.data;
    },

    /**
     * 修改用户角色
     * @param id 用户ID
     * @param role 新角色
     */
    updateUserRole: async (id: number, role: 'USER' | 'ADMIN') => {
        const response = await api.put<UserFull>(`/admin/users/${id}/role`, { role });
        return response.data;
    }
};