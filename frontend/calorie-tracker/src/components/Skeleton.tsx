import React from 'react';
import { cn } from '../utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

/** Base skeleton block — any shape via className */
export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => (
    <div
        className={cn('animate-pulse rounded-xl bg-slate-200 dark:bg-zinc-800', className)}
        {...props}
    />
);

/** Full-width text line skeleton */
export const SkeletonText: React.FC<{ className?: string; width?: string }> = ({
    className,
    width = 'w-full',
}) => <Skeleton className={cn('h-3.5 rounded-lg', width, className)} />;

/** Card-shaped skeleton wrapper */
export const SkeletonCard: React.FC<{ className?: string; children?: React.ReactNode }> = ({
    className,
    children,
}) => (
    <div
        className={cn(
            'bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-5',
            className,
        )}
    >
        {children}
    </div>
);
