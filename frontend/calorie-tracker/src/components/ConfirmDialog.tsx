import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { cn } from '../utils/cn';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning';
    isLoading?: boolean;
    onConfirm: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    onOpenChange,
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    variant = 'danger',
    isLoading = false,
    onConfirm,
}) => {
    const confirmColors = {
        danger: 'bg-red-500 hover:bg-red-600 shadow-red-500/25',
        warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25',
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                {/* Overlay */}
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

                {/* Content */}
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%]">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-xl shadow-black/10 p-6">
                        {/* Close button */}
                        <Dialog.Close className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                            <X className="w-4 h-4" />
                        </Dialog.Close>

                        {/* Icon */}
                        <div className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center mb-4",
                            variant === 'danger'
                                ? "bg-red-50 dark:bg-red-900/20"
                                : "bg-amber-50 dark:bg-amber-900/20"
                        )}>
                            <AlertTriangle className={cn(
                                "w-5 h-5",
                                variant === 'danger' ? "text-red-500" : "text-amber-500"
                            )} />
                        </div>

                        {/* Text */}
                        <Dialog.Title className="text-base font-bold text-slate-900 dark:text-white mb-1">
                            {title}
                        </Dialog.Title>
                        <Dialog.Description className="text-sm text-slate-500 dark:text-zinc-400 mb-6 leading-relaxed">
                            {description}
                        </Dialog.Description>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2">
                            <Dialog.Close
                                disabled={isLoading}
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {cancelLabel}
                            </Dialog.Close>
                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100",
                                    confirmColors[variant]
                                )}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : null}
                                {isLoading ? 'Deleting...' : confirmLabel}
                            </button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
