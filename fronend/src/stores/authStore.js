import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: (userData, authToken) => {
                localStorage.setItem('auth_token', authToken);
                set({
                    user: userData,
                    token: authToken,
                    isAuthenticated: true,
                });
            },

            logout: () => {
                localStorage.removeItem('auth_token');
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                });
            },

            updateUser: (userData) => set({ user: userData }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
