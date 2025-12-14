import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';

export function QuizHistory() {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchHistory();
    }, [isAuthenticated]);

    const fetchHistory = async () => {
        try {
            const response = await api.get('/my-attempts');
            // Handle paginated response
            const data = response.data;
            setAttempts(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error('Failed to fetch history:', error);
            setAttempts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, attemptId) => {
        e.stopPropagation(); // Prevent card click
        if (!window.confirm('Are you sure you want to delete this attempt? This cannot be undone.')) {
            return;
        }

        try {
            await api.delete(`/attempts/${attemptId}`);
            setAttempts(prev => prev.filter(a => a.id !== attemptId));
        } catch (error) {
            console.error('Failed to delete attempt:', error);
            alert('Failed to delete attempt');
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="max-w-2xl mx-auto p-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Quiz History</h1>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        <p className="mt-2 text-gray-600">Loading history...</p>
                    </div>
                ) : attempts.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-primary-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No quiz history yet</h3>
                        <p className="text-gray-600 mb-6">Start taking quizzes to see your progress here</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Browse Quizzes
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {attempts.map((attempt) => (
                            <div
                                key={attempt.id}
                                onClick={() => navigate(`/results/${attempt.id}`)}
                                className="bg-white rounded-lg shadow-mobile p-4 cursor-pointer hover:shadow-mobile-lg transition-all active:scale-98 group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{attempt.quiz?.title || 'Unknown Quiz'}</h3>
                                        <p className="text-sm text-gray-600">
                                            {new Date(attempt.completed_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {attempt.passed ? (
                                            <CheckCircle className="w-6 h-6 text-green-600" />
                                        ) : (
                                            <XCircle className="w-6 h-6 text-red-600" />
                                        )}
                                        <button
                                            onClick={(e) => handleDelete(e, attempt.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            title="Delete Attempt"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-primary-600">
                                                {Math.round(attempt.percentage)}%
                                            </div>
                                            <div className="text-xs text-gray-600">Score</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-semibold text-gray-900">
                                                {attempt.score}/{attempt.max_score}
                                            </div>
                                            <div className="text-xs text-gray-600">Points</div>
                                        </div>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${attempt.passed
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {attempt.passed ? 'Passed' : 'Failed'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
