import { cn } from '../lib/utils';
import { Bookmark, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { useState } from 'react';

export function QuestionCard({
    question,
    questionNumber,
    selectedOptions = [],
    onSelectOption,
    isPracticeMode,
    feedback, // { isCorrect, explanation, correctOptionIds }
    onBookmark,
    isBookmarked
}) {
    const isSingleChoice = question.question_type === 'single_choice';
    const hasFeedback = feedback !== undefined && feedback !== null;

    const handleOptionClick = (option) => {
        if (!hasFeedback) {
            onSelectOption(option);
        }
    };

    return (
        <div className="bg-white rounded-mobile shadow-mobile p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <span className="text-sm font-medium text-primary-600">
                        Question {questionNumber}
                    </span>
                    <h2 className="text-lg font-semibold text-gray-900 mt-2">
                        {question.question_text}
                    </h2>
                </div>
                <button
                    onClick={onBookmark}
                    className="p-2 -mr-2 text-gray-400 hover:text-primary-600 transition-colors"
                >
                    <Bookmark className={cn("w-5 h-5", isBookmarked && "fill-primary-600 text-primary-600")} />
                </button>
            </div>

            <div className="space-y-3">
                {question.options.map((option, index) => {
                    // Option is now a string "A"
                    // selectedOptions might be a string (single choice) or array. Handle both.
                    const isSelected = Array.isArray(selectedOptions)
                        ? selectedOptions.includes(option)
                        : selectedOptions === option;

                    let borderColor = 'border-gray-200';
                    let bgColor = 'bg-white';
                    let iconColor = 'border-gray-300';

                    if (hasFeedback) {
                        // feedback.correct_option is a string "A"
                        const isCorrectOption = feedback.correct_option === option;

                        if (isCorrectOption) {
                            borderColor = 'border-green-500';
                            bgColor = 'bg-green-50';
                            iconColor = 'border-green-600 bg-green-600';
                        } else if (isSelected && !feedback.isCorrect) {
                            borderColor = 'border-red-500';
                            bgColor = 'bg-red-50';
                            iconColor = 'border-red-600 bg-red-600';
                        } else if (isSelected) {
                            // Selected and correct
                            borderColor = 'border-green-500';
                            bgColor = 'bg-green-50';
                        }
                    } else if (isSelected) {
                        borderColor = 'border-primary-500';
                        bgColor = 'bg-primary-50';
                        iconColor = 'border-primary-600 bg-primary-600';
                    }

                    return (
                        <div
                            key={index} // safe to use index or option-hash since options are strings
                            onClick={() => handleOptionClick(option)}
                            className={cn(
                                'flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer',
                                borderColor,
                                bgColor,
                                !hasFeedback && 'active:scale-98 hover:border-primary-300'
                            )}
                        >
                            <div className={cn(
                                'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center',
                                isSingleChoice ? 'rounded-full' : 'rounded',
                                iconColor
                            )}>
                                {isSelected && (hasFeedback ? (
                                    feedback.isCorrect || feedback.correct_option === option ? (
                                        <CheckCircle className="w-3 h-3 text-white" />
                                    ) : (
                                        <XCircle className="w-3 h-3 text-white" />
                                    )
                                ) : (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                ))}
                            </div>

                            <span className={cn(
                                'flex-1 text-base',
                                isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'
                            )}>
                                {option}
                            </span>
                        </div>
                    );
                })}
            </div>


        </div>
    );
}
