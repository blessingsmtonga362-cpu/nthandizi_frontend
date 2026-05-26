"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, KeyRound } from "lucide-react";
import { StudentNav } from "@/components/student/nav";
import { useAuth } from "@/hooks/use-auth";
import { logout, getStoredUser, type AuthUser } from "@/lib/api";
import { clearOfflinePersistence } from "@/hooks/use-offline-persistence";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { loading } = useAuth("student");

  const [storedUser, setStoredUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    setStoredUser(getStoredUser());
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSignOut = async () => {
    setOpen(false);
    await clearOfflinePersistence();
    await logout();
    router.push("/login");
  };

  const handleChangePassword = () => {
    setOpen(false);
  };

  if (loading) return null;

  const displayName = storedUser?.firstName
    ? `${storedUser.firstName} ${storedUser.lastName ?? ""}`.trim()
    : (storedUser?.email ?? "");

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#FAF9F7" }}>
      <StudentNav />
      <main className="flex-1 pb-24 lg:pb-0">
        <header
          className="sticky top-0 z-40 h-16 shrink-0 border-b border-[#E8E4DE] px-4 sm:px-6"
          style={{ backgroundColor: "#FAF9F7" }}
        >
          <div className="flex h-full w-full items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="hidden lg:flex items-center gap-3 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/UnimaLogo.png" alt="UNIMA" className="h-9 w-auto shrink-0 object-contain" />
                <div className="h-6 w-px shrink-0 bg-slate-200" />
                <span className="font-display font-normal text-slate-500 text-sm tracking-tight truncate">
                  University of Malawi
                </span>
              </div>
              <div className="flex lg:hidden items-center min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mthandizi.png" alt="Mthandizi" className="h-8 w-auto shrink-0 object-contain" />
              </div>
            </div>

            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center focus:outline-none group"
                title={displayName || undefined}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/profile.png"
                  alt="Profile"
                  className="h-6 w-6 object-contain transition-all duration-200 group-hover:[filter:invert(27%)_sepia(98%)_saturate(1200%)_hue-rotate(210deg)_brightness(97%)_contrast(97%)]"
                />
              </button>

              {open && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-none shadow-xl shadow-stone-200/60 border border-[#E8E4DE] overflow-hidden z-50 font-sans"
                  style={{ backgroundColor: "#FAF9F7" }}
                >
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-normal text-brand-slate leading-none truncate">{displayName || "Student"}</p>
                    {storedUser?.registrationNumber && (
                      <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider mt-1">
                        {storedUser.registrationNumber}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleChangePassword}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-normal text-brand-slate hover:bg-slate-50 transition-colors"
                  >
                    <KeyRound size={16} className="text-brand-blue" />
                    Change Password
                  </button>
                  <div className="h-px bg-slate-100" />
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-normal text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-6 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
