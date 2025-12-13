import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QuizCard } from '../components/QuizCard';
import { QuizCardSkeleton } from '../components/SkeletonLoader';
import api from '../lib/api';

export function QuizList() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { subject } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuizzes();
    }, [subject]);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const url = subject ? `/quizzes?category=${subject}` : '/quizzes';
            const response = await api.get(url);
            setQuizzes(response.data.data || response.data);
        } catch (error) {
            console.error('Failed to fetch quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartQuiz = (quizId) => {
        navigate(`/quiz/${quizId}`);
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="max-w-2xl mx-auto p-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {subject ? `${subject} Quizzes` : 'Available Quizzes'}
                    </h1>
                    {subject && (
                        <button
                            onClick={() => navigate('/')}
                            className="text-sm text-primary-600 hover:text-primary-700"
                        >
                            ← All Subjects
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <QuizCardSkeleton key={i} />
                        ))}
                    </div>
                ) : quizzes.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600">No quizzes available at the moment.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {quizzes.map((quiz) => (
                            <QuizCard
                                key={quiz.id}
                                quiz={quiz}
                                onStart={() => handleStartQuiz(quiz.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
