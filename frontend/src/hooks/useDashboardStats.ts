import { useState, useEffect } from 'react';
import { DashboardStats, RecentAsset, AssetStatus } from '../types/asset';
// import api from '../api'; // Uncomment when API is ready

/**
 * Mock data for dashboard statistics
 * Will be replaced with actual API call when backend endpoint is available
 */
const mockStats: DashboardStats = {
    totalAssets: 127,
    totalValue: 458750.00,
    activeLicenses: 34,
    availableAssets: 89,
};

/**
 * Mock data for recent assets
 * Will be replaced with actual API call when backend endpoint is available
 */
const mockRecentAssets: RecentAsset[] = [
    { id: 1, name: 'MacBook Pro 16"', type: 'HARDWARE', status: AssetStatus.AVAILABLE, currentValue: 2499.00, createdAt: '2026-02-04T10:30:00' },
    { id: 2, name: 'Adobe Creative Cloud', type: 'SOFTWARE', status: AssetStatus.ASSIGNED, currentValue: 599.00, createdAt: '2026-02-03T14:15:00' },
    { id: 3, name: 'Dell Monitor 27"', type: 'HARDWARE', status: AssetStatus.AVAILABLE, currentValue: 349.00, createdAt: '2026-02-02T09:00:00' },
    { id: 4, name: 'Microsoft 365 Business', type: 'SOFTWARE', status: AssetStatus.ASSIGNED, currentValue: 150.00, createdAt: '2026-02-01T16:45:00' },
    { id: 5, name: 'iPhone 15 Pro', type: 'HARDWARE', status: AssetStatus.ASSIGNED, currentValue: 999.00, createdAt: '2026-01-31T11:20:00' },
];

interface UseDashboardStatsResult {
    stats: DashboardStats | null;
    recentAssets: RecentAsset[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Custom hook for fetching dashboard statistics and recent assets
 * Currently uses mock data, structured for future API integration
 */
export const useDashboardStats = (): UseDashboardStatsResult => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentAssets, setRecentAssets] = useState<RecentAsset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // TODO: Replace with actual API calls when backend endpoints are ready
            // const [statsResponse, assetsResponse] = await Promise.all([
            //   api.get('/assets/stats'),
            //   api.get('/assets/recent?limit=5'),
            // ]);
            // setStats(statsResponse.data);
            // setRecentAssets(assetsResponse.data);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            setStats(mockStats);
            setRecentAssets(mockRecentAssets);
        } catch (err) {
            setError('Failed to fetch dashboard data');
            console.error('Dashboard fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return {
        stats,
        recentAssets,
        isLoading,
        error,
        refetch: fetchData,
    };
};
