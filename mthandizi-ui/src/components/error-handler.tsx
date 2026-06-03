"use client";

import { useEffect } from "react";

export function ErrorHandler() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const rawReason = event.reason;
      
      // Check if reason is undefined or null
      if (rawReason === undefined || rawReason === null) {
        // Silently prevent default behavior for undefined rejections
        event.preventDefault();
        return;
      }

      let normalizedReason: string;
      try {
        if (rawReason instanceof Error) {
          normalizedReason = rawReason.stack || rawReason.message || String(rawReason);
        } else if (typeof rawReason === "object") {
          normalizedReason = JSON.stringify(rawReason, null, 2) ?? String(rawReason);
        } else if (typeof rawReason === "symbol") {
          normalizedReason = rawReason.toString();
        } else {
          normalizedReason = String(rawReason);
        }
      } catch {
        normalizedReason = "Failed to normalize rejection reason";
      }

      // Only log if we have meaningful content
      if (normalizedReason && normalizedReason !== "undefined") {
        console.error("Unhandled promise rejection:", normalizedReason);
      }
      
      // Prevent the default browser behavior
      event.preventDefault();
    };

    const handleUnhandledError = (event: ErrorEvent) => {
      console.error("Unhandled error:", event.error ?? "Unknown error");
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