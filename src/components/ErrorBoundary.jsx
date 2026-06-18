import { Component } from 'react';

/**
 * Top-level error boundary.
 * Catches render errors anywhere in the tree and shows a readable
 * message instead of a blank page.  Without this, React (in production)
 * silently unmounts the root and the user sees nothing.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Surface the error in the console for easier debugging.
    console.error('[AgriTrace] Render error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    const msg = this.state.error?.message || String(this.state.error);

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 text-sm mb-4">
            The application encountered an unexpected error.
          </p>
          <pre className="text-left text-xs bg-gray-100 text-red-700 rounded-lg p-3 mb-6 overflow-auto max-h-40 whitespace-pre-wrap break-words">
            {msg}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-primary hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
