import React from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    actionLabel?: string;
    onAction?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action, actionLabel, onAction }) => {
    return (
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {description && (
                    <p className="mt-2 text-sm text-gray-700">
                        {description}
                    </p>
                )}
            </div>
            {(action || (actionLabel && onAction)) && (
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    {actionLabel && onAction ? (
                        <button
                            type="button"
                            onClick={onAction}
                            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                            {actionLabel}
                        </button>
                    ) : action}
                </div>
            )}
        </div>
    );
};
