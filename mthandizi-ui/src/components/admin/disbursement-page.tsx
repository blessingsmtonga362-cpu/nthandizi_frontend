"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  RefreshCw,
  X,
  ChevronDown,
} from "lucide-react";
import {
  initiateTransfer,
  getTransferHistory,
  getApprovedStudentsForDisbursement,
  getApplicantPaymentDetails,
  type Transfer,
  type TransferStatus,
  type ApprovedStudentForDisbursement,
} from "@/lib/api";

// ── helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(amount: number, currency = "MWK") {
  return `${currency} ${amount.toLocaleString()}`;
}

const STATUS_CONFIG: Record<
  TransferStatus,
  { label: string; icon: React.ElementType; classes: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    classes: "border-amber-200 bg-amber-50 text-amber-600",
  },
  success: {
    label: "Success",
    icon: CheckCircle,
    classes: "border-emerald-200 bg-emerald-50 text-emerald-600",
  },
  failed: {
    label: "Failed",
    icon: AlertCircle,
    classes: "border-red-200 bg-red-50 text-red-500",
  },
};

function StatusBadge({ status }: { status: TransferStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        cfg.classes,
      )}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

// ── Transfer form ─────────────────────────────────────────────────────────────

interface FormState {
  selectedUserId: string;
  amount: string;
  name: string;
  paymentAccountNumber: string;
  sponsorName: string;
}

const EMPTY_FORM: FormState = { selectedUserId: "", amount: "", name: "", paymentAccountNumber: "", sponsorName: "" };

function TransferForm({ onSuccess }: { onSuccess: (transfer: Transfer) => void }) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [paymentDetailsLoading, setPaymentDetailsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<Transfer | null>(null);

  const [approvedStudents, setApprovedStudents] = useState<ApprovedStudentForDisbursement[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);

  useEffect(() => {
    getApprovedStudentsForDisbursement()
      .then(setApprovedStudents)
      .catch(() => {})
      .finally(() => setStudentsLoading(false));
  }, []);

  const fieldClass =
    "w-full h-12 border border-slate-200 bg-white px-4 text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-blue transition-colors";

  const isValid =
    form.selectedUserId.length > 0 &&
    Number(form.amount) > 0;

  // Picking a student pre-fills basic data, then lazily fetches payment details
  const handleStudentSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    if (!userId) {
      setForm(EMPTY_FORM);
      return;
    }
    const student = approvedStudents.find((s) => s.userId === userId);
    if (student) {
      // Set basic info immediately so the form reveals
      setForm({
        selectedUserId: userId,
        name: student.name,
        paymentAccountNumber: "",
        sponsorName: student.sponsorName ?? "",
        amount: "",
      });

      // Fetch payment details lazily
      setPaymentDetailsLoading(true);
      try {
        const details = await getApplicantPaymentDetails(userId);
        setForm((f) => ({
          ...f,
          // Prefer mobile money phone number; fall back to bank account
          paymentAccountNumber: details.paymentPhoneNumber ?? details.bankAccount ?? "",
        }));
      } catch {
        // non-fatal — form will just show empty field
      } finally {
        setPaymentDetailsLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setError("");
    setSuccess(null);

    try {
      const res = await initiateTransfer({
        phone: form.paymentAccountNumber.trim(),
        amount: Number(form.amount),
        name: form.name.trim(),
        sponsorName: form.sponsorName.trim() || undefined,
      });
      setSuccess(res.data);
      // Remove the disbursed student from the dropdown
      setApprovedStudents((prev) => prev.filter((s) => s.userId !== form.selectedUserId));
      setForm(EMPTY_FORM);
      onSuccess(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 p-6 space-y-5">
      <div>
        <h2 className="text-base font-bold text-brand-slate">New Disbursement</h2>
        <p className="text-sm text-slate-400 font-normal mt-0.5">
          Send a mobile money payout via PayChangu.
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">

        {/* Approved student picker - Always shown */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Select Approved Student
          </label>
          <div className="relative">
            <select
              onChange={(e) => void handleStudentSelect(e)}
              value={form.selectedUserId}
              disabled={studentsLoading}
              className={cn(fieldClass, "appearance-none pr-10 cursor-pointer disabled:opacity-50")}
            >
              <option value="">
                {studentsLoading ? "Loading approved students…" : "— Pick a student —"}
              </option>
              {approvedStudents.map((s) => (
                <option key={s.userId} value={s.userId}>
                  {s.name}{s.sponsorName ? ` — ${s.sponsorName}` : ""}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        {/* Show details only after student selection */}
        {form.selectedUserId && (
          <div className="space-y-4 border-t pt-4">
            {/* Recipient name — read-only */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Recipient Name
              </label>
              <input
                type="text"
                value={form.name}
                readOnly
                className={cn(fieldClass, "bg-slate-50 cursor-default")}
              />
            </div>

            {/* Payment Account Number — read-only */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Payment Account Number
              </label>
              <input
                type="text"
                value={paymentDetailsLoading ? "Loading…" : (form.paymentAccountNumber || "—")}
                readOnly
                className={cn(fieldClass, "bg-slate-50 cursor-default", paymentDetailsLoading && "animate-pulse")}
              />
              <p className="text-[11px] text-slate-400">
                From student&apos;s payment details in their profile.
              </p>
            </div>

            {/* Amount - Editable */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Amount (MWK)
              </label>
              <input
                type="number"
                min={1}
                placeholder="e.g. 5000"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className={fieldClass}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValid || loading}
              className="w-full h-12 bg-brand-slate text-white text-sm font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-brand-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send size={15} />
                  Send Disbursement
                </>
              )}
            </button>
          </div>
        )}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-start gap-2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-start gap-2 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
              <CheckCircle size={15} className="mt-0.5 shrink-0" />
              Transfer initiated — ref:{" "}
              <span className="font-mono font-semibold">{success.reference}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}

// ── Transaction history table ─────────────────────────────────────────────────

function TransactionHistory({
  transfers,
  loading,
  onRefresh,
  refreshing,
}: {
  transfers: Transfer[];
  loading: boolean;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <div className="bg-white border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-brand-slate">Transaction History</h2>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            All disbursements processed through PayChangu.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-blue transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={cn(refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <th className="px-6 py-3">Reference</th>
              <th className="px-6 py-3">Student</th>
              <th className="px-6 py-3">Sponsor</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Provider</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((__, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-3.5 bg-slate-100 rounded animate-pulse w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : transfers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm font-normal">
                  No disbursements recorded yet.
                </td>
              </tr>
            ) : (
              transfers.map((t, i) => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">{t.reference}</td>
                  {/* Show student name for successful transfers, phone otherwise */}
                  <td className="px-6 py-4 font-normal text-slate-700">
                    {t.status === "success" && t.name ? t.name : t.phone}
                  </td>
                  {/* Sponsor only shown for successful transfers */}
                  <td className="px-6 py-4 font-normal text-slate-500">
                    {t.status === "success" ? (t.sponsorName ?? "—") : "—"}
                  </td>
                  <td className="px-6 py-4 font-semibold text-brand-slate">
                    {formatAmount(t.amount, t.currency)}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{t.provider ?? "—"}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">{formatDate(t.createdAt)}</td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Summary tiles ─────────────────────────────────────────────────────────────

function SummaryTiles({ transfers }: { transfers: Transfer[] }) {
  const total = transfers.length;
  const successful = transfers.filter((t) => t.status === "success").length;
  const pending = transfers.filter((t) => t.status === "pending").length;
  const failed = transfers.filter((t) => t.status === "failed").length;
  const totalAmount = transfers
    .filter((t) => t.status === "success")
    .reduce((sum, t) => sum + t.amount, 0);

  const tiles = [
    { label: "Total transfers", value: total, color: "text-brand-blue" },
    { label: "Successful", value: successful, color: "text-emerald-600" },
    { label: "Pending", value: pending, color: "text-amber-500" },
    { label: "Failed", value: failed, color: "text-red-500" },
    { label: "Total disbursed", value: `MWK ${totalAmount.toLocaleString()}`, color: "text-brand-slate" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {tiles.map((tile, i) => (
        <motion.div
          key={tile.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="bg-white border border-slate-200 px-5 py-4"
        >
          <p className="text-xs text-slate-400 font-normal">{tile.label}</p>
          <p className={cn("text-2xl font-display font-bold mt-1", tile.color)}>
            {tile.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

// ── Main page component ───────────────────────────────────────────────────────

export default function DisbursementPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const loadHistory = useCallback(async (silent = false) => {
    if (!silent) setHistoryLoading(true);
    else setRefreshing(true);
    setHistoryError("");
    try {
      const data = await getTransferHistory();
      setTransfers(data);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : "Failed to load history.");
    } finally {
      setHistoryLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const handleNewTransfer = (transfer: Transfer) => {
    setTransfers((prev) => [transfer, ...prev]);
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/disbursement.png" alt="" className="h-8 w-8 object-contain opacity-80" />
          <div>
            <h1 className="text-2xl font-display font-bold text-brand-slate tracking-tight">
              Disbursement
            </h1>
            <p className="text-slate-400 text-sm font-normal mt-0.5">
              Initiate and track mobile money payouts via PayChangu.
            </p>
          </div>
        </div>
      </div>

      {/* Summary tiles */}
      <SummaryTiles transfers={transfers} />

      {/* Disbursement form — full width now */}
      <TransferForm onSuccess={handleNewTransfer} />

      {/* History error */}
      <AnimatePresence>
        {historyError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            <span className="flex items-center gap-2">
              <AlertCircle size={14} />
              {historyError}
            </span>
            <button onClick={() => setHistoryError("")}>
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction history */}
      <TransactionHistory
        transfers={transfers}
        loading={historyLoading}
        onRefresh={() => void loadHistory(true)}
        refreshing={refreshing}
      />
    </div>
  );
}
