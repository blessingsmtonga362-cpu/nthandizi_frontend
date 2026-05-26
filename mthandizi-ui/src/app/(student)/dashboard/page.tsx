"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getApplicationStatus, getStoredUser, type ApplicationStatus } from "@/lib/api";
import { useApplicationProgress } from "@/hooks/use-application-progress";
import type { SectionState } from "@/lib/application-progress";

const STEP_LABELS = ["Personal", "Family", "Education", "Review"] as const;

function sectionChipClass(state: SectionState) {
  switch (state) {
    case "complete":
      return "bg-emerald-50 border-emerald-200 text-emerald-700";
    case "partial":
      return "bg-amber-50 border-amber-200 text-amber-700";
    default:
      return "border-slate-200 text-slate-400";
  }
}

export default function StudentDashboard() {
  const [status, setStatus] = useState<ApplicationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [tileHovering, setTileHovering] = useState(false);
  const user = getStoredUser();
  const router = useRouter();
  const { progress, refreshDraft } = useApplicationProgress();

  const fetchStatus = useCallback(() => {
    setLoading(true);
    getApplicationStatus()
      .then(setStatus)
      .catch(() =>
        setStatus({ status: "draft", completedSteps: 0, totalSteps: STEP_LABELS.length, lastSaved: null, submittedAt: null })
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    const onFocus = () => {
      void fetchStatus();
      refreshDraft().catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchStatus, refreshDraft]);

  const firstName = user?.firstName ?? "Student";
  const progressPct = loading ? 0 : progress.percent;
  const isSubmitted = status?.status === "submitted" || status?.status === "reviewing" || status?.status === "approved";
  const hasStarted = progress.hasAnyInput || isSubmitted;
  const trackerSpan = hasStarted && !isSubmitted ? "lg:col-span-2" : "lg:col-span-1";

  const sectionStates = [
    progress.sections.personal,
    progress.sections.family,
    progress.sections.education,
    progress.sections.review,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      <header>
        <h1 className="text-3xl font-display font-bold text-brand-slate tracking-tight">
          Moni, <span className="text-brand-blue">{firstName}</span>
        </h1>
        <p className="text-slate-400 font-normal mt-1 text-sm">
          {isSubmitted ? "Your application has been submitted." : "Ready to complete your profiling process?"}
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6 items-start">

      <motion.div
          onClick={() => { if (!isSubmitted) router.push("/apply"); }}
          onHoverStart={() => setTileHovering(true)}
          onHoverEnd={() => setTileHovering(false)}
          initial={{ borderColor: "rgb(226 232 240)" }}
          whileHover={{
            scale: 1.015,
            boxShadow: "0 16px 48px -8px rgba(15,23,42,0.22)",
            borderColor: "rgb(59 130 246)",
          }}
          transition={{ duration: 0.2 }}
          className={cn(
            "border p-8 group bg-brand-blue/5",
            trackerSpan,
            isSubmitted ? "cursor-default" : "cursor-pointer"
          )}
        >
          <motion.div
            animate={tileHovering ? { y: -4, scale: 1.01 } : { y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
          {!hasStarted && !loading && (
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-display font-bold text-brand-slate">
                Get started with your application
              </h3>
              <div className="h-0.5 w-24 bg-slate-200 group-hover:bg-brand-blue transition-colors duration-300" />
              <p className="text-slate-500 text-sm font-normal leading-relaxed">
                Complete your student profiling to be considered for support. The process has 4 sections and takes about 10 minutes.
              </p>
              <p className="text-xs text-slate-400 font-medium group-hover:text-brand-blue transition-colors">
                Click to begin →
              </p>
            </div>
          )}

          {loading && (
            <div className="space-y-4">
              <div className="h-5 w-40 bg-slate-100 animate-pulse" />
              <div className="h-2 w-full bg-slate-100 animate-pulse" />
            </div>
          )}

          {!loading && hasStarted && !isSubmitted && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-brand-slate">Profile completion</h3>
                <span className="px-3 py-1 text-xs font-medium border bg-blue-50 text-brand-blue border-blue-200">
                  In progress
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-5xl font-black text-brand-slate">
                  {progressPct}<span className="text-2xl text-slate-300 font-bold">%</span>
                </span>
                <span className="text-xs font-medium text-slate-400">
                  {progress.completedSteps} of {progress.totalSteps} steps
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden" style={{ backgroundColor: "#F7F5F2" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-brand-blue"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {STEP_LABELS.map((name, i) => {
                  const state = sectionStates[i];
                  return (
                    <div
                      key={name}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 border text-xs font-medium",
                        sectionChipClass(state),
                      )}
                      style={state === "empty" ? { backgroundColor: "#F7F5F2" } : {}}
                    >
                      {state === "complete" ? (
                        <CheckCircle2 size={13} className="shrink-0" />
                      ) : state === "partial" ? (
                        <div className="w-2 h-2 shrink-0 bg-amber-500" />
                      ) : (
                        <div className="w-2 h-2 shrink-0 bg-slate-300" />
                      )}
                      {name}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-brand-blue font-medium group-hover:underline">
                Continue your application →
              </p>
            </div>
          )}

          {!loading && isSubmitted && (
            <div className="flex flex-col items-center text-center py-6 gap-4">
              <CheckCircle2 size={36} className="text-emerald-500" />
              <h2 className="text-2xl font-display font-bold text-brand-slate">Congratulations!</h2>
              <p className="text-slate-500 text-sm font-normal max-w-sm">
                You have completed your application. The committee will review your profile and get back to you.
              </p>
            </div>
          )}
          </motion.div>
        </motion.div>

        <div
          className="lg:col-span-1 border border-slate-200 hover:border-brand-blue p-6 hover:shadow-[0_16px_48px_-8px_rgba(15,23,42,0.22)] hover:scale-[1.015]"
          style={{ transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s" }}
        >
          <h4 className="font-bold text-brand-slate text-sm mb-6 flex items-center gap-2">
            <Clock size={15} className="text-brand-blue" />
            Timeline
          </h4>
          <div className="space-y-5 relative before:absolute before:left-[13px] before:top-1 before:bottom-1 before:w-px before:bg-slate-200">
            {[
              { title: "Account created", done: true },
              { title: "Application started", done: hasStarted },
              { title: "Under review", done: isSubmitted },
              { title: "Final outcome", done: status?.status === "approved" },
            ].map((item, i) => (
              <div key={i} className="relative pl-9">
                <div
                  className={cn(
                    "absolute left-0 top-0.5 w-7 h-7 border-2 border-white flex items-center justify-center z-10 transition-colors",
                    item.done ? "bg-brand-blue" : "bg-slate-200",
                  )}
                >
                  {item.done ? (
                    <CheckCircle2 size={13} className="text-white" />
                  ) : (
                    <div className="w-2 h-2 bg-slate-400" />
                  )}
                </div>
                <p className={cn("text-xs font-medium leading-none", item.done ? "text-brand-slate" : "text-slate-400")}>
                  {item.title}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">{item.done ? "Completed" : "Pending"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
