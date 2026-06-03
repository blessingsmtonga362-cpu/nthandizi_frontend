"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ApplicantDetailsPanel } from "@/components/admin/applicant-details-panel";
import {
  getAdminApplicantDetails,
  type AdminApplicantDetailsResponse,
  type AdminApplicantListItem,
  type AdminApplicantsByStatusResponse,
} from "@/lib/api";

type Props = {
  title: string;
  description: string;
  emptyMessage: string;
  loadApplicants: () => Promise<AdminApplicantsByStatusResponse>;
};

export default function ApplicantStatusPage({
  title,
  description,
  emptyMessage,
  loadApplicants,
}: Props) {
  const [data, setData] = useState<AdminApplicantsByStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [details, setDetails] = useState<AdminApplicantDetailsResponse | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const response = await loadApplicants();
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load applicants.");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [loadApplicants]);

  const openApplicant = async (userId: string) => {
    setSelectedApplicantId(userId);
    setDetailsLoading(true);
    setDetailsError("");

    try {
      const response = await getAdminApplicantDetails(userId);
      setDetails(response);
    } catch (err) {
      setDetails(null);
      setDetailsError(err instanceof Error ? err.message : "Failed to load applicant details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeApplicant = () => {
    setSelectedApplicantId(null);
    setDetails(null);
    setDetailsError("");
  };

  const applicants = data?.applicants ?? [];

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-display font-bold text-brand-slate tracking-tight">{title}</h1>
          <p className="text-slate-500 text-sm font-normal">{description}</p>
        </div>

        <div className="border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500">
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Reg. Number</th>
                <th className="px-6 py-4">Programme</th>
                <th className="px-6 py-4">Comment</th>
                <th className="px-6 py-4 text-center">Need index</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-6 py-5">
                      <div className="h-4 w-full animate-pulse bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-red-600">
                    {error}
                  </td>
                </tr>
              ) : applicants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                applicants.map((applicant: AdminApplicantListItem, i: number) => (
                  <tr
                    key={applicant.userId}
                    onClick={() => void openApplicant(applicant.userId)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm font-normal text-slate-600">{applicant.rank ?? i + 1}</td>
                    <td className="px-6 py-4 text-sm font-normal text-slate-600">
                      {applicant.firstName} {applicant.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm font-normal text-slate-600">
                      {applicant.registrationNumber || applicant.email}
                    </td>
                    <td className="px-6 py-4 text-sm font-normal text-slate-600">
                      {applicant.program}
                    </td>
                    <td className="px-6 py-4 text-sm font-normal text-slate-500">
                      {applicant.reviewComments?.trim() || "—"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {applicant.score != null ? (
                        <div
                          className={cn(
                            "inline-flex items-center justify-center w-12 h-8 border text-[11px] font-bold",
                            applicant.score > 80
                              ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                              : applicant.score > 60
                                ? "border-amber-200 bg-amber-50 text-amber-600"
                                : "border-red-200 bg-red-50 text-red-600",
                          )}
                        >
                          {applicant.score}
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center w-12 h-8 border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-400">
                          —
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "inline-flex border px-2.5 py-1 text-xs font-medium",
                        applicant.status === "approved"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : applicant.status === "flagged"
                            ? "border-red-200 bg-red-50 text-red-700"
                            : "border-slate-200 bg-slate-100 text-slate-700"
                      )}>
                        {applicant.status === "approved" ? "Approved" : applicant.status === "flagged" ? "Flagged" : "Pending"}
                      </span>
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
              className="fixed inset-x-0 top-0 bottom-0 z-30 bg-slate-950/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-[65px] bottom-0 z-40 flex flex-col w-full max-w-2xl border-l border-slate-200 bg-white shadow-[-8px_0_48px_-8px_rgba(15,23,42,0.22)]"
            >
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
    </>
  );
}
