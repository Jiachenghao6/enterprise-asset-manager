import React from 'react';
import { Plus, Package, DollarSign, Key, CheckCircle, Loader2 } from 'lucide-react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { AssetStatus } from '../types/asset';

/**
 * Stats Card Component
 */
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

/**
 * Status Badge Component
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

/**
 * Format currency value
 */
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
};

/**
 * Dashboard Page Component
 */
const Dashboard: React.FC = () => {
    const { stats, recentAssets, isLoading, error } = useDashboardStats();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header with Quick Action */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
                    <p className="text-gray-500 mt-1">Here's what's happening with your assets today.</p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus size={20} />
                    Add New Asset
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Assets"
                    value={stats?.totalAssets ?? 0}
                    icon={<Package className="w-6 h-6 text-blue-600" />}
                    color="bg-blue-50"
                />
                <StatCard
                    title="Total Value"
                    value={formatCurrency(stats?.totalValue ?? 0)}
                    icon={<DollarSign className="w-6 h-6 text-green-600" />}
                    color="bg-green-50"
                />
                <StatCard
                    title="Active Licenses"
                    value={stats?.activeLicenses ?? 0}
                    icon={<Key className="w-6 h-6 text-purple-600" />}
                    color="bg-purple-50"
                />
                <StatCard
                    title="Available Assets"
                    value={stats?.availableAssets ?? 0}
                    icon={<CheckCircle className="w-6 h-6 text-emerald-600" />}
                    color="bg-emerald-50"
                />
            </div>

            {/* Recent Assets Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Assets</h2>
                    <p className="text-sm text-gray-500 mt-1">Top 5 most recently added assets</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Current Value
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {recentAssets.map((asset) => (
                                <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${asset.type === 'HARDWARE' ? 'bg-orange-100 text-orange-800' : 'bg-indigo-100 text-indigo-800'
                                            }`}>
                                            {asset.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={asset.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">
                                        {formatCurrency(asset.currentValue)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
