"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Bell, 
  Clock, 
  Trash2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  getStudentNotifications,
  markAllNotificationsRead,
  clearAllNotifications,
  type Notification,
} from "@/lib/api";

const accentMap = {
  success: "border-l-emerald-500",
  info:    "border-l-blue-500",
  urgent:  "border-l-red-500",
  warning: "border-l-amber-500",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getStudentNotifications()
      .then(setNotifications)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load notifications"))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearAll = async () => {
    await clearAllNotifications().catch(() => {});
    setNotifications([]);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pb-20 pt-4"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-slate tracking-tight">Notifications</h1>
          <p className="text-slate-500 font-normal mt-1">Stay updated on your profiling progress and campus news.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleMarkAllRead}
            className="text-[10px] font-normal uppercase tracking-widest text-slate-400 hover:text-brand-blue"
          >
            <Check className="mr-2 w-4 h-4" /> Mark all as read
          </Button>
          <Button
            variant="ghost"
            onClick={handleClearAll}
            className="text-[10px] font-normal uppercase tracking-widest text-red-400 hover:text-red-500 hover:bg-red-50"
          >
            <Trash2 className="mr-2 w-4 h-4" /> Clear all
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin mx-auto" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="py-10 text-center text-red-500 text-sm font-bold">{error}</div>
      )}

      {/* Notifications List */}
      {!loading && !error && (
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((n, i) => {
              const accent = accentMap[n.type] ?? accentMap.info;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "group relative bg-white border border-l-4 p-6 md:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50",
                    accent,
                    !n.isRead ? "border-slate-200 shadow-sm" : "border-slate-100 opacity-80"
                  )}
                >
                  {/* Unread Indicator Dot */}
                  {!n.isRead && (
                    <div className="absolute top-6 right-6 w-2 h-2 bg-brand-blue rounded-full" />
                  )}

                  <div className="flex flex-col gap-2">
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                        <h3 className="font-display font-normal text-brand-slate text-lg leading-tight">
                          {n.title}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-normal uppercase tracking-widest">
                          <Clock size={12} />
                          {n.time}
                        </div>
                      </div>
                      <p className="text-slate-500 text-sm font-normal leading-relaxed max-w-2xl">
                        {n.message}
                      </p>

                      {/* Actions for urgent notifications */}
                      {n.type === "urgent" && (
                        <div className="mt-6 flex gap-3">
                          <Button className="bg-brand-blue hover:bg-brand-blueDark text-white h-10 px-6 text-[10px] font-normal uppercase tracking-widest rounded-none">
                            Fix Now
                          </Button>
                          <Button variant="ghost" className="h-10 px-6 text-[10px] font-normal uppercase tracking-widest text-slate-400 rounded-none">
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            /* Empty State */
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                <Bell size={40} />
              </div>
              <h3 className="text-xl font-display font-normal text-brand-slate tracking-tight">All caught up</h3>
              <p className="text-slate-400 text-sm font-normal mt-2">Check back later for new updates.</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
