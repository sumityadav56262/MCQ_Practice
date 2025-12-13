import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export function BottomNavigation({
    canGoPrevious,
    canGoNext,
    isLastQuestion,
    onPrevious,
    onNext,
    onSubmit,
    onCheck, // New prop for practice mode check
    isAnswered, // New prop to disable check if no answer selected
}) {
    return (
        <div className="mt-6 flex items-center justify-between gap-3">
            <button
                onClick={onPrevious}
                disabled={!canGoPrevious}
                className={cn(
                    'flex-1 h-12 flex items-center justify-center gap-2 rounded-lg font-medium transition-all',
                    canGoPrevious
                        ? 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 active:scale-95'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
            >
                <ChevronLeft className="w-5 h-5" />
                <span>Previous</span>
            </button>

            {isLastQuestion ? (
                <button
                    onClick={onSubmit}
                    className="flex-1 h-12 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all active:scale-95"
                >
                    <CheckCircle className="w-5 h-5" />
                    <span>Submit Quiz</span>
                </button>
            ) : (onCheck && isAnswered) ? (
                <button
                    onClick={onCheck}
                    className={cn(
                        'flex-1 h-12 flex items-center justify-center gap-2 rounded-lg font-medium transition-all',
                        'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95' // Kept same styling
                    )}
                >
                    <span>Check Answer</span>
                </button>
            ) : (
                <button
                    onClick={onNext}
                    disabled={!canGoNext}
                    className={cn(
                        'flex-1 h-12 flex items-center justify-center gap-2 rounded-lg font-medium transition-all',
                        canGoNext
                            ? 'bg-primary-600 hover:bg-primary-700 text-white active:scale-95'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    )}
                >
                    <span>{onCheck && !isAnswered ? 'Skip' : 'Next'}</span>
                    <ChevronRight className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
