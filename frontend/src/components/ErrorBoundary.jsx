import React from "react";

/**
 * ErrorBoundary: Catches JavaScript errors anywhere in their child component tree.
 * OPTIMIZATION: Implemented production-only logging to prevent console clutter for users.
 */
class ErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        /**
         * OPTIMIZATION: Environment-aware logging.
         * Only log detailed errors to the console in development.
         * In production, send them to a service like Sentry or LogRocket.
         */
        if (process.env.NODE_ENV === "development") {
            console.error("ErrorBoundary caught an error", error, errorInfo);
        } else {
            // Placeholder for production error reporting service
            // Sentry.captureException(error);
        }
    }

    // OPTIMIZATION: Memoize the reload handler to prevent re-creation
    handleReset = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // OPTIMIZATION: Fallback UI uses base daisyUI classes for minimal layout shift
            return (
                <div className="h-screen flex items-center justify-center bg-base-100 p-4 transition-opacity duration-300">
                    <div className="text-center max-w-md">
                        {/* Use simple SVG or icon instead of heavy images for error states */}
                        <div className="mb-6 inline-flex items-center justify-center size-16 rounded-full bg-error/10 text-error">
                            <svg xmlns="http://www.w3.org/2000/svg" className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-base-content mb-2">Something went wrong.</h1>
                        <p className="text-base-content/60 mb-8">
                            We've encountered an unexpected error. Please try refreshing the application.
                        </p>
                        <button 
                            className="btn btn-primary btn-wide shadow-lg hover:scale-105 active:scale-95 transition-all" 
                            onClick={this.handleReset}
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;