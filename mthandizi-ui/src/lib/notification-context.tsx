"use client";


import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { getStudentUnreadCount } from "@/lib/api";

interface NotificationContextValue {
  unreadCount: number;
  /** Instantly adjust the badge by a delta (e.g. -1 on mark-read, -1 on delete). */
  adjustCount: (delta: number) => void;
  /** Re-fetch the true count from the server. */
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue>({
  unreadCount: 0,
  adjustCount: (_delta: number) => {},
  refresh: async () => {},
});

const POLL_INTERVAL_MS = 20_000;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const count = await getStudentUnreadCount();
      setUnreadCount(count);
    } catch {
      // non-fatal
    }
  }, []);

  const adjustCount = useCallback((delta: number) => {
    setUnreadCount((prev) => Math.max(0, prev + delta));
  }, []);

  // Initial fetch
  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Polling
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      void refresh();
    }, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  // Re-fetch on tab focus
  useEffect(() => {
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  return (
    <NotificationContext.Provider value={{ unreadCount, adjustCount, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
