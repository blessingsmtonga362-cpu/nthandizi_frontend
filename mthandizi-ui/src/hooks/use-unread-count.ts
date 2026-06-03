"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getStudentUnreadCount, getAdminNotifications } from "@/lib/api";

type Portal = "student" | "admin";

/**
 * Polls the unread-count endpoint every POLL_INTERVAL_MS so the badge
 * updates in real-time (e.g. immediately after a successful submission
 * triggers a notification on the backend).
 *
 * Also re-fetches on window focus for instant updates when the user
 * comes back from the notifications page.
 *
 * The admin portal doesn't have a dedicated unread-count endpoint, so it
 * still uses the full notifications list and counts client-side.
 */
const POLL_INTERVAL_MS = 20_000; // 20 seconds

export function useUnreadCount(portal: Portal) {
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCount = useCallback(async () => {
    try {
      if (portal === "student") {
        // Use the lightweight dedicated endpoint — just a COUNT query
        const count = await getStudentUnreadCount();
        setUnreadCount(count);
      } else {
        // Admin: no dedicated endpoint yet, count from full list
        const notifications = await getAdminNotifications();
        setUnreadCount(notifications.filter((n) => !n.isRead).length);
      }
    } catch {
      // Non-fatal — badge simply stays at last known value if fetch fails
    }
  }, [portal]);

  // Initial fetch
  useEffect(() => {
    void fetchCount();
  }, [fetchCount]);

  // Polling — keeps the badge live without a WebSocket
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      void fetchCount();
    }, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchCount]);

  // Re-fetch immediately when the tab regains focus so the badge
  // reflects changes made on the notifications page
  useEffect(() => {
    const onFocus = () => {
      void fetchCount();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchCount]);

  /**
   * Call this after a local action (mark read, delete) so the badge
   * updates instantly without waiting for the next poll cycle.
   * Pass a positive delta to increment (+1) or negative to decrement (-1).
   */
  const adjustCount = useCallback((delta: number) => {
    setUnreadCount((prev) => Math.max(0, prev + delta));
  }, []);

  return { unreadCount, adjustCount, refresh: fetchCount };
}
