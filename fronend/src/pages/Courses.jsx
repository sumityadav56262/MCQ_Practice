import { useState, useEffect } from 'react';
import { BookOpen, Clock, Award, Bookmark, AlertTriangle, ArrowRight, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../lib/api';

export function Courses() {
    const [activeTab, setActiveTab] = useState('courses'); // courses, saved, weak
    const [courses, setCourses] = useState([
        {
            id: 1,
            title: 'Web Development',
            description: 'Master HTML, CSS, JavaScript and modern frameworks',
            quizCount: 1,
            color: 'from-blue-500 to-blue-700',
        },
        {
            id: 2,
            title: 'Frontend Development',
            description: 'Learn React, Vue, and modern frontend technologies',
            quizCount: 1,
            color: 'from-purple-500 to-purple-700',
        },
        {
            id: 3,
            title: 'Database Design',
            description: 'Database normalization, SQL, and NoSQL concepts',
            quizCount: 1,
            color: 'from-green-500 to-green-700',
        },
    ]);

    // Data states
    const [savedQuestions, setSavedQuestions] = useState([]);
    const [weakTopics, setWeakTopics] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'saved') {
            fetchSavedQuestions();
        } else if (activeTab === 'weak') {
            fetchWeakTopics();
        }
    }, [activeTab]);

    const fetchSavedQuestions = async () => {
        setLoading(true);
        try {
            const response = await api.get('/library/saved-questions');
            setSavedQuestions(response.data.data);
        } catch (error) {
            console.error("Failed to fetch saved questions", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWeakTopics = async () => {
        setLoading(true);
        try {
            const response = await api.get('/library/weak-topics');
            setWeakTopics(response.data);
        } catch (error) {
            console.error("Failed to fetch weak topics", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnsave = async (questionId) => {
        try {
            await api.post(`/questions/${questionId}/save`);
            setSavedQuestions(prev => prev.filter(item => item.question_id !== questionId));
        } catch (error) {
            console.error("Failed to unsave", error);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="sticky top-0 z-10 bg-white border-b shadow-sm pt-4 px-4 pb-0">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Study Library</h1>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {[
                            { id: 'courses', label: 'All Courses', icon: BookOpen },
                            { id: 'saved', label: 'Saved Questions', icon: Bookmark },
                            { id: 'weak', label: 'Weak Topics', icon: AlertTriangle },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border",
                                    activeTab === tab.id
                                        ? "bg-primary-600 border-primary-600 text-white shadow-md"
                                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 mt-4">
                {activeTab === 'courses' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="bg-white rounded-2xl shadow-mobile hover:shadow-mobile-lg transition-all cursor-pointer overflow-hidden group"
                                >
                                    <div className={`h-32 bg-gradient-to-br ${course.color} p-6 flex items-center justify-center`}>
                                        <BookOpen className="w-16 h-16 text-white opacity-90" />
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                                            {course.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {course.description}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Award className="w-4 h-4" />
                                                <span>{course.quizCount} Quizzes</span>
                                            </div>
                                            <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                                                Start →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 bg-gradient-to-r from-primary-50 to-purple-50 rounded-2xl p-8 text-center">
                            <Clock className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">More Courses Coming Soon!</h3>
                            <p className="text-gray-600">
                                We're working on adding more courses to help you master new skills
                            </p>
                        </div>
                    </>
                )}

                {activeTab === 'saved' && (
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            </div>
                        ) : savedQuestions.length === 0 ? (
                            <div className="text-center p-8 bg-gray-50 rounded-xl">
                                <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600 font-medium">No saved questions yet.</p>
                                <p className="text-sm text-gray-400">Bookmark questions during quizzes to review them here.</p>
                            </div>
                        ) : (
                            savedQuestions.map((item) => (
                                <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-xs font-semibold px-2 py-1 bg-primary-100 text-primary-700 rounded-md">
                                            Question
                                        </span>
                                        <button
                                            onClick={() => handleUnsave(item.question_id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-3">{item.question.question_text}</h3>
                                    <div className="space-y-2">
                                        {item.question.options.map(opt => (
                                            <div key={opt.id} className={cn(
                                                "p-2 rounded-lg text-sm border",
                                                // We don't show correct answer immediately in review list, maybe valid?
                                                // Or should we? Let's keep it neutral for review.
                                                "bg-gray-50 border-gray-200 text-gray-700"
                                            )}>
                                                {opt.option_text}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'weak' && (
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            </div>
                        ) : weakTopics.length === 0 ? (
                            <div className="text-center p-8 bg-gray-50 rounded-xl">
                                <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600 font-medium">No weak topics identified yet.</p>
                                <p className="text-sm text-gray-400">Keep taking quizzes to identify areas for improvement.</p>
                            </div>
                        ) : (
                            weakTopics.map((topic) => (
                                <div key={topic.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{topic.topic}</h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <div className="text-sm text-gray-500">
                                                Confidence: <span className={cn(
                                                    "font-bold",
                                                    topic.confidence_score < 40 ? "text-red-500" : "text-yellow-500"
                                                )}>{topic.confidence_score}%</span>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {topic.correct_attempts}/{topic.total_attempts} correct
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => window.location.href = '/'}
                                        className="flex items-center gap-1 px-3 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
                                    >
                                        Practice
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
