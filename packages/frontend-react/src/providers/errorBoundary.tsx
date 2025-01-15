import { ReactNode } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

export const ErrorBoundaryProvider = (props: { children: ReactNode }) => (
    <ErrorBoundary FallbackComponent={ErrorHandler} {...props} />
);

const ErrorHandler = ({ error, resetErrorBoundary }: FallbackProps) => (
    <div className="flex items-center justify-center h-dvh w-dvw">
        <div className="flex flex-col items-center gap-3">
            <p className="text-2xl font-bold">{error.name}</p>
            <p className="text-lg">{error.message}</p>
            <button className="app-button" onClick={resetErrorBoundary}>
                Try again
            </button>
        </div>
    </div>
);
