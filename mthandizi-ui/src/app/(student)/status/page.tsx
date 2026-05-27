"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getApplicationStatus, getStoredUser, type ApplicationStatus } from "@/lib/api";
import { useApplicationProgress } from "@/hooks/use-application-progress";

type StatusKey = "draft" | "submitted" | "reviewing" | "approved" | "rejected";

const statusConfig: Record<StatusKey, { label: string; description: string }> = {
  draft: { label: "Not submitted", description: "You have not submitted your application yet." },
  submitted: { label: "Submitted", description: "Your application has been received and is queued for review." },
  reviewing: { label: "Under review", description: "Your profiling application was successfully submitted.\nThe committee is now assessing your information." },
  approved: { label: "Approved", description: "You have been approved for support. Congratulations!" },
  rejected: { label: "Not approved", description: "Your application was not approved this cycle. Contact the office for details." },
};

const STEPS = [
  { label: "Submitted", img: "/submitted.png" },
  { label: "Review", img: "/review.png" },
  { label: "Outcome", img: "/outcome.png" },
];

function getStepState(
  status: StatusKey,
  stepIndex: number,
  hasStartedApplying: boolean,
): "done" | "active" | "pending" {
  if (status === "approved") return "done";
  if (status === "rejected") {
    if (stepIndex === 2) return "active";
    if (stepIndex < 2) return "done";
    return "pending";
  }
  if (status === "reviewing") {
    if (stepIndex <= 1) return "done";
    if (stepIndex === 2) return "active";
    return "pending";
  }
  if (status === "submitted") {
    if (stepIndex === 0) return "done";
    if (stepIndex === 1) return "active";
    return "pending";
  }
  if (status === "draft" && hasStartedApplying) {
    if (stepIndex === 0) return "active";
    return "pending";
  }
  return "pending";
}

export default function ApplicationStatus() {
  const [appStatus, setAppStatus] = useState<ApplicationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { progress } = useApplicationProgress();
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    getApplicationStatus()
      .then(setAppStatus)
      .catch(() =>
        setAppStatus({ status: "draft", completedSteps: 0, totalSteps: 4, lastSaved: null, submittedAt: null })
      )
      .finally(() => setLoading(false));
  }, []);

  const currentStatus: StatusKey = (appStatus?.status as StatusKey) ?? "draft";
  const config = statusConfig[currentStatus];
  const locallyStarted =
    typeof window !== "undefined" && localStorage.getItem(`application_started_${getStoredUser()?.id ?? "anonymous"}`) === "true";
  const hasStartedApplying = progress.hasAnyInput || locallyStarted;

  return (
    <div className="max-w-3xl mx-auto pt-10 pb-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-8"
      >
        <motion.div
          whileHover={{
            scale: 1.015,
            boxShadow: "0 16px 48px -8px rgba(15,23,42,0.12)",
            borderColor: "rgb(59 130 246)",
          }}
          onHoverStart={() => setHovering(true)}
          onHoverEnd={() => setHovering(false)}
          transition={{ duration: 0.2 }}
          className={"relative p-10 md:p-16 overflow-hidden border border-slate-200 bg-brand-blue/5"}
          style={{ backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}
        >
          <motion.div
            className="flex flex-col items-center text-center"
            animate={hovering ? { y: -6, scale: 1.01 } : { y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            {loading ? (
              <div className="w-8 h-8 border-2 border-slate-200 border-t-brand-blue animate-spin mb-8" />
            ) : (
              <img
                src={
                  currentStatus === "draft"
                    ? "/submitted.png"
                    : currentStatus === "submitted"
                      ? "/submitted.png"
                      : currentStatus === "reviewing"
                        ? "/review.png"
                        : "/outcome.png"
                }
                alt={config.label}
                className="w-12 h-12 object-contain mb-8"
              />
            )}

            <span className="text-slate-400 font-medium text-xs mb-3">Current application state</span>

            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4 text-brand-slate">
              {loading ? "Loading..." : config.label}
            </h1>

            <p className="text-slate-500 font-normal max-w-md mx-auto leading-relaxed text-sm whitespace-pre-line">
              {loading ? "" : config.description}
            </p>
          </motion.div>
        </motion.div>

        <div className="flex justify-between items-start relative px-4">
          <div
            className="absolute top-6 left-4 right-4 h-px -z-10 bg-slate-200"
          />

          {STEPS.map((step, i) => {
            const state = getStepState(currentStatus, i, hasStartedApplying);
            const isDone = state === "done";
            const isActive = state === "active";

            return (
              <div key={step.label} className="flex flex-col items-center gap-3 flex-1">
                <img
                  src={step.img}
                  alt={step.label}
                  className={cn(
                    "w-10 h-10 object-contain transition-all duration-300",
                    isDone && "opacity-100",
                    isActive && "opacity-100",
                    !isDone && !isActive && "opacity-35",
                  )}
                  style={
                    isDone
                      ? { filter: "invert(42%) sepia(93%) saturate(1352%) hue-rotate(87deg) brightness(95%) contrast(86%)" }
                      : isActive
                        ? { filter: "invert(60%) sepia(98%) saturate(749%) hue-rotate(360deg) brightness(101%) contrast(101%)" }
                        : undefined
                  }
                />

                <span
                  className={cn(
                    "text-xs font-medium text-center",
                    isDone && "text-emerald-600",
                    isActive && "text-amber-600",
                    !isDone && !isActive && "text-slate-400",
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-5 pt-4"
        >
          {currentStatus !== "draft" && (
            <p className="text-slate-400 text-xs font-medium flex items-center gap-2">
              <Clock size={13} className="text-brand-blue" />
              Check back later for updates
            </p>
          )}

          {currentStatus === "draft" && !hasStartedApplying && (
            <Button
              className="h-14 px-10 bg-brand-blue hover:bg-brand-blueDark text-white font-bold text-xs transition-all"
              asChild
            >
              <Link href="/apply">Start application</Link>
            </Button>
          )}

          {(hasStartedApplying || currentStatus !== "draft") && (
            <Button
              className="h-14 px-10 text-brand-slate font-bold text-xs transition-all border border-slate-200 hover:border-brand-blue hover:text-brand-blue bg-transparent"
              asChild
            >
              <Link href={currentStatus === "draft" ? "/apply" : "/dashboard"}>
                {currentStatus === "draft" ? "Continue application" : "Return to dashboard"}
              </Link>
            </Button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
