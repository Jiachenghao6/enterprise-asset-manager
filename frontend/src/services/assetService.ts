import api from '../lib/api';
import { DashboardStats, Asset, HardwareAsset, SoftwareAsset, RecentAsset, AssetStatus, Page, AssetSearchParams } from '../types/asset';

/**
 * Interface for batch software creation request.
 */
export interface BatchSoftwareRequest {
    name: string;
    purchasePrice: number;
    purchaseDate: string;
    status: AssetStatus;
    residualValue: number;
    usefulLifeYears: number;
    licenseKey: string;
    expiryDate?: string;
    quantity: number;
}

/**
 * Interface for batch hardware creation request.
 */
export interface BatchHardwareRequest {
    name: string;
    purchasePrice: number;
    purchaseDate: string;
    status: AssetStatus;
    residualValue: number;
    usefulLifeYears: number;
    location: string;
    warrantyDate?: string;
    serialNumberPrefix: string;
    quantity: number;
}

/**
 * Service for managing Assets.
 * <p>
 * Handles API calls for creating, retrieving, updating, and deleting assets.
 * Also supports batch operations and statistics retrieval.
 * </p>
 */
export const assetService = {
    /**
     * Retrieves dashboard statistics.
     * 
     * @returns {Promise<DashboardStats>} A promise resolving to the dashboard stats.
     */
    getStats: async (): Promise<DashboardStats> => {
        const response = await api.get<DashboardStats>('/assets/stats');
        return response.data;
    },

    /**
     * Retrieves the 5 most recently created assets.
     * 
     * @returns {Promise<RecentAsset[]>} A promise resolving to a list of recent assets.
     */
    getRecentAssets: async (): Promise<RecentAsset[]> => {
        const response = await api.get<Asset[]>('/assets/recent');
        // Transform backend Asset to frontend RecentAsset
        return response.data.map(asset => ({
            id: asset.id,
            name: asset.name,
            type: 'serialNumber' in asset ? 'HARDWARE' : 'SOFTWARE',
            status: asset.status,
            currentValue: asset.purchasePrice, // TODO: use calculated value
            createdAt: asset.createdAt,
        }));
    },

    /**
     * Retrieves a paginated list of all assets.
     * 
     * @param {number} [page=0] - The page number (0-indexed).
     * @param {number} [size=10] - The number of items per page.
     * @returns {Promise<Page<Asset>>} A promise resolving to a page of assets.
     */
    getAllAssets: async (page = 0, size = 10): Promise<Page<Asset>> => {
        const response = await api.get<Page<Asset>>('/assets', {
            params: { page, size }
        });
        return response.data;
    },

    /**
     * Searches for assets using dynamic criteria.
     * 
     * @param {AssetSearchParams} params - The search parameters including query string and filters.
     * @returns {Promise<Page<Asset>>} A promise resolving to a page of matching assets.
     */
    searchAssets: async (params: AssetSearchParams): Promise<Page<Asset>> => {
        const response = await api.get<Page<Asset>>('/assets/search', {
            params: {
                ...params,
                // Ensure pagination defaults
                page: params.page ?? 0,
                size: params.size ?? 10,
                sortBy: params.sortBy ?? 'id',
                sortDir: params.sortDir ?? 'asc'
            }
        });
        return response.data;
    },

    /**
     * Updates an existing asset.
     * 
     * @param {number} id - The ID of the asset to update.
     * @param {Partial<Asset>} data - The fields to update.
     * @returns {Promise<Asset>} A promise resolving to the updated asset.
     */
    updateAsset: async (id: number, data: Partial<Asset>): Promise<Asset> => {
        const response = await api.put<Asset>(`/assets/${id}`, data);
        return response.data;
    },

    /**
     * Deletes an asset (Soft Delete).
     * 
     * @param {number} id - The ID of the asset to delete.
     * @returns {Promise<void>}
     */
    deleteAsset: async (id: number): Promise<void> => {
        await api.delete(`/assets/${id}`);
    },

    /**
     * Assigns an asset to a user.
     * 
     * @param {number} assetId - The ID of the asset.
     * @param {number} userId - The ID of the user.
     * @returns {Promise<Asset>} A promise resolving to the updated asset.
     */
    assignAsset: async (assetId: number, userId: number): Promise<Asset> => {
        const response = await api.post<Asset>(`/assets/${assetId}/assign`, { userId });
        return response.data;
    },

    /**
     * Creates a single hardware asset.
     * 
     * @param {Omit<HardwareAsset, 'id' | 'createdAt' | 'createdBy'>} data - The hardware asset data.
     * @returns {Promise<Asset>} A promise resolving to the created asset.
     */
    createHardwareAsset: async (data: Omit<HardwareAsset, 'id' | 'createdAt' | 'createdBy'>): Promise<Asset> => {
        const response = await api.post<Asset>('/assets/hardware', data);
        return response.data;
    },

    /**
     * Creates a single software asset.
     * 
     * @param {Omit<SoftwareAsset, 'id' | 'createdAt' | 'createdBy'>} data - The software asset data.
     * @returns {Promise<Asset>} A promise resolving to the created asset.
     */
    createSoftwareAsset: async (data: Omit<SoftwareAsset, 'id' | 'createdAt' | 'createdBy'>): Promise<Asset> => {
        const response = await api.post<Asset>('/assets/software', data);
        return response.data;
    },

    /**
     * Creates multiple hardware assets in a batch.
     * 
     * @param {BatchHardwareRequest} data - The batch creation request data.
     * @returns {Promise<Asset[]>} A promise resolving to the list of created assets.
     */
    createBatchHardwareAsset: async (data: BatchHardwareRequest): Promise<Asset[]> => {
        const response = await api.post<Asset[]>('/assets/batch/hardware', data);
        return response.data;
    },

    /**
     * Creates multiple software assets in a batch.
     * 
     * @param {BatchSoftwareRequest} data - The batch creation request data.
     * @returns {Promise<Asset[]>} A promise resolving to the list of created assets.
     */
    createBatchSoftwareAsset: async (data: BatchSoftwareRequest): Promise<Asset[]> => {
        const response = await api.post<Asset[]>('/assets/batch/software', data);
        return response.data;
    }
};
