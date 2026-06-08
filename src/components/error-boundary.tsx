import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorScreen } from '@/components/error-screen'

// App-level safety net for render errors not caught by the router's errorElement
// (e.g. errors thrown above/around the route tree).
export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught render error:', error, info)
  }

  render() {
    if (this.state.hasError) return <ErrorScreen />
    return this.props.children
  }
}
