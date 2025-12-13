import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { User, LogOut, Mail, Award, Zap, Flame, Trophy, TrendingUp } from 'lucide-react';
import api from '../lib/api';

export function Profile() {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, updateUser } = useAuthStore();

    const [apiKey, setApiKey] = React.useState('');
    const [savingKey, setSavingKey] = React.useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            refreshUserData();
        }
    }, [isAuthenticated]);

    const refreshUserData = async () => {
        try {
            const response = await api.get('/user');
            updateUser(response.data);
            if (response.data.gemini_api_key) {
                setApiKey(response.data.gemini_api_key);
            }
        } catch (error) {
            console.error('Failed to refresh user data:', error);
        }
    };

    const updateApiKey = async () => {
        setSavingKey(true);
        try {
            const response = await api.put('/student/profile', {
                gemini_api_key: apiKey
            });
            updateUser(response.data.user);
            alert('API Key updated successfully!');
        } catch (error) {
            console.error('Failed to update API key:', error);
            alert('Failed to update API key.');
        } finally {
            setSavingKey(false);
        }
    };

    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Calculate level progress (assuming 100 XP per level as per service)
    const xpForNextLevel = 100;
    const currentLevelProgress = (user?.xp || 0) % xpForNextLevel;

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="max-w-2xl mx-auto p-4">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-mobile p-6 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Trophy className="w-32 h-32 text-primary-600" />
                    </div>

                    <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                            <span className="text-3xl font-bold text-white">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">
                                    Lvl {user?.level || 1}
                                </span>
                                <span className="text-sm text-gray-600">Student</span>
                            </div>
                        </div>
                    </div>

                    {/* Gamification Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                        <div className="bg-orange-50 rounded-xl p-3 flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Flame className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-900">{user?.streak_count || 0}</div>
                                <div className="text-xs text-gray-600">Day Streak</div>
                            </div>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Zap className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-900">{user?.xp || 0}</div>
                                <div className="text-xs text-gray-600">Total XP</div>
                            </div>
                        </div>
                    </div>

                    {/* Level Progress */}
                    <div className="relative z-10">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Level {user?.level || 1}</span>
                            <span>{currentLevelProgress} / {xpForNextLevel} XP</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                                className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${currentLevelProgress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Badges Section */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-900">Badges</h3>
                        <span className="text-xs text-primary-600 font-medium">View All</span>
                    </div>
                    {user?.badges && user.badges.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            {user.badges.map((badge) => (
                                <div key={badge.id} className="flex-shrink-0 flex flex-col items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100 w-24">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                                        <Award className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <span className="text-xs font-medium text-center text-gray-900 line-clamp-1">{badge.name}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-4 rounded-xl border border-gray-100 text-center text-gray-500 text-sm">
                            No badges earned yet. Keep practicing!
                        </div>
                    )}
                </div>

                {/* Weak Topics Section */}
                {user?.weak_topics && user.weak_topics.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-bold text-gray-900 mb-3">Focus Areas</h3>
                        <div className="space-y-3">
                            {user.weak_topics.map((topic) => (
                                <div key={topic.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-50 rounded-lg">
                                            <TrendingUp className="w-4 h-4 text-red-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{topic.topic}</div>
                                            <div className="text-xs text-red-500">Confidence: {topic.confidence_score}%</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="text-xs font-bold text-primary-600 px-3 py-1.5 bg-primary-50 rounded-lg hover:bg-primary-100"
                                    >
                                        Practice
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <LeaderboardSection />

                {/* AI Settings */}
                <div className="bg-white rounded-2xl shadow-mobile p-6 mb-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-violet-600" />
                        AI Personalization
                    </h3>
                    <div className="space-y-4">
                        {apiKey && !savingKey ? (
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                                <div className="flex items-center gap-2 text-green-700">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-sm font-medium">Personal API Key Active</span>
                                </div>
                                <button
                                    onClick={() => setApiKey('')} // Clear to allow editing
                                    className="text-xs text-green-700 hover:underline font-medium"
                                >
                                    Change / Remove
                                </button>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Gemini API Key
                                </label>
                                <p className="text-xs text-gray-500 mb-2">
                                    Add your own API key to enable AI explanations.
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="Enter your Gemini API Key"
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                                    />
                                    <button
                                        onClick={updateApiKey}
                                        disabled={savingKey}
                                        className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                                    >
                                        {savingKey ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Options */}
                <div className="bg-white rounded-2xl shadow-mobile overflow-hidden mb-6">
                    <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
                        <User className="w-5 h-5 text-gray-600" />
                        <span className="flex-1 text-left text-gray-900">Edit Profile Details</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <span className="flex-1 text-left text-gray-900">Notifications</span>
                    </button>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-3 rounded-lg transition-colors active:scale-95"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}

function LeaderboardSection() {
    const [leaders, setLeaders] = React.useState([]);

    React.useEffect(() => {
        api.get('/leaderboard').then(res => setLeaders(res.data)).catch(console.error);
    }, []);

    if (leaders.length === 0) return null;

    return (
        <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Top Learners</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {leaders.map((leader, index) => (
                    <div key={leader.id} className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                index === 1 ? 'bg-gray-100 text-gray-700' :
                                    index === 2 ? 'bg-orange-100 text-orange-700' : 'text-gray-500'
                                }`}>
                                {index + 1}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{leader.name}</span>
                        </div>
                        <div className="text-xs font-bold text-primary-600">{leader.xp} XP</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

