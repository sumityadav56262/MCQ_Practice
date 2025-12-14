import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, MoreVertical, FileText } from 'lucide-react';
import api from '../lib/api';

export function ManageQuizzes() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const response = await api.get('/admin/quizzes');
            // Handle pagination if needed, for now assuming data.data or data
            setQuizzes(response.data.data || response.data);
        } catch (error) {
            console.error('Failed to fetch quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this quiz?')) return;
        try {
            await api.delete(`/admin/quizzes/${id}`);
            setQuizzes(prev => prev.filter(q => q.id !== id));
        } catch (error) {
            console.error('Failed to delete quiz:', error);
            alert('Failed to delete quiz');
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/admin')} className="text-gray-500 hover:text-gray-900">
                            ←
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Manage Quizzes</h1>
                    </div>
                    <button
                        onClick={() => navigate('/admin/quizzes/new')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create Quiz</span>
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4">
                {/* Search - Placeholder */}
                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search quizzes..."
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {quizzes.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No quizzes found. Create one!</div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {quizzes.map((quiz) => (
                                    <div key={quiz.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {quiz.questions_count} questions • {quiz.subject?.name || 'No Subject'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/quizzes/${quiz.id}`)}
                                                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(quiz.id)}
                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
