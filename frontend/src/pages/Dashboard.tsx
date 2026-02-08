import React, { useState, useEffect } from 'react';
import {
    Plus, Package, DollarSign, Key, CheckCircle, Loader2,
    Search, Filter, Trash2, Edit, UserPlus
} from 'lucide-react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { AssetStatus, Asset } from '../types/asset';
import { assetService } from '../services/assetService';
import AddAssetModal from '../components/AddAssetModal';

// --- 组件定义保持不变 ---
interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

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

const Dashboard: React.FC = () => {
    // 1. 保留原本的统计 Hook
    const { stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();

    // 2. 新增状态管理：资产列表、搜索、筛选
    const [assets, setAssets] = useState<Asset[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<AssetStatus | ''>('');
    const [isTableLoading, setIsTableLoading] = useState(false);

    // Modal 状态
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null); // 用于存储当前正在编辑的资产

    // 3. 获取资产列表的方法 (支持搜索和筛选)
    const fetchAssets = async () => {
        setIsTableLoading(true);
        try {
            const data = await assetService.searchAssets({
                query: searchQuery,
                status: statusFilter
            });
            setAssets(data);
        } catch (err) {
            console.error('Failed to fetch assets', err);
        } finally {
            setIsTableLoading(false);
        }
    };

    // --- 新增：处理编辑点击 ---
    const handleEditClick = (asset: Asset) => {
        setEditingAsset(asset); // 设置当前编辑对象
        setIsAddModalOpen(true); // 打开 Modal
    };

    // --- 新增：处理新建点击 ---
    const handleAddClick = () => {
        setEditingAsset(null); // 明确清空编辑对象，表示这是“新增”模式
        setIsAddModalOpen(true);
    };

    // 当搜索词或筛选条件变化时，重新获取列表
    useEffect(() => {
        // 添加防抖 (Debounce) 以避免频繁请求
        const timer = setTimeout(() => {
            fetchAssets();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, statusFilter]);

    // --- 修改：处理删除逻辑 ---
    const handleDelete = async (id: number) => {
        // 二次确认框
        if (window.confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
            try {
                await assetService.deleteAsset(id);
                // 成功后刷新列表和统计
                fetchAssets();
                refetchStats();
            } catch (err) {
                console.error(err);
                alert('Failed to delete asset');
            }
        }
    };

    // Modal 关闭时，记得清空 editingAsset
    const handleModalClose = () => {
        setIsAddModalOpen(false);
        setTimeout(() => setEditingAsset(null), 300); // 稍微延迟清空，避免 Modal 消失时突然变空
    };

    // 处理成功添加后的回调
    const handleAddSuccess = () => {
        fetchAssets();
        refetchStats();
    };

    if (statsLoading && !assets.length) {
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
                    onClick={handleAddClick} // [修改] 使用 handleAddClick
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

            {/* Asset List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Search & Filter */}
                <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Assets List</h2>

                    <div className="flex gap-2 w-full sm:w-auto">
                        {/* Search Bar */}
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative sm:w-40">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as AssetStatus | '')}
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
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
                            ) : assets.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        No assets found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                assets.map((asset) => (
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
                                                    onClick={() => console.log('Assign clicked', asset.id)}
                                                >
                                                    <UserPlus size={16} />
                                                </button>
                                                <button
                                                    title="Edit"
                                                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                                    onClick={() => handleEditClick(asset)} // [修改] 调用 handleEditClick
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
            </div>

            {/* Add/Edit Asset Modal */}
            <AddAssetModal
                isOpen={isAddModalOpen}
                onClose={handleModalClose} // [修改] 使用 handleModalClose
                onSuccess={handleAddSuccess}
                assetToEdit={editingAsset} // [修改] 传递当前编辑对象
            />
        </div>
    );
};

export default Dashboard;