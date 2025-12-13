import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileJson, CheckCircle, XCircle } from 'lucide-react';
import api from '../lib/api';

export function BulkImport() {
    const [jsonData, setJsonData] = useState('');
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState(null);
    const navigate = useNavigate();

    const exampleJSON = {
        quizzes: [
            {
                title: "JavaScript Basics",
                description: "Test your JavaScript fundamentals",
                subject: "Programming",
                difficulty_level: "easy",
                duration_minutes: 20,
                passing_score: 70,
                questions: [
                    {
                        question_text: "What is JavaScript?",
                        points: 1,
                        explanation: "JavaScript is a programming language used for web development.",
                        options: [
                            "A programming language",
                            "A database",
                            "An operating system",
                            "A web server"
                        ],
                        correct_option: "A programming language"
                    }
                ]
            }
        ]
    };

    const handleImport = async () => {
        try {
            setImporting(true);
            setResult(null);

            const data = JSON.parse(jsonData);
            const response = await api.post('/admin/bulk-import', data);

            setResult({
                success: true,
                message: response.data.message,
                count: response.data.imported_count,
            });

            setJsonData('');
        } catch (error) {
            setResult({
                success: false,
                message: error.response?.data?.message || error.message || 'Import failed',
            });
        } finally {
            setImporting(false);
        }
    };

    const loadExample = () => {
        setJsonData(JSON.stringify(exampleJSON, null, 2));
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">Bulk Import Quizzes</h1>
                        <button
                            onClick={() => navigate('/admin')}
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4">
                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <FileJson className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-1">JSON Format Instructions</h3>
                            <p className="text-sm text-blue-800 mb-2">
                                Paste your JSON data below. The format should include a "quizzes" array with quiz objects.
                            </p>
                            <button
                                onClick={loadExample}
                                className="text-sm text-blue-600 hover:text-blue-700 underline"
                            >
                                Load Example JSON
                            </button>
                        </div>
                    </div>
                </div>

                {/* JSON Input */}
                <div className="bg-white rounded-lg shadow-mobile p-6 mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        JSON Data
                    </label>
                    <textarea
                        value={jsonData}
                        onChange={(e) => setJsonData(e.target.value)}
                        placeholder="Paste your JSON data here..."
                        className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>

                {/* Result Message */}
                {result && (
                    <div className={`rounded-lg p-4 mb-6 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}>
                        <div className="flex items-start gap-3">
                            {result.success ? (
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            )}
                            <div>
                                <h3 className={`font-semibold ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                                    {result.success ? 'Import Successful!' : 'Import Failed'}
                                </h3>
                                <p className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                                    {result.message}
                                </p>
                                {result.count && (
                                    <p className="text-sm text-green-800 mt-1">
                                        Imported {result.count} quiz(es)
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Import Button */}
                <button
                    onClick={handleImport}
                    disabled={!jsonData || importing}
                    className="w-full h-12 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {importing ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Importing...</span>
                        </>
                    ) : (
                        <>
                            <Upload className="w-5 h-5" />
                            <span>Import Quizzes</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
