"use client";

import { useState, useRef, useEffect } from "react";
import { KeyRound, LogOut, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { logout, getStoredUser, type AuthUser } from "@/lib/api";
import { clearOfflinePersistence } from "@/hooks/use-offline-persistence";
import { useUnreadCount } from "@/hooks/use-unread-count";

const EXPANDED_W = 256;
const COLLAPSED_W = 72;

const navItems = [
  { label: "Dashboard",     href: "/admin/dashboard",     img: "/myhome.png" },
  { label: "Applicants",    href: "/admin/applicants",    img: "/apply.png" },
  { label: "Approved",      href: "/admin/approved",      img: "/approved.png" },
  { label: "Flagged",       href: "/admin/flagged",       img: "/flagged.png" },
  { label: "Sponsors",      href: "/admin/sponsors",      img: "/sponsors.png" },
  { label: "Disbursement",  href: "/admin/disbursement",  img: "/disbursement.png" },
  { label: "Notifications", href: "/admin/notifications", img: "/notification.png" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { loading } = useAuth("admin");
  const unreadCount = useUnreadCount("admin");

  const [storedUser, setStoredUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    setStoredUser(getStoredUser());
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await clearOfflinePersistence();
    await logout();
    router.push("/login");
  };

  if (loading) return null;

  const displayName = storedUser
    ? `${storedUser.firstName ?? ""} ${storedUser.lastName ?? ""}`.trim() || "Administrator"
    : "Administrator";

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#FAF9F7" }}>

      {/* ── SIDEBAR ── */}
      <motion.aside
        animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex flex-col h-screen sticky top-0 left-0 overflow-hidden shrink-0 border-r border-[#E8E4DE] shadow-sm z-50"
        style={{ backgroundColor: "#FAF9F7" }}
      >
        {/* Logo area — h-16 matches header */}
        <div className="flex items-center h-16 px-4 shrink-0 justify-between">
          <button
            onClick={() => !expanded && setExpanded(true)}
            tabIndex={!expanded ? 0 : -1}
            className="focus:outline-none shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mthandizi.png" alt="Mthandizi" className="h-9 w-auto object-contain" />
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.button
                key="collapse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setExpanded(false)}
                title="Collapse sidebar"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 transition-colors shrink-0"
              >
                <ChevronLeft size={18} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col gap-1 px-3 pt-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isNotifications = item.label === "Notifications";
            return (
              <Link
                key={item.label}
                href={item.href}
                title={!expanded ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg transition-all duration-200 group relative",
                  expanded ? "px-3 py-3" : "px-0 py-3 justify-center",
                  isActive ? "bg-brand-blue/10" : "hover:bg-brand-blue/5"
                )}
              >
                {/* Icon wrapper — relative so badge can be positioned on it */}
                <div className="relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.img}
                    alt={item.label}
                    className={cn(
                      "w-6 h-6 object-contain transition-all duration-200",
                      isActive
                        ? "[filter:invert(27%)_sepia(98%)_saturate(1200%)_hue-rotate(210deg)_brightness(97%)_contrast(97%)]"
                        : "opacity-50 group-hover:opacity-100 group-hover:[filter:invert(27%)_sepia(98%)_saturate(1200%)_hue-rotate(210deg)_brightness(97%)_contrast(97%)]"
                    )}
                  />
                  {isNotifications && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className={cn(
                        "font-normal tracking-tight text-sm whitespace-nowrap overflow-hidden transition-colors duration-200",
                        isActive ? "text-brand-blue" : "text-slate-500 group-hover:text-brand-blue"
                      )}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>
      </motion.aside>

      {/* ── MAIN CONTENT ── */}
      <main className="relative flex-1 min-w-0">
        {/* Header */}
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
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center focus:outline-none group"
                title={displayName}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/profile.png"
                  alt="Profile"
                  className="h-6 w-6 object-contain transition-all duration-200 group-hover:[filter:invert(27%)_sepia(98%)_saturate(1200%)_hue-rotate(210deg)_brightness(97%)_contrast(97%)]"
                />
              </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-none shadow-xl border border-[#E8E4DE] overflow-hidden z-50 font-sans"
                style={{ backgroundColor: "#FAF9F7" }}
              >
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-normal text-brand-slate leading-none truncate">{displayName}</p>
                  <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider mt-1">Admin</p>
                </div>
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-normal text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <KeyRound size={15} className="text-brand-blue" />
                  Change Password
                </button>
                <div className="h-px bg-slate-100" />
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-normal text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            )}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
