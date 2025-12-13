import { Clock } from 'lucide-react';

export function QuizProgress({
    currentQuestion,
    totalQuestions,
    timeRemaining
}) {
    const progress = ((currentQuestion + 1) / totalQuestions) * 100;
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    return (
        <div className="sticky top-0 bg-white z-10 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                    Question {currentQuestion + 1} of {totalQuestions}
                </span>
                <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                    <Clock className="w-4 h-4" />
                    <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>
                </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
}
