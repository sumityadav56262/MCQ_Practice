import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizStore } from '../stores/quizStore';
import { useAuthStore } from '../stores/authStore';
import { QuestionCard } from '../components/QuestionCard';
import { QuizProgress } from '../components/QuizProgress';
import { BottomNavigation } from '../components/BottomNavigation';
import api from '../lib/api';
import { Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export function QuizTaking() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [mode, setMode] = useState('exam'); // 'exam' or 'practice'
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({}); // { [questionId]: { isCorrect, explanation, correctOptionIds } }
    const [savedQuestions, setSavedQuestions] = useState(new Set());

    // AI Explanation State
    const [aiExplanation, setAiExplanation] = useState(null);
    const [loadingAi, setLoadingAi] = useState(false);

    // Guest Mode State
    const [guestAnswers, setGuestAnswers] = useState({}); // { [questionId]: { isCorrect, points } }

    const {
        currentQuiz,
        questions,
        currentQuestionIndex,
        selectedAnswers,
        attempt,
        setQuiz,
        setAttempt,
        selectAnswer,
        nextQuestion,
        previousQuestion,
        decrementTime,
    } = useQuizStore();

    useEffect(() => {
        loadQuizAndStart();
    }, [quizId]);

    // Reset AI explanation when question changes
    useEffect(() => {
        setAiExplanation(null);
    }, [currentQuestionIndex]);

    // Timer effect
    useEffect(() => {
        if (!currentQuiz) return;

        const timer = setInterval(() => {
            decrementTime();
            // Check expiry directly from store to avoid re-rendering this component
            const remaining = useQuizStore.getState().timeRemaining;

            if (remaining <= 0) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [currentQuiz]);



    const loadQuizAndStart = async () => {
        setLoading(true);
        try {
            // Fetch quiz details (Public)
            const quizResponse = await api.get(`/quizzes/${quizId}`);
            const quizData = quizResponse.data;
            setQuiz(quizData, quizData.questions);

            if (user) {
                try {
                    // Authenticated: Start attempt
                    const attemptResponse = await api.post(`/quizzes/${quizId}/start`);
                    setAttempt(attemptResponse.data);

                    // Check saved questions
                    const savedResponse = await api.get('/library/saved-questions');
                    const savedIds = new Set(savedResponse.data.data.map(q => q.question_id));
                    setSavedQuestions(savedIds);
                } catch (authError) {
                    if (authError.response?.status === 401) {
                        console.warn("Session expired or invalid, switching to guest mode.");
                        useAuthStore.getState().logout();
                        setAttempt(null);
                    } else {
                        throw authError; // Re-throw other errors to be caught by outer catch
                    }
                }
            } else {
                // Guest: No attempt creation
                setAttempt(null);
            }

            setLoading(false);
        } catch (error) {
            console.error('Failed to load quiz:', error);
            // Don't redirect immediately to allow viewing the error in console if needed, 
            // or show a UI error.
            alert("Error loading quiz: " + (error.response?.data?.message || error.message));
            setLoading(false); // Stop loading so we don't stare at a spinner
            // navigate('/quizzes'); 
        }
    };

    const handleExplainWithAi = async () => {
        if (!user) {
            setAiExplanation("Please login to use AI features.");
            return;
        }

        setLoadingAi(true);
        try {
            const currentQuestion = questions[currentQuestionIndex];
            const currentAnswers = selectedAnswers.get(currentQuestion.id);

            const response = await api.post('/ai/explain', {
                question_id: currentQuestion.id,
                selected_option: currentAnswers ? currentAnswers[0] : null
            });
            setAiExplanation(response.data.explanation);
        } catch (error) {
            console.error("Failed to get AI explanation", error);
            if (error.response?.status === 403 || error.response?.status === 503) {
                setAiExplanation("⚠️ " + (error.response?.data?.message || "Limit reached."));
            } else {
                setAiExplanation("Sorry, I couldn't generate an explanation right now.");
            }
        } finally {
            setLoadingAi(false);
        }
    };

    const handleSelectOption = (optionIds) => {
        const currentQuestion = questions[currentQuestionIndex];
        if (mode === 'practice' && feedback[currentQuestion.id]) return;
        selectAnswer(currentQuestion.id, optionIds);
    };

    const handleCheckAnswer = async () => {
        const currentQuestion = questions[currentQuestionIndex];
        const optionIds = selectedAnswers.get(currentQuestion.id);

        if (!optionIds || optionIds.length === 0) return;

        try {
            let responseData;

            if (user && attempt) {
                const response = await api.post(`/attempts/${attempt.attempt_id}/answer`, {
                    question_id: currentQuestion.id,
                    selected_option: optionIds,
                });
                responseData = response.data;
            } else {
                // Guest Stateless Check
                const response = await api.post(`/quizzes/check-answer`, {
                    question_id: currentQuestion.id,
                    selected_option: optionIds,
                });
                responseData = response.data;

                // Track guest score locally
                setGuestAnswers(prev => ({
                    ...prev,
                    [currentQuestion.id]: {
                        isCorrect: responseData.is_correct,
                        points: responseData.is_correct ? currentQuestion.points : 0
                    }
                }));
            }

            setFeedback(prev => ({
                ...prev,
                [currentQuestion.id]: responseData
            }));

        } catch (error) {
            console.error("Failed to check answer", error);
        }
    };

    const handleBookmark = async () => {
        if (!user) return; // Guests cannot bookmark
        const currentQuestion = questions[currentQuestionIndex];
        try {
            const response = await api.post(`/questions/${currentQuestion.id}/save`);
            if (response.data.saved) {
                setSavedQuestions(prev => new Set(prev).add(currentQuestion.id));
            } else {
                setSavedQuestions(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(currentQuestion.id);
                    return newSet;
                });
            }
        } catch (error) {
            console.error("Failed to bookmark", error);
        }
    };

    const handleSubmitQuiz = async () => {
        setSubmitting(true);
        try {
            if (user && attempt) {
                if (mode === 'exam') {
                    for (const [questionId, answers] of selectedAnswers.entries()) {
                        await api.post(`/attempts/${attempt.attempt_id}/answer`, {
                            question_id: questionId,
                            selected_option: answers,
                        });
                    }
                }
                await api.post(`/attempts/${attempt.attempt_id}/complete`);
                navigate(`/results/${attempt.attempt_id}`);
            } else {
                // Guest Submission Logic
                if (mode === 'exam') {
                    const results = {};
                    let totalScore = 0;

                    // Batch request for speed
                    const answersPayload = Array.from(selectedAnswers.entries()).map(([questionId, answers]) => ({
                        question_id: questionId,
                        selected_option: answers
                    }));

                    if (answersPayload.length > 0) {
                        try {
                            const response = await api.post('/quizzes/check-answers', { answers: answersPayload });
                            const batchResults = response.data;

                            // Transform to expected format results structure
                            Object.entries(batchResults).forEach(([qId, data]) => {
                                results[qId] = {
                                    isCorrect: data.is_correct,
                                    points: data.points,
                                    explanation: data.explanation,
                                    correct_option: data.correct_option
                                };
                                totalScore += data.points;
                            });

                        } catch (e) {
                            console.error("Batch check failed", e);
                            throw e;
                        }
                    }

                    // Navigate to results with state
                    navigate('/results/guest', {
                        state: {
                            quiz: currentQuiz,
                            questions: questions,
                            score: totalScore,
                            max_score: questions.reduce((sum, q) => sum + (q.points || 1), 0),
                            top_score: 0,
                            results,
                            selectedAnswers: Object.fromEntries(selectedAnswers)
                        }
                    });

                } else {
                    // Practice mode - already checked as we went
                    const totalScore = Object.values(guestAnswers).reduce((sum, a) => sum + a.points, 0);
                    navigate('/results/guest', {
                        state: {
                            quiz: currentQuiz,
                            questions: questions,
                            score: totalScore,
                            max_score: questions.reduce((sum, q) => sum + (q.points || 1), 0),
                            top_score: 0,
                            top_score: 0,
                            // reconstruct results from feedback/guestAnswers
                            results: feedback,
                            selectedAnswers: Object.fromEntries(selectedAnswers)
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Failed to submit quiz:', error);
            alert('Failed to submit quiz. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !currentQuiz || !questions.length) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <p className="mt-2 text-gray-600">Loading quiz...</p>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswers = selectedAnswers.get(currentQuestion.id) || [];
    const currentFeedback = feedback[currentQuestion.id];
    const hasFeedback = currentFeedback !== undefined && currentFeedback !== null;

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header with Mode Toggle */}
            <div className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-20">
                <div className="text-sm font-bold text-gray-900 line-clamp-1 flex-1 pr-4">
                    {currentQuiz.title}
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setMode('practice')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mode === 'practice' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'
                            }`}
                    >
                        Practice
                    </button>
                    <button
                        onClick={() => setMode('exam')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mode === 'exam' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'
                            }`}
                    >
                        Exam
                    </button>
                </div>
            </div>

            <QuizProgress
                currentQuestion={currentQuestionIndex}
                totalQuestions={questions.length}
            />

            <div className="max-w-2xl mx-auto p-4 mt-4">
                <QuestionCard
                    question={currentQuestion}
                    questionNumber={currentQuestionIndex + 1}
                    selectedOptions={currentAnswers}
                    onSelectOption={handleSelectOption}
                    isPracticeMode={mode === 'practice'}
                    feedback={currentFeedback}
                    onBookmark={handleBookmark}
                    isBookmarked={savedQuestions.has(currentQuestion.id)}
                />

                <BottomNavigation
                    canGoPrevious={currentQuestionIndex > 0}
                    canGoNext={currentQuestionIndex < questions.length - 1}
                    isLastQuestion={currentQuestionIndex === questions.length - 1}
                    onPrevious={previousQuestion}
                    onNext={nextQuestion}
                    onSubmit={handleSubmitQuiz}
                    // Extra props for practice check
                    onCheck={mode === 'practice' && !currentFeedback ? handleCheckAnswer : undefined}
                    isAnswered={currentAnswers.length > 0}
                    disabled={submitting}
                />

                {/* Explanation Section - Moved after buttons */}
                {hasFeedback && (
                    <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4">
                        <div className={cn(
                            "p-4 rounded-lg border",
                            currentFeedback.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                        )}>
                            <div className="flex items-center gap-2 mb-2">
                                {currentFeedback.isCorrect ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600" />
                                )}
                                <span className={cn(
                                    "font-bold",
                                    currentFeedback.isCorrect ? "text-green-700" : "text-red-700"
                                )}>
                                    {currentFeedback.isCorrect ? "Correct!" : "Incorrect"}
                                </span>
                            </div>
                            {currentFeedback.explanation && (
                                <p className="text-sm text-gray-700 mt-1">
                                    {currentFeedback.explanation}
                                </p>
                            )}
                        </div>

                        {/* AI Explanation Button */}
                        {!aiExplanation ? (
                            <button
                                onClick={handleExplainWithAi}
                                disabled={loadingAi}
                                className="w-full flex items-center justify-center gap-2 p-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 shadow-sm"
                            >
                                {loadingAi ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        <span className="font-semibold">Explain with AI</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="p-4 bg-violet-50 border border-violet-100 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-2 mb-2 text-violet-800 font-bold">
                                    <Sparkles className="w-5 h-5" />
                                    <span>GyanMitra AI Explanation</span>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {aiExplanation}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
