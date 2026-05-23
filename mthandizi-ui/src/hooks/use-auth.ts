import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, type AuthUser } from "@/lib/api";

/**
 * DEV MODE: AUTH GUARD IS DISABLED.
 * Set this to `false` to re-enable redirects and role enforcement.
 * ─────────────────────────────────────────────────────────────────
 * When true:  any URL is accessible without a session.
 * When false: unauthenticated users are sent to /login,
 *             wrong-role users are sent to their correct portal.
 */
const DEV_BYPASS_AUTH = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true";

export function useAuth(requiredRole?: "student" | "admin") {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ── DEV BYPASS ──────────────────────────────────────────────
    if (DEV_BYPASS_AUTH) {
      setLoading(false);
      return;
    }
    // ────────────────────────────────────────────────────────────

    const stored = getStoredUser();

    if (!stored) {
      router.replace("/login");
      return;
    }

    if (requiredRole && stored.role !== requiredRole) {
      // Wrong role — send them to their correct portal
      if (stored.role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/dashboard");
      }
      return;
    }

    setUser(stored);
    setLoading(false);
  }, [router, requiredRole]);

  return { user, loading };
}
