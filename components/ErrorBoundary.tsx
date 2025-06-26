import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate unique error ID for tracking
    const errorId = `luna-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error details for debugging
    console.error('Luna Error Boundary caught an error:', error, errorInfo);
    
    // In production, send error to monitoring service
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    const errorReport = {
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: 'anonymous', // Luna uses anonymous users
      appVersion: process.env.VITE_APP_VERSION || '1.0.0'
    };

    // Store locally for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('luna-errors') || '[]');
      existingErrors.push(errorReport);
      
      // Keep only last 10 errors
      if (existingErrors.length > 10) {
        existingErrors.shift();
      }
      
      localStorage.setItem('luna-errors', JSON.stringify(existingErrors));
    } catch (storageError) {
      console.warn('Failed to store error report locally:', storageError);
    }

    // In production, you might send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      // fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorReport) });
      console.error('[PRODUCTION ERROR]', errorReport);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: ''
    });
  };

  private handleReportError = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      timestamp: new Date().toISOString()
    };

    const mailtoLink = `mailto:support@luna-ai.app?subject=Luna Error Report ${this.state.errorId}&body=${encodeURIComponent(
      `Error ID: ${this.state.errorId}\n` +
      `Timestamp: ${errorDetails.timestamp}\n` +
      `Message: ${this.state.error?.message}\n` +
      `URL: ${window.location.href}\n\n` +
      `Please describe what you were doing when this error occurred:\n\n`
    )}`;

    window.open(mailtoLink);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-8" 
             style={{ 
               background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
               color: '#f3f4f6'
             }}>
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">🌙</div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: '#38bdf8' }}>
                Oops! Something went wrong
              </h1>
              <p className="text-gray-300 mb-4">
                Luna encountered an unexpected error. Don't worry, your data is safe.
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Error ID: <code className="bg-gray-800 px-2 py-1 rounded">{this.state.errorId}</code>
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full py-3 px-4 rounded-lg font-medium transition-colors"
                style={{ 
                  backgroundColor: '#38bdf8',
                  color: '#ffffff'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#38bdf8'}
              >
                Try Again
              </button>

              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-lg font-medium transition-colors"
                style={{ 
                  backgroundColor: '#334155',
                  color: '#e5e7eb',
                  border: '1px solid #475569'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#475569'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#334155'}
              >
                Reload Page
              </button>

              <button
                onClick={this.handleReportError}
                className="w-full py-2 px-4 text-sm transition-colors"
                style={{ color: '#94a3b8' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#cbd5e1'}
                onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
              >
                Report this error
              </button>
            </div>

            <div className="mt-8 text-xs text-gray-500">
              <p>If this problem persists, try:</p>
              <ul className="mt-2 space-y-1">
                <li>• Clearing your browser cache</li>
                <li>• Checking your internet connection</li>
                <li>• Using a different browser</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
