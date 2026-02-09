import { useState, useEffect } from 'react';
import { DashboardStats, RecentAsset } from '../types/asset';
import { assetService } from '../services/assetService';

/**
 * Result interface for the useDashboardStats hook.
 */
interface UseDashboardStatsResult {
    /** The dashboard statistics data. */
    stats: DashboardStats | null;
    /** List of recently added assets. */
    recentAssets: RecentAsset[];
    /** Whether the data is currently being fetched. */
    isLoading: boolean;
    /** Error message if the fetch failed. */
    error: string | null;
    /** Function to manually trigger a data refresh. */
    refetch: () => void;
}

/**
 * Custom hook for fetching dashboard statistics and recent assets.
 * <p>
 * Aggregates data from {@link assetService.getStats} and {@link assetService.getRecentAssets}.
 * Handles loading states and error reporting.
 * </p>
 * 
 * @returns {UseDashboardStatsResult} The hook state and refetch function.
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

