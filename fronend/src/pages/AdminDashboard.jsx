import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, BookOpen, FileText, Upload } from 'lucide-react';
import api from '../lib/api';

export function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            if (error.response?.status === 403) {
                alert('Admin access required');
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <p className="mt-2 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <button
                            onClick={() => navigate('/')}
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            ← Back to Home
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-6 shadow-mobile">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Quizzes</p>
                                <p className="text-3xl font-bold text-gray-900">{stats?.total_quizzes || 0}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-mobile">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Quizzes</p>
                                <p className="text-3xl font-bold text-green-600">{stats?.active_quizzes || 0}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <BarChart3 className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-mobile">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Questions</p>
                                <p className="text-3xl font-bold text-purple-600">{stats?.total_questions || 0}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <BookOpen className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-mobile">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Subjects</p>
                                <p className="text-3xl font-bold text-orange-600">{stats?.total_subjects || 0}</p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-full">
                                <BookOpen className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={() => navigate('/admin/quizzes')}
                        className="bg-white rounded-lg p-6 shadow-mobile hover:shadow-mobile-lg transition-all text-left"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-primary-100 p-4 rounded-full">
                                <FileText className="w-8 h-8 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Manage Quizzes</h3>
                                <p className="text-sm text-gray-600">Create, edit, and delete quizzes</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/admin/bulk-import')}
                        className="bg-white rounded-lg p-6 shadow-mobile hover:shadow-mobile-lg transition-all text-left"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 p-4 rounded-full">
                                <Upload className="w-8 h-8 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Bulk Import</h3>
                                <p className="text-sm text-gray-600">Import quizzes from JSON</p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Recent Quizzes */}
                <div className="bg-white rounded-lg p-6 shadow-mobile">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Quizzes</h2>
                    {stats?.recent_quizzes && stats.recent_quizzes.length > 0 ? (
                        <div className="space-y-3">
                            {stats.recent_quizzes.map((quiz) => (
                                <div key={quiz.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{quiz.title}</p>
                                        <p className="text-sm text-gray-600">
                                            Created {new Date(quiz.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/admin/quizzes/${quiz.id}`)}
                                        className="text-sm text-primary-600 hover:text-primary-700"
                                    >
                                        Edit →
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600">No quizzes yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}
