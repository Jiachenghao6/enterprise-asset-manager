import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    Home,
    Box,
    Users,
    Settings,
    LogOut,
    ChevronDown,
    Menu,
    X
} from 'lucide-react';
import { authService } from '../services/authService';
import { jwtDecode } from 'jwt-decode';
import { AUTH_TOKEN_KEY } from '../lib/api';

interface JwtPayload {
    sub: string; // Username
    role: string; // ADMIN or USER
    exp: number;
    firstname?: string;
    lastname?: string;
}

// [修改 1] 扩展接口，增加 allowedRoles 字段
interface NavItem {
    to: string;
    icon: React.ReactNode;
    label: string;
    allowedRoles?: string[]; // 如果未定义，则所有人可见；否则仅列表中的角色可见
}

// [修改 2] 配置菜单权限
// 根据你的要求：Assets, Users, Settings 仅 ADMIN 可见
const navItems: NavItem[] = [
    {
        to: '/dashboard',
        icon: <Home size={20} />,
        label: 'Dashboard'
        // 没有 allowedRoles，表示所有人可见
    },
    {
        to: '/assets',
        icon: <Box size={20} />,
        label: 'Assets',
        allowedRoles: ['ADMIN'] // 仅管理员可见
    },
    {
        to: '/users',
        icon: <Users size={20} />,
        label: 'Users',
        allowedRoles: ['ADMIN'] // 仅管理员可见
    },
    {
        to: '/settings',
        icon: <Settings size={20} />,
        label: 'Settings',
        allowedRoles: ['ADMIN'] // 仅管理员可见
    },
];

const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [username, setUsername] = useState<string>('User');
    // [修改 3] 新增状态用于存储当前用户角色
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);

        if (token) {
            try {
                const decoded = jwtDecode<JwtPayload>(token);

                if (decoded.sub) {
                    setUsername(decoded.sub);
                }
                // [修改 4] 获取并设置角色
                if (decoded.role) {
                    setUserRole(decoded.role);
                }
            } catch (error) {
                console.error("Token decode failed", error);
            }
        }
    }, []);

    const getInitials = (name: string) => {
        return name && name !== 'User' ? name.charAt(0).toUpperCase() : 'U';
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const getPageTitle = () => {
        const path = location.pathname;
        const item = navItems.find(nav => nav.to === path);
        return item?.label || 'Dashboard';
    };

    // [修改 5] 核心逻辑：过滤出当前用户可见的菜单项
    const visibleNavItems = navItems.filter(item => {
        // 如果菜单没有设置权限限制，或者是当前用户的角色在允许列表中
        if (!item.allowedRoles || item.allowedRoles.includes(userRole)) {
            return true;
        }
        return false;
    });

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Mobile menu overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
                    <h1 className="text-xl font-bold text-white">Asset Manager</h1>
                    <button
                        className="lg:hidden text-gray-400 hover:text-white"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="mt-6 px-3">
                    <ul className="space-y-1">
                        {/* [修改 6] 使用 visibleNavItems 替代 navItems 进行渲染 */}
                        {visibleNavItems.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-150
                    ${isActive
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                        }
                  `}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.icon}
                                    <span className="font-medium">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden text-gray-600 hover:text-gray-900"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h2>
                    </div>

                    <div className="relative">
                        <button
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                        >
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">{getInitials(username)}</span>
                            </div>
                            <span className="hidden sm:block text-sm font-medium text-gray-700">{username}</span>
                            <ChevronDown size={16} className={`text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isProfileOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsProfileOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;