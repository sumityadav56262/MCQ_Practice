import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react';
import api from '../lib/api';

export function QuizEditor() {
    const { id } = useParams();
    const isNew = !id || id === 'new';
    const navigate = useNavigate();

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [subjects, setSubjects] = useState([]);

    const [quiz, setQuiz] = useState({
        title: '',
        description: '',
        duration_minutes: 30,
        passing_score: 60,
        subject_id: '',
        difficulty_level: 'medium',
        is_active: true,
        questions: []
    });

    useEffect(() => {
        fetchSubjects();
        if (!isNew) {
            fetchQuiz();
        }
    }, [id]);

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/subjects');
            setSubjects(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchQuiz = async () => {
        try {
            const res = await api.get(`/quizzes/${id}`); // Public endpoint returns structure
            // Or admin endpoint if structure differs.
            // Admin endpoint: ??? ApiAdminController does NOT have getQuiz($id) - it uses public `show`? 
            // Wait, standard QuizController::show returns questions.
            // Does it return correct options? Yes.

            // However, we might want to ensure we're using the data format we need.
            const data = res.data;
            setQuiz({
                title: data.title,
                description: data.description || '',
                duration_minutes: data.duration_minutes,
                passing_score: data.passing_score,
                subject_id: data.subject_id,
                difficulty_level: data.difficulty_level,
                is_active: true, // Assuming default
                questions: data.questions || []
            });
        } catch (err) {
            console.error(err);
            alert('Failed to load quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!quiz.title || !quiz.subject_id) {
            alert('Please fill in required fields');
            return;
        }

        setSaving(true);
        try {
            if (isNew) {
                await api.post('/admin/quizzes', quiz);
            } else {
                await api.put(`/admin/quizzes/${id}`, quiz);
            }
            alert('Quiz saved successfully');
            navigate('/admin/quizzes');
        } catch (err) {
            console.error(err);
            alert('Failed to save quiz');
        } finally {
            setSaving(false);
        }
    };

    // Note: Full Question Editor is complex. For now providing basic fields.
    // Ideally this would allow adding/removing questions.

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/admin/quizzes')} className="text-gray-500 hover:text-gray-900">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">{isNew ? 'Create Quiz' : 'Edit Quiz'}</h1>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        <span>{saving ? 'Saving...' : 'Save Quiz'}</span>
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Basic Info</h2>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={quiz.title}
                                onChange={e => setQuiz({ ...quiz, title: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="e.g. Engineering Physics Unit 1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={quiz.description}
                                onChange={e => setQuiz({ ...quiz, description: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <select
                                    value={quiz.subject_id}
                                    onChange={e => setQuiz({ ...quiz, subject_id: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                                <select
                                    value={quiz.difficulty_level}
                                    onChange={e => setQuiz({ ...quiz, difficulty_level: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins)</label>
                                <input
                                    type="number"
                                    value={quiz.duration_minutes}
                                    onChange={e => setQuiz({ ...quiz, duration_minutes: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
                                <input
                                    type="number"
                                    value={quiz.passing_score}
                                    onChange={e => setQuiz({ ...quiz, passing_score: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
