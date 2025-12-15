import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Save, ArrowLeft } from 'lucide-react';
import api from '../lib/api';

export function ChangePassword() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const toggleShowPassword = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (formData.new_password.length < 8) {
            setError('New password must be at least 8 characters long');
            setLoading(false);
            return;
        }

        if (formData.new_password !== formData.confirm_password) {
            setError('New passwords do not match');
            setLoading(false);
            return;
        }

        try {
            await api.post('/auth/change-password', {
                current_password: formData.current_password,
                password: formData.new_password,
                password_confirmation: formData.confirm_password,
            });
            setSuccess('Password changed successfully');
            setFormData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="max-w-md mx-auto p-4">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
                </div>

                <div className="bg-white rounded-mobile shadow-sm border border-gray-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    name="current_password"
                                    value={formData.current_password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-12 py-3  rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleShowPassword('current')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    name="new_password"
                                    value={formData.new_password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-12 py-3  rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleShowPassword('new')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    name="confirm_password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-12 py-3  rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleShowPassword('confirm')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50  text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50  text-green-700 px-4 py-3 rounded-lg text-sm">
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5  border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Update Password</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
