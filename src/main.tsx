import React, { StrictMode, Component, ErrorInfo, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#121212',
          color: '#fff',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif'
        }}>
          <div style={{
            maxWidth: '540px',
            width: '100%',
            backgroundColor: '#1c1c1c',
            padding: '2rem',
            borderRadius: '1.25rem',
            border: '1px solid #333',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f87171', marginBottom: '0.75rem' }}>
              Application Recovery
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#a3a3a3', marginBottom: '1rem' }}>
              An unexpected error occurred during rendering. You can reset local storage and reload the app below.
            </p>
            <pre style={{
              backgroundColor: '#0a0a0a',
              padding: '0.875rem',
              borderRadius: '0.75rem',
              overflow: 'auto',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: '#fca5a5',
              marginBottom: '1.25rem',
              maxHeight: '140px'
            }}>
              {this.state.error?.message || String(this.state.error)}
            </pre>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('filedrive_account')
                  } catch (e) {
                    console.error(e)
                  }
                  window.location.reload()
                }}
                style={{
                  flex: 1,
                  padding: '0.625rem 1rem',
                  backgroundColor: '#0061fe',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                Clear Session &amp; Reload
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.625rem 1rem',
                  backgroundColor: '#262626',
                  color: '#e5e5e5',
                  border: '1px solid #404040',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
}
