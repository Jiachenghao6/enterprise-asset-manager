import { useState, useEffect } from 'react';
import { DashboardStats, RecentAsset } from '../types/asset';
import { assetService } from '../services/assetService';

interface UseDashboardStatsResult {
    stats: DashboardStats | null;
    recentAssets: RecentAsset[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Custom hook for fetching dashboard statistics and recent assets
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
            const [statsData, recentData] = await Promise.all([
                assetService.getStats(),
                assetService.getRecentAssets(),
            ]);
            setStats(statsData);
            setRecentAssets(recentData);
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

