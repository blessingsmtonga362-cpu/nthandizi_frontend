"use client";

import { useEffect } from "react";

export function ErrorHandler() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      // Prevent the default browser behavior (logging to console)
      event.preventDefault();
    };

    const handleUnhandledError = (event: ErrorEvent) => {
      console.error("Unhandled error:", event.error);
      // Prevent the default browser behavior
      event.preventDefault();
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleUnhandledError);

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleUnhandledError);
    };
  }, []);

  return null;
}