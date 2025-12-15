import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, Home } from 'lucide-react';
import api from '../lib/api';

export function QuizResults() {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); // Hook to access state
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (location.state) {
            // Guest mode with passing state
            setResult(location.state);
            setLoading(false);
        } else if (attemptId && attemptId !== 'guest') {
            fetchResults();
        } else {
            setLoading(false);
        }
    }, [attemptId, location.state]);

    const fetchResults = async () => {
        try {
            const response = await api.get(`/attempts/${attemptId}`);
            setResult(response.data);
        } catch (error) {
            console.error('Failed to fetch results:', error);
            alert('Failed to load results. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <p className="mt-2 text-gray-600">Loading results...</p>
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">No results found.</p>
                </div>
            </div>
        );
    }

    const passed = result.passed;

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="max-w-2xl mx-auto p-4">
                {/* Score Card */}
                <div className="bg-white rounded-mobile shadow-mobile-lg p-6 text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{result.quiz.title}</h2>

                    {/* XP Earned - Only for auth users/when present */}
                    {result.xp_earned > 0 && (
                        <div className="mb-4 inline-flex items-center gap-2 px-4 py-1 bg-yellow-100 text-yellow-800 rounded-full font-bold text-sm">
                            <span>+{result.xp_earned} XP Earned!</span>
                        </div>
                    )}

                    <div className="text-6xl font-bold text-primary-600 mb-2">
                        {Math.round(result.percentage !== undefined ? result.percentage : (result.score / result.max_score * 100))}%
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                        {result.score} / {result.max_score} points
                    </div>

                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${passed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {passed ? 'PASSED' : 'FAILED'}
                    </span>
                </div>

                {/* Answer Review */}
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Answer Review</h2>
                <div className="space-y-4">
                    {/* Handle Guest vs Auth structure */}
                    {(result.answers || Object.entries(result.results || {}).map(([qId, r]) => {
                        // Try to find question in passed state questions (guest) or result.questions (if API sends it)
                        const questionsList = result.questions || location.state?.questions || location.state?.quiz?.questions || [];
                        const question = questionsList.find(q => q.id === parseInt(qId));

                        return {
                            question_text: question ? question.question_text : `Question ${qId}`,
                            is_correct: r.isCorrect,
                            explanation: r.explanation,
                            selected_options: result.selectedAnswers[qId] || [],
                            correct_options: [r.correct_option]
                        };
                    })).map((answer, index) => (
                        <div key={index} className="bg-white rounded-mobile p-6">
                            <div className="flex items-start justify-between mb-3">
                                <span className="text-sm font-medium text-gray-700">
                                    Question {index + 1}
                                </span>
                                {answer.is_correct ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600" />
                                )}
                            </div>

                            <p className="text-base text-gray-900 mb-3">{answer.question_text}</p>

                            <div className="space-y-2 mb-3">
                                <div>
                                    <span className="text-sm text-gray-600">
                                        {Array.isArray(answer.selected_options) ? answer.selected_options.join(', ') : 'Skipped'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-green-700">Correct answer: </span>
                                    <span className="text-sm text-green-600">
                                        {Array.isArray(answer.correct_options) ? answer.correct_options.join(', ') : ''}
                                    </span>
                                </div>
                            </div>

                            {answer.explanation && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm font-medium text-blue-900 mb-1">Explanation:</p>
                                    <p className="text-sm text-blue-800">{answer.explanation}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Bottom Action */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
                    <div className="max-w-2xl mx-auto">
                        <button
                            onClick={() => navigate('/quizzes')}
                            className="w-full h-12 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all active:scale-95"
                        >
                            <Home className="w-5 h-5" />
                            <span>Back to Quizzes</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
