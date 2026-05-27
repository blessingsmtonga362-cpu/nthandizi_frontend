"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ApplicantDetailsPanel } from "@/components/admin/applicant-details-panel";
import {
  getAdminApplicantDetails,
  getAdminDashboardStats,
  getAllAdminApplicants,
  reviewAdminApplicant,
  type AdminApplicantDetailsResponse,
  type AdminApplicantStatus,
  type PriorityStudent,
} from "@/lib/api";
import { toastSuccess, toastError } from "@/lib/toast";

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "Not provided";
  if (typeof value === "string" && value.trim() === "") return "Not provided";
  return String(value);
}

function statusBadgeClass(status: AdminApplicantStatus) {
  switch (status) {
    case "approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "flagged":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function formatApplicantStatus(status: AdminApplicantStatus) {
  switch (status) {
    case "approved":
      return "Approved";
    case "flagged":
      return "Flagged";
    default:
      return "Pending Review";
  }
}

const selectClass =
  "h-11 border border-slate-200 bg-transparent px-4 text-sm font-medium text-slate-600 outline-none transition-colors hover:border-brand-blue focus:border-brand-blue cursor-pointer";

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<PriorityStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [rankFilter, setRankFilter] = useState("all");
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [details, setDetails] = useState<AdminApplicantDetailsResponse | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [reviewStatus, setReviewStatus] = useState<Extract<AdminApplicantStatus, "approved" | "flagged">>("approved");
  const [reviewComments, setReviewComments] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const response = await getAllAdminApplicants();
        setApplicants(response.applicants);
        setError("");
      } catch {
        try {
          const stats = await getAdminDashboardStats();
          setApplicants(stats.priorityQueue);
          setError("");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load applicants.");
        }
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, []);

  const programs = useMemo(() => {
    const unique = new Set(
      applicants.map((a) => a.program).filter((p) => p && p.trim() !== ""),
    );
    return Array.from(unique).sort();
  }, [applicants]);

  const rankedApplicants = useMemo(
    () =>
      [...applicants]
        .sort((a, b) => b.score - a.score)
        .map((row, index) => ({
          ...row,
          rank: index + 1,
        })),
    [applicants],
  );

  const filteredApplicants = useMemo(() => {
    return rankedApplicants.filter((row) => {
      const matchesProgram =
        programFilter === "all" || row.program.toLowerCase() === programFilter.toLowerCase();
      const matchesRank = rankFilter === "all" || String(row.rank) === rankFilter;
      return matchesProgram && matchesRank;
    });
  }, [rankedApplicants, programFilter, rankFilter]);

  const openApplicant = async (userId: string) => {
    setSelectedApplicantId(userId);
    setDetailsLoading(true);
    setDetailsError("");

    try {
      const response = await getAdminApplicantDetails(userId);
      setDetails(response);
      setReviewStatus(response.applicant.status === "flagged" ? "flagged" : "approved");
      setReviewComments(response.applicant.reviewComments ?? "");
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
    setReviewComments("");
    setReviewStatus("approved");
  };

  const handleReviewSubmit = async () => {
    if (!selectedApplicantId) return;

    if (reviewStatus === "flagged" && reviewComments.trim().length === 0) {
      toastError({
        title: "Missing Comment",
        description: "Please provide a comment when flagging an applicant.",
      });
      return;
    }

    setReviewSubmitting(true);

    try {
      const response = await reviewAdminApplicant(selectedApplicantId, {
        status: reviewStatus,
        reviewComments: reviewComments.trim() || undefined,
      });

      setDetails((current) =>
        current
          ? {
              ...current,
              applicant: {
                ...current.applicant,
                status: response.applicant.status,
                reviewComments: response.applicant.reviewComments,
              },
            }
          : current,
      );

      // Show success toast
      const statusText = reviewStatus === "approved" ? "Approved" : "Flagged";
      const studentName = details?.applicant.firstName || "Applicant";
      toastSuccess({
        title: `${studentName} ${statusText}`,
        description:
          reviewStatus === "approved"
            ? "Student has been approved successfully."
            : "Student has been flagged for review.",
      });

      // Close panel after brief delay to show the toast
      setTimeout(() => {
        closeApplicant();
      }, 500);
    } catch (err) {
      toastError({
        title: "Save Failed",
        description: err instanceof Error ? err.message : "Failed to save review. Please try again.",
      });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const personal = details?.application.personalDetails;
  const academics = details?.application.academicDetails;

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-display font-bold text-brand-slate tracking-tight">All Applicants</h1>
          <p className="text-slate-500 text-sm font-normal">
            Browse every submitted application, filter by programme or rank, and open full applicant details.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-2">
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className={selectClass}
            aria-label="Filter by programme"
          >
            <option value="all">All programmes</option>
            {programs.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>

          <select
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value)}
            className={selectClass}
            aria-label="Filter by rank"
          >
            <option value="all">All ranks</option>
            {rankedApplicants.map((row) => (
              <option key={row.id} value={String(row.rank)}>
                Rank {row.rank}
              </option>
            ))}
          </select>
        </div>

        <div className="border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500">
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Reg. Number</th>
                <th className="px-6 py-4">Programme</th>
                <th className="px-6 py-4 text-center">Need index</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
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
              ) : filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">
                    No applicants match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-normal text-slate-600">{row.rank}</td>
                    <td className="px-6 py-4 text-sm font-normal text-slate-600">{row.name}</td>
                    <td className="px-6 py-4 text-sm font-normal text-slate-600">{row.registrationNumber || row.id}</td>
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
                    <td className="px-6 py-4 text-center">
                      <span className={cn("inline-flex border px-2.5 py-1 text-xs font-medium", statusBadgeClass(row.status))}>
                        {formatApplicantStatus(row.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => void openApplicant(row.id)}
                        className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-brand-blue hover:text-brand-blue"
                      >
                        View more
                        <ArrowUpRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side panel — overlay stays within the main content area, matching the applicants orientation */}
      <AnimatePresence initial={false}>
        {selectedApplicantId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeApplicant}
              className="absolute inset-x-0 top-16 bottom-0 z-40 bg-slate-950/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-16 bottom-0 z-50 flex flex-col w-full max-w-2xl border-l border-slate-200 bg-white shadow-[-8px_0_48px_-8px_rgba(15,23,42,0.22)]"
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
              >
                {details && (
                  <section className="border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 px-5 py-4">
                      <h3 className="text-sm font-display font-bold text-brand-blue">Review Decision</h3>
                    </div>
                    <div className="p-5 space-y-5">
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setReviewStatus("approved")}
                          className={cn(
                            "border px-5 py-3 text-sm font-normal transition-all duration-150 hover:scale-[1.04]",
                            reviewStatus === "approved"
                              ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                              : "border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700",
                          )}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewStatus("flagged")}
                          className={cn(
                            "border px-5 py-3 text-sm font-normal transition-all duration-150 hover:scale-[1.04]",
                            reviewStatus === "flagged"
                              ? "border-red-300 bg-red-100 text-red-700"
                              : "border-slate-200 bg-white text-slate-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600",
                          )}
                        >
                          Flag
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-normal text-slate-500">
                          Reviewer Comment {reviewStatus === "flagged" ? "(Required)" : "(Optional)"}
                        </label>
                        <textarea
                          value={reviewComments}
                          onChange={(e) => setReviewComments(e.target.value)}
                          rows={4}
                          className="w-full border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-slate-600 outline-none transition-colors focus:border-brand-blue"
                          placeholder="Record the decision context for this application."
                        />
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => void handleReviewSubmit()}
                          disabled={reviewSubmitting}
                          className="inline-flex items-center gap-2 bg-brand-blue px-5 py-3 text-xs font-normal text-white transition-all hover:bg-brand-blueDark hover:scale-[1.03] disabled:opacity-60"
                        >
                          {reviewSubmitting && <Loader2 size={14} className="animate-spin" />}
                          Save Review
                        </button>
                      </div>
                    </div>
                  </section>
                )}
              </ApplicantDetailsPanel>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
