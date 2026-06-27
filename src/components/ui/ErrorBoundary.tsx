/* App-level error boundary — isolates render crashes from taking down the shell. */
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  fallback: ReactNode
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Hook point for an error-reporting service (Sentry, etc.).
    console.error('Unhandled render error:', error, info.componentStack)
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
