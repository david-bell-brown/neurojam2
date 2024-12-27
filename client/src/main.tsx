import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.tsx";
import AppErrorBoundary from "./components/error-boundary/index.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <Suspense fallback="loading">
        <App />
      </Suspense>
    </AppErrorBoundary>
  </StrictMode>
);
