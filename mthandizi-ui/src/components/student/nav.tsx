"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/lib/notification-context";

const navItems = [
  { name: "Home",          href: "/dashboard",      img: "/myhome.png" },
  { name: "Application",   href: "/apply",           img: "/apply.png" },
  { name: "Status",        href: "/status",          img: "/statuss.png" },
  { name: "Notifications", href: "/notifications",   img: "/notification.png" },
];

const EXPANDED_W = 256;
const COLLAPSED_W = 72;

export function StudentNav() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);
  const { unreadCount } = useNotifications();

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex flex-col h-screen sticky top-0 left-0 overflow-hidden shrink-0 border-r border-[#E8E4DE] shadow-sm"
        style={{ backgroundColor: "#FAF9F7" }}
      >
        {/* Logo area — matches main header height h-16 for visual alignment */}
        <div className="flex items-center h-16 px-4 shrink-0 justify-between">
          {/* Logo — always visible, clicking it expands when collapsed */}
          <button
            onClick={() => !expanded && setExpanded(true)}
            title={!expanded ? "Expand sidebar" : undefined}
            className={cn("focus:outline-none shrink-0", !expanded && "cursor-pointer")}
            tabIndex={!expanded ? 0 : -1}
          >
            <img
              src="/mthandizi.png"
              alt="Mthandizi"
              className="h-9 w-auto object-contain"
            />
          </button>

          {/* Collapse arrow — visible only when expanded, fades out as sidebar collapses */}
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.button
                key="collapse-btn"
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
            const isNotifications = item.name === "Notifications";
            return (
              <Link
                key={item.name}
                href={item.href}
                title={!expanded ? item.name : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg transition-all duration-200 group relative",
                  expanded ? "px-3 py-3" : "px-0 py-3 justify-center",
                  isActive ? "bg-brand-blue/10" : "hover:bg-brand-blue/5"
                )}
              >
                {/* Icon wrapper — relative so badge can be positioned on it */}
                <div className="relative shrink-0">
                  <img
                    src={item.img}
                    alt={item.name}
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
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>
      </motion.aside>

      {/* Mobile Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t border-[#E8E4DE] px-4 py-3 z-50 flex justify-around items-center" style={{ backgroundColor: "#FAF9F7" }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isNotifications = item.name === "Notifications";
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300 group",
                isActive ? "scale-110" : ""
              )}
            >
              <div className="relative">
                <img
                  src={item.img}
                  alt={item.name}
                  className={cn(
                    "w-5 h-5 object-contain transition-all duration-200",
                    isActive
                      ? "[filter:invert(27%)_sepia(98%)_saturate(1200%)_hue-rotate(210deg)_brightness(97%)_contrast(97%)]"
                      : "opacity-50 group-hover:opacity-100 group-hover:[filter:invert(27%)_sepia(98%)_saturate(1200%)_hue-rotate(210deg)_brightness(97%)_contrast(97%)]"
                  )}
                />
                {isNotifications && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center leading-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-normal tracking-tight transition-colors duration-200",
                  isActive ? "text-brand-blue" : "text-slate-500 group-hover:text-brand-blue"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
