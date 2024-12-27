import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

const ErrorFallback = ({ error }: FallbackProps) => {
  return (
    <div role="alert">
      <h2>Something went wrong</h2>
      <pre>{error.message}</pre>
    </div>
  );
};

const AppErrorBoundary = ({ children }: ErrorBoundaryProps) => {
  return (
    <ErrorBoundary fallbackRender={ErrorFallback}>{children}</ErrorBoundary>
  );
};

export default AppErrorBoundary;
