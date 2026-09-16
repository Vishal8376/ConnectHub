import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-surface">
          <div className="w-16 h-16 rounded-full bg-error-container text-on-error-container flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[36px]">error</span>
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-2">Something went wrong</h2>
          <p className="text-sm text-on-surface-variant max-w-md mb-6">
            {this.state.error?.message || 'An unexpected rendering error occurred. Please try refreshing the page.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-full bg-primary-container text-on-primary font-medium hover:bg-primary transition-colors shadow-sm"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
