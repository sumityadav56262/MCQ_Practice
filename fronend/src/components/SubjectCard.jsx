import { BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';

export function SubjectCard({ subject, onSelect }) {
    const iconColors = [
        'bg-blue-100 text-blue-600',
        'bg-green-100 text-green-600',
        'bg-purple-100 text-purple-600',
        'bg-orange-100 text-orange-600',
        'bg-pink-100 text-pink-600',
    ];

    const colorIndex = subject.name.length % iconColors.length;

    return (
        <div
            onClick={onSelect}
            className="bg-white rounded-mobile shadow-mobile hover:shadow-mobile-lg transition-all cursor-pointer active:scale-95 p-6"
        >
            <div className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center mb-4',
                iconColors[colorIndex]
            )}>
                <BookOpen className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {subject.name}
            </h3>

            <p className="text-sm text-gray-600">
                {subject.quiz_count} {subject.quiz_count === 1 ? 'quiz' : 'quizzes'}
            </p>
        </div>
    );
}
