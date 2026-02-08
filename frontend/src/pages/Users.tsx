import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Loader2, User as UserIcon, Mail, CheckCircle, XCircle, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService, UserFull } from '../services/adminService';
import { authService } from '../services/authService';
import { jwtDecode } from 'jwt-decode';

const Users: React.FC = () => {
    const [users, setUsers] = useState<UserFull[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUserSub, setCurrentUserSub] = useState('');

    // 获取当前登录用户名，防止自己降级自己
    useEffect(() => {
        const token = authService.getToken();
        if (token) {
            const decoded: any = jwtDecode(token);
            setCurrentUserSub(decoded.sub);
        }
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllUsers();
            setUsers(data);
            setError('');
        } catch (err: any) {
            console.error(err);
            if (err.response && err.response.status === 403) {
                setError('Access Denied: You do not have permission to view this page.');
            } else {
                setError('Failed to load users.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (user: UserFull) => {
        const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
        const actionName = newRole === 'ADMIN' ? 'Promote' : 'Demote';

        if (!window.confirm(`Are you sure you want to ${actionName.toLowerCase()} ${user.username}?`)) {
            return;
        }

        try {
            await adminService.updateUserRole(user.id, newRole);
            toast.success(`User ${user.username} has been ${actionName.toLowerCase()}d!`);
            fetchUsers(); // 刷新列表
        } catch (err) {
            toast.error('Failed to update role.');
        }
    };

    // [新增] 处理状态变更
    const handleStatusChange = async (user: UserFull) => {
        const newStatus = !user.enabled; // 取反
        const actionName = newStatus ? 'Enable' : 'Disable';
        const confirmMsg = newStatus
            ? `Are you sure you want to re-enable access for ${user.username}?`
            : `Are you sure you want to DISABLE access for ${user.username}? They will not be able to login.`;

        if (!window.confirm(confirmMsg)) {
            return;
        }

        try {
            await adminService.updateUserStatus(user.id, newStatus);
            toast.success(`User ${user.username} has been ${actionName.toLowerCase()}d!`);
            fetchUsers(); // 刷新列表以显示最新状态
        } catch (err: any) {
            // 如果后端返回 409 Conflict (尝试禁用自己)，显示具体错误信息
            if (err.response && err.response.status === 409) {
                toast.error(err.response.data || 'Cannot disable yourself.');
            } else {
                toast.error('Failed to update status.');
            }
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600" /></div>;

    if (error) return (
        <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <ShieldAlert size={20} />
            {error}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500 mt-1">View users and manage permissions.</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    <Shield size={16} />
                    Admin Area
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                {/* [新增] 状态列头 */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className={`transition-colors ${user.enabled ? 'hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                                                ${user.enabled ? 'bg-gray-100 text-gray-600' : 'bg-gray-200 text-gray-400'}`}>
                                                <UserIcon size={16} />
                                            </div>
                                            <div className={!user.enabled ? 'opacity-60' : ''}>
                                                <div className="font-medium text-gray-900">{user.username}</div>
                                                <div className="text-xs text-gray-500">{user.firstname} {user.lastname}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`flex items-center gap-2 text-gray-600 text-sm ${!user.enabled ? 'opacity-60' : ''}`}>
                                            <Mail size={14} />
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${user.role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                : 'bg-blue-100 text-blue-800 border border-blue-200'}
                                            ${!user.enabled ? 'opacity-60 grayscale' : ''}`}>
                                            {user.role}
                                        </span>
                                    </td>

                                    {/* [新增] 状态展示列 */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border
                                            ${user.enabled
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            {user.enabled ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                            {user.enabled ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        {user.username !== currentUserSub && (
                                            <div className="flex justify-end items-center gap-3">
                                                {/* 角色按钮 */}
                                                <button
                                                    onClick={() => handleRoleChange(user)}
                                                    disabled={!user.enabled} // 禁用状态下不允许提升角色
                                                    className={`font-medium hover:underline focus:outline-none 
                                                        ${!user.enabled ? 'text-gray-400 cursor-not-allowed' :
                                                            user.role === 'ADMIN' ? 'text-orange-600 hover:text-orange-800' : 'text-blue-600 hover:text-blue-800'}`}
                                                >
                                                    {user.role === 'ADMIN' ? 'Demote' : 'Promote'}
                                                </button>

                                                {/* 分隔线 */}
                                                <span className="text-gray-300">|</span>

                                                {/* [新增] 禁用/启用按钮 */}
                                                <button
                                                    onClick={() => handleStatusChange(user)}
                                                    className={`font-medium hover:underline focus:outline-none flex items-center gap-1
                                                        ${user.enabled ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                                                    title={user.enabled ? "Disable this user" : "Enable this user"}
                                                >
                                                    <Power size={14} />
                                                    {user.enabled ? 'Disable' : 'Enable'}
                                                </button>
                                            </div>
                                        )}
                                        {user.username === currentUserSub && (
                                            <span className="text-gray-400 italic text-xs">Current User</span>
                                        )}
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

export default Users;