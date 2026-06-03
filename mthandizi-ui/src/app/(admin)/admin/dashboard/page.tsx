"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Users,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ApplicantDetailsPanel } from "@/components/admin/applicant-details-panel";
import {
  getAdminApplicantDetails,
  getAdminDashboardStats,
  type AdminApplicantDetailsResponse,
  type DashboardStats,
} from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [details, setDetails] = useState<AdminApplicantDetailsResponse | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const loadStats = async () => {
    try {
      const response = await getAdminDashboardStats();
      setStats(response);
    } catch {
      setStats({ totalApplications: 0, approvedSupport: 0, flaggedFiles: 0, priorityQueue: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStats();
  }, []);

  const openApplicant = async (userId: string) => {
    setSelectedApplicantId(userId);
    setDetailsLoading(true);
    setDetailsError("");

    try {
      const response = await getAdminApplicantDetails(userId);
      setDetails(response);
    } catch (error) {
      setDetails(null);
      setDetailsError(error instanceof Error ? error.message : "Failed to load applicant details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeApplicant = () => {
    setSelectedApplicantId(null);
    setDetails(null);
    setDetailsError("");
  };

  const tiles = [
    { label: "Total applications", value: stats?.totalApplications ?? "—", icon: Users, color: "text-blue-600" },
    { label: "Approved applicants", value: stats?.approvedSupport ?? "—", icon: CheckCircle, color: "text-emerald-600", href: "/admin/approved" },
    { label: "Flagged applicants", value: stats?.flaggedFiles ?? "—", icon: AlertCircle, color: "text-red-600", href: "/admin/flagged" },
  ];

  return (
    <>
      <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-slate tracking-tight">Applicant Review Dashboard</h1>
          <p className="text-slate-400 text-sm font-normal mt-1">
            Review submitted student applications, inspect supporting details, and record decisions with comments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tiles.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => {
              if (stat.href) router.push(stat.href);
            }}
            className={cn(
              "group bg-white p-6 border border-slate-200 relative overflow-hidden hover:border-brand-blue hover:shadow-[0_16px_48px_-8px_rgba(15,23,42,0.22)] hover:scale-[1.02] transition-all duration-200",
              stat.href ? "cursor-pointer" : "cursor-default",
            )}
          >
            <div className="origin-top-left transition-transform duration-200 ease-out group-hover:scale-[1.06]">
              <div className="mb-5">
                <stat.icon
                  size={24}
                  className={cn(stat.color, "transition-transform duration-200 group-hover:scale-110")}
                />
              </div>
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <h3 className="text-3xl font-display font-bold text-brand-slate mt-1">
                {loading ? <span className="inline-block w-14 h-7 bg-slate-100 animate-pulse" /> : stat.value.toLocaleString()}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-brand-slate text-sm">Priority review queue</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500">
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Programme</th>
                <th className="px-6 py-4 text-center">Need index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="px-6 py-5">
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-full" />
                    </td>
                  </tr>
                ))
              ) : stats?.priorityQueue.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm font-normal">
                    No applications in the queue yet.
                  </td>
                </tr>
              ) : (
                (stats?.priorityQueue ?? []).map((row, i) => (
                  <tr
                    key={row.id}
                    onClick={() => void openApplicant(row.id)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm font-normal text-slate-600">{row.rank ?? i + 1}</td>
                    <td className="px-6 py-4 text-sm font-normal text-slate-600">{row.name}</td>
                    <td className="px-6 py-4 text-sm font-normal text-slate-600">{row.program}</td>
                    <td className="px-6 py-4 text-center">
                      <div
                        className={cn(
                          "inline-flex items-center justify-center w-12 h-8 border text-[11px] font-bold",
                          row.score > 80
                            ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                            : row.score > 60
                              ? "border-amber-200 bg-amber-50 text-amber-600"
                              : "border-red-200 bg-red-50 text-red-600",
                        )}
                      >
                        {row.score}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {selectedApplicantId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeApplicant}
              className="fixed inset-x-0 top-0 bottom-0 z-20 bg-slate-950/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-30 flex flex-col w-full max-w-2xl border-l border-slate-200 bg-white pt-16 shadow-[-8px_0_48px_-8px_rgba(15,23,42,0.22)]"
            >
              {/* Panel header */}
              <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-blue">Applicant Details</p>
                  <h2 className="mt-1 text-xl font-display font-bold text-brand-slate">
                    {details?.applicant.firstName} {details?.applicant.lastName}
                  </h2>
                  <p className="mt-1 text-sm font-normal text-slate-500">{details?.applicant.email ?? selectedApplicantId}</p>
                </div>
                <button
                  type="button"
                  onClick={closeApplicant}
                  className="border border-slate-200 bg-white p-2 text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto">
                <ApplicantDetailsPanel
                  selectedApplicantId={selectedApplicantId}
                  details={details}
                  loading={detailsLoading}
                  error={detailsError}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
