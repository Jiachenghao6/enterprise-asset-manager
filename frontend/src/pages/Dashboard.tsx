import React, { useState, useEffect } from 'react';
import {
    Plus, Package, DollarSign, Key, CheckCircle, Loader2,
    Search, Filter, Trash2, Edit, UserPlus
} from 'lucide-react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { AssetStatus, Asset, Page } from '../types/asset';
import { assetService } from '../services/assetService';
import AddAssetModal from '../components/AddAssetModal';
import AssignAssetModal from '../components/AssignAssetModal';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

/**
 * Component to display a single statistic card.
 *
 * @param {StatCardProps} props - The props for the component.
 */
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                {icon}
            </div>
        </div>
    </div>
);

/**
 * Component to display an asset status badge.
 *
 * @param {Object} props - The props for the component.
 * @param {AssetStatus} props.status - The status to display.
 */
const StatusBadge: React.FC<{ status: AssetStatus }> = ({ status }) => {
    const colors: Record<AssetStatus, string> = {
        [AssetStatus.AVAILABLE]: 'bg-green-100 text-green-800',
        [AssetStatus.ASSIGNED]: 'bg-blue-100 text-blue-800',
        [AssetStatus.BROKEN]: 'bg-red-100 text-red-800',
        [AssetStatus.REPAIRING]: 'bg-yellow-100 text-yellow-800',
        [AssetStatus.DISPOSED]: 'bg-gray-100 text-gray-800',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
            {status}
        </span>
    );
};

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
};

/**
 * State interface for dashboard query parameters.
 */
interface QueryParams {
    page: number;
    size: number;
    sortBy: string;
    sortDir: 'asc' | 'desc';
    query: string;
    status: AssetStatus | '';
}

/**
 * Main Dashboard page component.
 * <p>
 * Displays key statistics and a paginated, sortable, and filterable list of assets.
 * Allows adding, editing, deleting, and assigning assets.
 * </p>
 */
const Dashboard: React.FC = () => {
    // 1. Keep original stats hook
    const { stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();

    // 2. Manage page data
    const [pageData, setPageData] = useState<Page<Asset> | null>(null);
    const [isTableLoading, setIsTableLoading] = useState(false);

    // Manage query params
    const [queryParams, setQueryParams] = useState<QueryParams>({
        page: 0,
        size: 10,
        sortBy: 'createdAt',
        sortDir: 'desc',
        query: '',
        status: ''
    });

    // Modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assigningAsset, setAssigningAsset] = useState<Asset | null>(null);

    // 3. Asset fetching method
    const fetchAssets = async () => {
        setIsTableLoading(true);
        try {
            const data = await assetService.searchAssets({
                query: queryParams.query,
                status: queryParams.status,
                page: queryParams.page,
                size: queryParams.size,
                sortBy: queryParams.sortBy,
                sortDir: queryParams.sortDir
            });
            setPageData(data);
        } catch (err) {
            console.error('Failed to fetch assets', err);
        } finally {
            setIsTableLoading(false);
        }
    };

    /** Handles sorting column clicks. */
    const handleSort = (field: string) => {
        setQueryParams(prev => ({
            ...prev,
            sortBy: field,
            sortDir: prev.sortBy === field && prev.sortDir === 'asc' ? 'desc' : 'asc'
        }));
    };

    /** Handles pagination clicks. */
    const handlePageChange = (newPage: number) => {
        if (pageData && newPage >= 0 && newPage < pageData.totalPages) {
            setQueryParams(prev => ({ ...prev, page: newPage }));
        }
    };

    /** Handles search input changes (resets page to 0). */
    const handleSearchChange = (val: string) => {
        setQueryParams(prev => ({ ...prev, query: val, page: 0 }));
    };

    /** Handles status filter changes (resets page to 0). */
    const handleStatusChange = (val: AssetStatus | '') => {
        setQueryParams(prev => ({ ...prev, status: val, page: 0 }));
    };

    // Modal handlers
    const handleEditClick = (asset: Asset) => {
        setEditingAsset(asset);
        setIsAddModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingAsset(null);
        setIsAddModalOpen(true);
    };

    const handleAssignClick = (asset: Asset) => {
        setAssigningAsset(asset);
        setIsAssignModalOpen(true);
    };

    // Auto-fetch on query param change with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAssets();
        }, 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams]);

    // Delete handler
    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
            try {
                await assetService.deleteAsset(id);
                fetchAssets();
                refetchStats();
            } catch (err) {
                console.error(err);
                alert('Failed to delete asset');
            }
        }
    };

    const handleModalClose = () => {
        setIsAddModalOpen(false);
        setTimeout(() => setEditingAsset(null), 300);
    };

    const handleAddSuccess = () => {
        fetchAssets();
        refetchStats();
    };

    /** Helper to render sort arrows. */
    const renderSortIcon = (field: string) => {
        if (queryParams.sortBy !== field) return <span className="text-gray-300 ml-1">↕</span>;
        return queryParams.sortDir === 'asc' ? ' ↑' : ' ↓';
    };

    // --- Render ---

    if (statsLoading && !pageData) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (statsError) {
        return <div className="bg-red-50 p-4 text-red-700">{statsError}</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
                    <p className="text-gray-500 mt-1">Manage, track, and assign your organization's assets.</p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Add New Asset
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Assets" value={stats?.totalAssets ?? 0} icon={<Package className="w-6 h-6 text-blue-600" />} color="bg-blue-50" />
                <StatCard title="Total Value" value={formatCurrency(stats?.totalValue ?? 0)} icon={<DollarSign className="w-6 h-6 text-green-600" />} color="bg-green-50" />
                <StatCard title="Active Licenses" value={stats?.activeLicenses ?? 0} icon={<Key className="w-6 h-6 text-purple-600" />} color="bg-purple-50" />
                <StatCard title="Available Assets" value={stats?.availableAssets ?? 0} icon={<CheckCircle className="w-6 h-6 text-emerald-600" />} color="bg-emerald-50" />
            </div>

            {/* Asset List Container */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Search & Filter */}
                <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Assets List</h2>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={queryParams.query}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="relative sm:w-40">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={queryParams.status}
                                onChange={(e) => handleStatusChange(e.target.value as AssetStatus | '')}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                            >
                                <option value="">All Status</option>
                                {Object.values(AssetStatus).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('name')}
                                >
                                    Asset Name {renderSortIcon('name')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                                <th
                                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('purchasePrice')}
                                >
                                    Value {renderSortIcon('purchasePrice')}
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isTableLoading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8">
                                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : (!pageData || pageData.content.length === 0) ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        No assets found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                pageData.content.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{asset.name}</span>
                                                <span className="text-xs text-gray-500">
                                                    {'serialNumber' in asset ? `SN: ${(asset as any).serialNumber}` : 'Software License'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                ${('serialNumber' in asset) ? 'bg-orange-100 text-orange-800' : 'bg-indigo-100 text-indigo-800'}`}>
                                                {('serialNumber' in asset) ? 'HARDWARE' : 'SOFTWARE'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={asset.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {asset.assignedTo ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                        {asset.assignedTo.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm text-gray-700">{asset.assignedTo.username}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">
                                            {formatCurrency(asset.purchasePrice)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    title="Assign User"
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                    onClick={() => handleAssignClick(asset)}
                                                >
                                                    <UserPlus size={16} />
                                                </button>

                                                <button
                                                    title="Edit"
                                                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                                    onClick={() => handleEditClick(asset)}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    title="Delete"
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                    onClick={() => handleDelete(asset.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {pageData && (
                    <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                        <div className="text-sm text-gray-700">
                            Showing <span className="font-medium">{pageData.number * pageData.size + 1}</span> to{' '}
                            <span className="font-medium">
                                {Math.min((pageData.number + 1) * pageData.size, pageData.totalElements)}
                            </span>{' '}
                            of <span className="font-medium">{pageData.totalElements}</span> results
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(queryParams.page - 1)}
                                disabled={pageData.first}
                                className={`px-4 py-2 text-sm font-medium border rounded-md shadow-sm transition-colors
                                    ${pageData.first
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(queryParams.page + 1)}
                                disabled={pageData.last}
                                className={`px-4 py-2 text-sm font-medium border rounded-md shadow-sm transition-colors
                                    ${pageData.last
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Asset Modal */}
            <AddAssetModal
                isOpen={isAddModalOpen}
                onClose={handleModalClose}
                onSuccess={handleAddSuccess}
                assetToEdit={editingAsset}
            />

            {/* Assign Asset Modal */}
            <AssignAssetModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                onSuccess={handleAddSuccess}
                asset={assigningAsset}
            />
        </div>
    );
};

export default Dashboard;