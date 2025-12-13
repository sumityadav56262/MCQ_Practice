import { Home, History, BookOpen, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { cn } from '../lib/utils';

export function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuthStore();

    const navItems = [
        {
            name: 'Home',
            icon: Home,
            path: '/',
            showForGuest: true,
        },
        {
            name: 'History',
            icon: History,
            path: '/history',
            showForGuest: false,
        },
        {
            name: 'Courses',
            icon: BookOpen,
            path: '/courses',
            showForGuest: true,
        },
        {
            name: 'Profile',
            icon: User,
            path: isAuthenticated ? '/profile' : '/login',
            showForGuest: true,
        },
    ];

    const visibleItems = navItems.filter(
        (item) => item.showForGuest || isAuthenticated
    );

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
            <div className="max-w-screen-xl mx-auto px-2">
                <div className="flex items-center justify-around h-16">
                    {visibleItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <button
                                key={item.name}
                                onClick={() => navigate(item.path)}
                                className={cn(
                                    'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                                    'active:scale-95'
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'w-6 h-6 transition-colors',
                                        active
                                            ? 'text-primary-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    )}
                                />
                                <span
                                    className={cn(
                                        'text-xs font-medium transition-colors',
                                        active
                                            ? 'text-primary-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    )}
                                >
                                    {item.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
