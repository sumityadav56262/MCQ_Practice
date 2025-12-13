import { cn } from '../lib/utils';

export function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn('animate-pulse rounded-md bg-gray-200', className)}
            {...props}
        />
    );
}

export function QuizCardSkeleton() {
    return (
        <div className="bg-white rounded-mobile shadow-mobile p-6">
            <div className="flex items-start justify-between mb-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-4/5 mb-4" />

            <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
            </div>
        </div>
    );
}

export function QuestionCardSkeleton() {
    return (
        <div className="bg-white rounded-mobile shadow-mobile p-6">
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-6 w-full mb-4" />

            <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
            </div>
        </div>
    );
}

export function SubjectCardSkeleton() {
    return (
        <div className="bg-white rounded-mobile shadow-mobile p-6">
            <Skeleton className="h-12 w-12 rounded-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    );
}
