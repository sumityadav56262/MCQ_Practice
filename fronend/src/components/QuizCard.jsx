import { Clock, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';

export function QuizCard({ quiz, onStart }) {
    const getDifficultyColor = (level) => {
        switch (level) {
            case 'easy':
                return 'bg-green-100 text-green-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'hard':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div
            className="bg-white rounded-mobile shadow-mobile hover:shadow-mobile-lg transition-all cursor-pointer active:scale-95 p-6"
            onClick={onStart}
        >
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                {quiz.difficulty_level && (
                    <span className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        getDifficultyColor(quiz.difficulty_level)
                    )}>
                        {quiz.difficulty_level}
                    </span>
                )}
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {quiz.description}
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{quiz.duration_minutes} min</span>
                </div>
                <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{quiz.questions_count} questions</span>
                </div>
            </div>
        </div>
    );
}
