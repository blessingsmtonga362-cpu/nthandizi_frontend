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
  ChevronRight,
} from "lucide-react";
import {
  initiateTransfer,
  getTransferHistory,
  getTransferStatus,
  type Transfer,
  type TransferStatus,
} from "@/lib/api";

// ── helpers ──────────────────────────────────────────────────────────────────

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
  { label: string; icon: React.ElementType; classes: string; dot: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    classes: "border-amber-200 bg-amber-50 text-amber-600",
    dot: "bg-amber-400",
  },
  success: {
    label: "Success",
    icon: CheckCircle,
    classes: "border-emerald-200 bg-emerald-50 text-emerald-600",
    dot: "bg-emerald-500",
  },
  failed: {
    label: "Failed",
    icon: AlertCircle,
    classes: "border-red-200 bg-red-50 text-red-500",
    dot: "bg-red-500",
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
  phone: string;
  amount: string;
  name: string;
}

const EMPTY_FORM: FormState = { phone: "", amount: "", name: "" };

function TransferForm({
  onSuccess,
}: {
  onSuccess: (transfer: Transfer) => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<Transfer | null>(null);

  const fieldClass =
    "w-full h-12 border border-slate-200 bg-white px-4 text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-blue transition-colors";

  const isValid =
    form.phone.trim().length >= 9 &&
    Number(form.amount) > 0 &&
    form.name.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setError("");
    setSuccess(null);

    try {
      const res = await initiateTransfer({
        phone: form.phone.trim(),
        amount: Number(form.amount),
        name: form.name.trim(),
      });
      setSuccess(res.data);
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
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Recipient Name
          </label>
          <input
            type="text"
            placeholder="e.g. John Banda"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={fieldClass}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Phone Number
          </label>
          <input
            type="tel"
            placeholder="e.g. 0991234567"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={fieldClass}
            required
          />
          <p className="text-[11px] text-slate-400">
            Malawi numbers accepted — 0991234567 or +265991234567.
          </p>
        </div>

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
              Transfer initiated — ref: <span className="font-mono font-semibold">{success.reference}</span>
            </motion.div>
          )}
        </AnimatePresence>

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
      </form>
    </div>
  );
}

// ── Status checker ────────────────────────────────────────────────────────────

function StatusChecker() {
  const [ref, setRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Transfer | null>(null);
  const [error, setError] = useState("");

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await getTransferStatus(ref.trim());
      setResult(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not fetch status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 p-6 space-y-4">
      <div>
        <h2 className="text-base font-bold text-brand-slate">Check Transfer Status</h2>
        <p className="text-sm text-slate-400 font-normal mt-0.5">
          Look up a transaction by its reference number.
        </p>
      </div>

      <form onSubmit={(e) => void handleCheck(e)} className="flex gap-2">
        <input
          type="text"
          placeholder="Transaction reference"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          className="flex-1 h-10 border border-slate-200 bg-white px-3 text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-blue transition-colors"
        />
        <button
          type="submit"
          disabled={!ref.trim() || loading}
          className="h-10 px-4 bg-brand-slate text-white text-sm font-bold flex items-center gap-1.5 hover:bg-brand-blue transition-colors disabled:opacity-50"
        >
          {loading ? <RefreshCw size={13} className="animate-spin" /> : <ChevronRight size={13} />}
          Check
        </button>
      </form>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-red-500 flex items-center gap-1.5"
          >
            <AlertCircle size={13} /> {error}
          </motion.p>
        )}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="border border-slate-200 divide-y divide-slate-100 text-sm"
          >
            {[
              { label: "Reference", value: result.reference },
              { label: "Recipient Phone", value: result.phone },
              { label: "Amount", value: formatAmount(result.amount, result.currency) },
              { label: "Provider", value: result.provider ?? "—" },
              { label: "External Ref", value: result.externalReference ?? "—" },
              { label: "Created", value: formatDate(result.createdAt) },
              { label: "Updated", value: formatDate(result.updatedAt) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-slate-500 font-normal">{label}</span>
                <span className="font-medium text-brand-slate font-mono text-xs">{value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-slate-500 font-normal">Status</span>
              <StatusBadge status={result.status} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
              <th className="px-6 py-3">Phone</th>
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
                  {[...Array(6)].map((__, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-3.5 bg-slate-100 rounded animate-pulse w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : transfers.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-400 text-sm font-normal"
                >
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
                  <td className="px-6 py-4 text-slate-600">{t.phone}</td>
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

      {/* Two-column: form + status checker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransferForm onSuccess={handleNewTransfer} />
        <StatusChecker />
      </div>

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
