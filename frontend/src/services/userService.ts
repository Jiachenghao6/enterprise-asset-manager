import api from '../lib/api';
import { UserSummary } from '../types/asset';

/**
 * Service for general user operations.
 */
export const userService = {
    /**
     * Retrieves a summary list of all users.
     * <p>
     * Typically used for populating dropdowns (e.g., when assigning assets).
     * Corresponds to backend: GET /api/v1/users
     * </p>
     * 
     * @returns {Promise<UserSummary[]>} A promise resolving to a list of user summaries.
     */
    getAllUsers: async () => {
        const response = await api.get<UserSummary[]>('/users');
        return response.data;
    }
};