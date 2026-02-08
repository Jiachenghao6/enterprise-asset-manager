import api from '../lib/api';
import { DashboardStats, Asset, HardwareAsset, SoftwareAsset, RecentAsset, AssetStatus, Page, AssetSearchParams } from '../types/asset';

// [新增] 软件批量请求接口
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

// [新增] 批量请求的参数接口 (对应后端的 BatchHardwareRequest DTO)
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
    getAllAssets: async (page = 0, size = 10): Promise<Page<Asset>> => {
        const response = await api.get<Page<Asset>>('/assets', {
            params: { page, size }
        });
        return response.data;
    },

    // [修改后] 返回 Page<Asset>
    searchAssets: async (params: AssetSearchParams): Promise<Page<Asset>> => {
        const response = await api.get<Page<Asset>>('/assets/search', {
            params: {
                ...params,
                // 确保分页参数有默认值
                page: params.page ?? 0,
                size: params.size ?? 10,
                sortBy: params.sortBy ?? 'id',
                sortDir: params.sortDir ?? 'asc'
            }
        });
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
    // --- [Phase 3.2 新增] 批量创建接口 ---
    createBatchHardwareAsset: async (data: BatchHardwareRequest): Promise<Asset[]> => {
        const response = await api.post<Asset[]>('/assets/batch/hardware', data);
        return response.data;
    },
    createBatchSoftwareAsset: async (data: BatchSoftwareRequest): Promise<Asset[]> => {
        const response = await api.post<Asset[]>('/assets/batch/software', data);
        return response.data;
    }
};
