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
// [修复 1] 引入正确的 Token Key
import { AUTH_TOKEN_KEY } from '../lib/api';

interface JwtPayload {
    sub: string; // Username
    role: string;
    exp: number;
    // 如果后续后端加了 firstname/lastname，可以在这里加定义
    firstname?: string;
    lastname?: string;
}

interface NavItem {
    to: string;
    icon: React.ReactNode;
    label: string;
}

const navItems: NavItem[] = [
    { to: '/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { to: '/assets', icon: <Box size={20} />, label: 'Assets' },
    // 如果你想让普通用户看不到 Users 菜单，可以在这里加逻辑判断
    { to: '/users', icon: <Users size={20} />, label: 'Users' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
];

const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // 默认显示 User，直到解析成功
    const [username, setUsername] = useState<string>('User');

    useEffect(() => {
        // [修复 2] 使用统一的 Key 获取 Token
        const token = localStorage.getItem(AUTH_TOKEN_KEY);

        console.log("🔍 Debug: Checking Token...", token ? "Found" : "Missing");

        if (token) {
            try {
                const decoded = jwtDecode<JwtPayload>(token);
                console.log("✅ Debug: Decoded Token:", decoded);

                // [修复 3] 优先显示 sub (用户名)，如果有其他字段也可以在这里扩展
                if (decoded.sub) {
                    setUsername(decoded.sub);
                }
            } catch (error) {
                console.error("❌ Debug: Token decode failed", error);
                // 如果 Token 坏了，也可以考虑踢出用户
                // authService.logout();
                // navigate('/login');
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
                        {navItems.map((item) => (
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
                                {/* 显示首字母 */}
                                <span className="text-white text-sm font-medium">{getInitials(username)}</span>
                            </div>
                            {/* 显示完整用户名 */}
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