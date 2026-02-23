import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface GoalProgressBarProps {
    current: number;
    target: number;
    label: string;
    unit: string;
    className?: string;
}

export const GoalProgressBar: React.FC<GoalProgressBarProps> = ({
    current,
    target,
    label,
    unit,
    className
}) => {
    const percentage = Math.min(Math.round((current / target) * 100), 100);
    const isOver = current > target;

    // SVG Circle properties
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className={cn("relative flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900", className)}>
            <div className="relative w-48 h-48">
                {/* Background Circle */}
                <svg className="w-full h-full -rotate-90">
                    <circle
                        cx="96"
                        cy="96"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="12"
                        className="text-slate-100 dark:text-zinc-800"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="96"
                        cy="96"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className={cn(
                            "transition-all duration-1000 ease-out",
                            isOver ? "text-red-500" : "text-vitality-500"
                        )}
                    />
                </svg>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-black text-slate-900 dark:text-white leading-none">
                        {current.toLocaleString()}
                    </span>
                    <span className="text-slate-400 dark:text-zinc-500 text-sm font-semibold mt-1 uppercase tracking-wider">
                        / {target.toLocaleString()} {unit}
                    </span>
                </div>
            </div>

            <div className="mt-6 text-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{label}</h3>
                <p className={cn(
                    "text-sm font-medium mt-1",
                    isOver ? "text-red-600 dark:text-red-400" : "text-slate-500 dark:text-zinc-400"
                )}>
                    {isOver ? `${(current - target).toLocaleString()} ${unit} over target` : `${percentage}% of your goal`}
                </p>
            </div>
        </div>
    );
};
