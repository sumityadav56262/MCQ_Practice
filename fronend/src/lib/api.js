import axios from 'axios';
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const api = axios.create({
    baseURL: VITE_API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("401 Unauthorized from:", error.config.url);
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('auth_token');
            // Only redirect if we are NOT already on a public page or guest flow
            // But we don't know the current route easily here without window.location
            if (!window.location.pathname.startsWith('/quiz')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
