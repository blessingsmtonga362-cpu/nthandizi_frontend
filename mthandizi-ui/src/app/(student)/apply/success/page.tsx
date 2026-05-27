"use client";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const submittedAt = searchParams.get("submittedAt");
  const refNumber = submittedAt
    ? `APP-${new Date(submittedAt).getTime().toString().slice(-9)}`
    : "APP-PENDING";
  const submittedDate = submittedAt
    ? new Date(submittedAt).toLocaleString()
    : "Just now";

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-24 h-24 flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 size={48} className="text-emerald-500" />
        </div>

        <h1 className="text-3xl font-extrabold text-unima-blue mb-4">Application Submitted</h1>
        <p className="text-unima-slate mb-8">
          Thank you for completing your profile. Your application has been received and is now in the review queue.
        </p>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
            <span className="text-xs font-bold text-unima-slate uppercase">Reference ID</span>
            <span className="font-mono font-bold text-unima-blue">{refNumber}</span>
          </div>
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
            <span className="text-xs font-bold text-unima-slate uppercase">Submitted</span>
            <span className="text-sm font-semibold text-unima-blue">{submittedDate}</span>
          </div>
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3 text-sm text-unima-blue font-medium">
              <div className="w-1.5 h-1.5 bg-unima-gold rounded-full" />
              Document verification (2-3 days)
            </div>
            <div className="flex items-center gap-3 text-sm text-unima-blue font-medium">
              <div className="w-1.5 h-1.5 bg-unima-gold rounded-full" />
              Committee review
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button className="h-14 bg-unima-blue hover:bg-unima-blueLight text-white rounded-xl text-md font-bold" asChild>
            <Link href="/status">Track Application Status <ArrowRight className="ml-2 w-4 h-4" /></Link>
          </Button>
          <Button variant="ghost" className="text-unima-slate font-bold" asChild>
            <Link href="/dashboard"><Home className="mr-2 w-4 h-4" /> Back to Dashboard</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
