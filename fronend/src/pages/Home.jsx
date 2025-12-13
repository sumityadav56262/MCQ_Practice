import { Search, SlidersHorizontal, ArrowRight, Zap, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export function Home() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All');
    const navigate = useNavigate();

    // Filters
    const filters = ['All', 'Easy', 'Medium', 'Hard', 'Exam'];

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await api.get('/subjects');
            setSubjects(response.data);
        } catch (error) {
            console.error('Failed to fetch subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    const filteredSubjects = subjects.filter(subject => {
        const matchesSearch = subject.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = selectedFilter === 'All' ||
            (subject.difficulty_level && subject.difficulty_level.toLowerCase() === selectedFilter.toLowerCase()); // Assuming difficulty_level exists, otherwise ignore

        return matchesSearch; // Simple search for now, will add rigorous filtering if backend supports it
    });

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header / Search Section */}
            <div className="sticky top-14 bg-white z-30 px-4 py-3 border-b border-gray-100 shadow-sm">
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search subjects, exams..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Horizontal Filters */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium whitespace-nowrap">
                        <SlidersHorizontal className="w-3 h-3" />
                        Filters
                    </button>
                    {filters.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setSelectedFilter(filter)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${selectedFilter === filter
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'bg-white border border-gray-200 text-gray-600'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Popular Subjects</h2>
                    <span className="text-xs text-primary-600 font-bold cursor-pointer">View All</span>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
                    </div>
                ) : filteredSubjects.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredSubjects.map((subject) => (
                            <div
                                key={subject.name}
                                onClick={() => navigate(`/quizzes/${encodeURIComponent(subject.name)}`)}
                                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between active:scale-98 transition-transform cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                                        <BookOpen className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{subject.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500">{subject.quiz_count} Quizzes</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span className="flex items-center gap-0.5 text-xs text-orange-600 font-medium">
                                                <Zap className="w-3 h-3" /> Medium
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 text-gray-300">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        No subjects found matching "{searchQuery}"
                    </div>
                )}
            </div>
        </div>
    );
}
