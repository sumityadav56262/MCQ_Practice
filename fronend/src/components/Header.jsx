import { GraduationCap, Menu, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function Header() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuthStore();

    return (
        <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
            <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
                {/* Logo */}
                <div
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 cursor-pointer"
                >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                        GyanMitra
                    </span>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                    {isAuthenticated && user ? (
                        <div className="relative group">
                            <button className="flex items-center gap-2 focus:outline-none">
                                <span className="hidden sm:inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full ">
                                    Lvl {user.level || 1}
                                </span>
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center ">
                                    <span className="text-sm font-semibold text-primary-700">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-sm border border-gray-200 py-1 hidden group-hover:block hover:block transition-colors duration-200">
                                <div className="px-4 py-2">
                                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                    <p className="text-xs text-gray-600 truncate">{user.email}</p>
                                </div>

                                <button
                                    onClick={() => navigate('/change-password')}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                                >
                                    Change Password
                                </button>
                                <button
                                    onClick={() => {
                                        useAuthStore.getState().logout();
                                        navigate('/login');
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors active:scale-95"
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
