import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/shared/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
          <div className="mb-4 rounded-full bg-red-100 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Something went wrong</h1>
          <p className="mb-6 max-w-md text-muted-foreground">
            We apologize for the inconvenience. The application has encountered an unexpected error.
          </p>
          <div className="mb-6 rounded-lg bg-muted p-4 text-left font-mono text-sm text-muted-foreground">
            {this.state.error?.message}
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
            <Button onClick={this.handleReload}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
