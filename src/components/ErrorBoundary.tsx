import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-[var(--text)]">
          <div className="f1-card-accent bg-[var(--surface-1)] border border-[var(--border)] rounded-xl p-6 max-w-md w-full shadow-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <h1 className="font-display font-black text-2xl uppercase tracking-tight mb-2">Application Error</h1>
            <p className="text-[var(--text-muted)] mb-6 text-sm">
              An unexpected error occurred while rendering the application.
            </p>
            {this.state.error && (
              <pre className="w-full text-left bg-[var(--surface-2)] p-3 rounded-md text-xs font-mono text-[var(--text-muted)] overflow-auto mb-6">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 bg-[var(--accent)] text-white font-semibold rounded hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-1)]"
            >
              Reload Application
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
