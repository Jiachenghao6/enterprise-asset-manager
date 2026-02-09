import api from '../lib/api';

/**
 * Interface representing a full user profile including administrative details.
 */
export interface UserFull {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    role: 'USER' | 'ADMIN';
    enabled: boolean;
}

/**
 * Service for administrative operations.
 * <p>
 * Handles user management tasks such as retrieving all users,
 * updating roles, and modifying account status.
 * </p>
 */
export const adminService = {
    /**
     * Retrieves a complete list of users.
     * <p>
     * This endpoint is restricted to administrators.
     * </p>
     * 
     * @returns {Promise<UserFull[]>} A promise that resolves to a list of usage profiles.
     */
    getAllUsers: async () => {
        const response = await api.get<UserFull[]>('/admin/users');
        return response.data;
    },

    /**
     * Updates a user's role.
     * 
     * @param {number} id - The ID of the user to update.
     * @param {'USER' | 'ADMIN'} role - The new role to assign.
     * @returns {Promise<UserFull>} A promise that resolves to the updated user profile.
     */
    updateUserRole: async (id: number, role: 'USER' | 'ADMIN') => {
        const response = await api.put<UserFull>(`/admin/users/${id}/role`, { role });
        return response.data;
    },

    /**
     * Updates a user's account status (enabled/disabled).
     * 
     * @param {number} id - The ID of the user.
     * @param {boolean} enabled - True to enable the account, false to disable.
     * @returns {Promise<UserFull>} A promise that resolves to the updated user profile.
     */
    updateUserStatus: async (id: number, enabled: boolean) => {
        // Backend endpoint: PUT /api/v1/admin/users/{id}/status?enabled=true/false
        // Note: axios.put 2nd arg is body, 3rd arg is config (containing params)
        const response = await api.put<UserFull>(`/admin/users/${id}/status`, null, {
            params: { enabled }
        });
        return response.data;
    }
};