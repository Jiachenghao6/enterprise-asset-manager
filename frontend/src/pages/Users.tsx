import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Loader2, User as UserIcon, Mail } from 'lucide-react';
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
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                                <UserIcon size={16} />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{user.username}</div>
                                                <div className="text-xs text-gray-500">{user.firstname} {user.lastname}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                            <Mail size={14} />
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${user.role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                : 'bg-green-100 text-green-800 border border-green-200'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        {/* 防止操作自己 */}
                                        {user.username !== currentUserSub && (
                                            <button
                                                onClick={() => handleRoleChange(user)}
                                                className={`font-medium hover:underline focus:outline-none 
                                                    ${user.role === 'ADMIN' ? 'text-orange-600 hover:text-orange-800' : 'text-blue-600 hover:text-blue-800'}`}
                                            >
                                                {user.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                                            </button>
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