import api from '../lib/api';
import { DashboardStats, Asset, HardwareAsset, SoftwareAsset, RecentAsset } from '../types/asset';

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
