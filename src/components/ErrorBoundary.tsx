import { Component, type ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: { componentStack: string }) {
        // Log the error for debugging. In production, integrate an error
        // reporting service (e.g. Sentry) here: reportError(error, info)
        console.error("ErrorBoundary caught an error:", error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="min-vh-100 d-flex align-items-center justify-content-center p-4" style={{ backgroundColor: "#f2f4e6" }}>
                    <div className="text-center" style={{ maxWidth: 480 }}>
                        <i className="fa-solid fa-triangle-exclamation fa-3x text-warning mb-4"></i>
                        <h2 className="fw-black text-dark mb-2" style={{ fontFamily: "'Fredoka One', cursive" }}>
                            Something went wrong
                        </h2>
                        <p className="text-muted fw-bold mb-4">
                            An unexpected error occurred. Try refreshing the page or return home.
                        </p>
                        <div className="d-flex gap-3 justify-content-center">
                            <button
                                className="btn btn-success rounded-pill fw-bold px-4"
                                onClick={() => window.location.reload()}
                            >
                                <i className="fa-solid fa-rotate-right me-2"></i> Refresh
                            </button>
                            <a href="/" className="btn btn-outline-secondary rounded-pill fw-bold px-4">
                                <i className="fa-solid fa-house me-2"></i> Home
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
