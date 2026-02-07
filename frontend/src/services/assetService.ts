import api from '../lib/api';
import { DashboardStats, Asset, HardwareAsset, SoftwareAsset, RecentAsset, AssetStatus } from '../types/asset';

// 新增：搜索参数接口
export interface AssetSearchParams {
    query?: string;
    status?: AssetStatus | ''; // 空字符串表示“全部”
}
/**
 * Asset Service for API calls
 */
export const assetService = {
    /**
     * Get dashboard statistics
     */
    getStats: async (): Promise<DashboardStats> => {
        const response = await api.get<DashboardStats>('/assets/stats');
        return response.data;
    },

    /**
     * Get recent assets (top 5)
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
     * Get all assets
     */
    getAllAssets: async (): Promise<Asset[]> => {
        const response = await api.get<Asset[]>('/assets');
        return response.data;
    },

    /**
     * Search and Filter Assets (高级搜索)
     */
    searchAssets: async (params: AssetSearchParams): Promise<Asset[]> => {
        const response = await api.get<Asset[]>('/assets/search', { params });
        return response.data;
    },

    /**
     * Update Asset (更新资产)
     */
    updateAsset: async (id: number, data: Partial<Asset>): Promise<Asset> => {
        const response = await api.put<Asset>(`/assets/${id}`, data);
        return response.data;
    },

    /**
     * Delete Asset (软删除)
     */
    deleteAsset: async (id: number): Promise<void> => {
        await api.delete(`/assets/${id}`);
    },

    /**
     * Assign Asset to User (分配资产)
     */
    assignAsset: async (assetId: number, userId: number): Promise<Asset> => {
        const response = await api.post<Asset>(`/assets/${assetId}/assign`, { userId });
        return response.data;
    },

    /**
     * Create a hardware asset
     */
    createHardwareAsset: async (data: Omit<HardwareAsset, 'id' | 'createdAt' | 'createdBy'>): Promise<Asset> => {
        const response = await api.post<Asset>('/assets/hardware', data);
        return response.data;
    },

    /**
     * Create a software asset
     */
    createSoftwareAsset: async (data: Omit<SoftwareAsset, 'id' | 'createdAt' | 'createdBy'>): Promise<Asset> => {
        const response = await api.post<Asset>('/assets/software', data);
        return response.data;
    },
};
