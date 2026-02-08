import api from '../lib/api';

// 定义完整的用户接口 (包含角色)
export interface UserFull {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    role: 'USER' | 'ADMIN';
    enabled: boolean;
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
    },

    /**
     * [新增] 修改用户启用状态
     * @param id 用户ID
     * @param enabled 是否启用
     */
    updateUserStatus: async (id: number, enabled: boolean) => {
        // 后端接口: PUT /api/v1/admin/users/{id}/status?enabled=true/false
        // 注意: axios.put 的第二个参数是 body，第三个参数才是 config (包含 params)
        const response = await api.put<UserFull>(`/admin/users/${id}/status`, null, {
            params: { enabled }
        });
        return response.data;
    }
};