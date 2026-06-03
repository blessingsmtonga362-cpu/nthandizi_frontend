"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2, Users, FileText, Trash2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  createSponsor,
  deleteSponsor,
  getAssetUrl,
  getSponsorDetails,
  getSponsors,
  getRankingCriteria,
  type SponsorDetails,
  type SponsorListItem,
  type RankingCriteriaTemplate,
} from "@/lib/api";

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<SponsorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeSponsor, setActiveSponsor] = useState<SponsorDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [name, setName] = useState("");
  const [requestedSlots, setRequestedSlots] = useState("");
  const [selectedCriteriaId, setSelectedCriteriaId] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [deletingSponsorId, setDeletingSponsorId] = useState<string | null>(null);
  const [criteria, setCriteria] = useState<RankingCriteriaTemplate[]>([]);
  const [criteriaLoading, setCriteriaLoading] = useState(false);

  const loadSponsors = async () => {
    try {
      const response = await getSponsors();
      setSponsors(response);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sponsors.");
    } finally {
      setLoading(false);
    }
  };

  const loadCriteria = async () => {
    setCriteriaLoading(true);
    try {
      const response = await getRankingCriteria();
      setCriteria(response.templates || []);
    } catch (err) {
      console.error("Failed to load criteria:", err);
    } finally {
      setCriteriaLoading(false);
    }
  };

  useEffect(() => {
    void loadSponsors().catch(() => {});
    void loadCriteria().catch(() => {});
  }, []);

  const openSponsor = async (sponsorId: string) => {
    setDetailsLoading(true);
    try {
      const response = await getSponsorDetails(sponsorId);
      setActiveSponsor(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sponsor details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const resetModal = () => {
    setName("");
    setRequestedSlots("");
    setSelectedCriteriaId("");
    setLogoFile(null);
    setCreateError("");
  };

  const handleCreateSponsor = async () => {
    const slots = Number(requestedSlots);

    if (!name.trim()) {
      setCreateError("Sponsor name is required.");
      return;
    }

    if (!Number.isInteger(slots) || slots <= 0) {
      setCreateError("Enter a valid number of applicants to sponsor.");
      return;
    }

    setCreating(true);
    setCreateError("");

    try {
      const sponsor = await createSponsor({
        name: name.trim(),
        requestedSlots: slots,
        logo: logoFile,
        rankingCriteriaId: selectedCriteriaId || undefined,
      });

      setIsAddModalOpen(false);
      resetModal();
      await loadSponsors();
      setActiveSponsor(sponsor);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create sponsor.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSponsor = async (sponsor: SponsorListItem | SponsorDetails) => {
    const confirmed = window.confirm(`Delete ${sponsor.name}? This will remove its allocations too.`);
    if (!confirmed) return;

    setDeletingSponsorId(sponsor.id);
    setError("");

    try {
      await deleteSponsor(sponsor.id);
      if (activeSponsor?.id === sponsor.id) {
        setActiveSponsor(null);
      }
      await loadSponsors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete sponsor.");
    } finally {
      setDeletingSponsorId(null);
    }
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Partner Sponsors</h1>
          <p className="text-slate-500 text-sm mt-1">Create sponsors and allocate approved applicants using live backend data.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <button
          onClick={() => { resetModal(); setIsAddModalOpen(true); }}
          className="h-48 border-2 border-dashed border-slate-200 hover:border-brand-blue hover:bg-brand-blue/[0.02] transition-all flex flex-col items-center justify-center gap-3 group"
        >
          <div className="w-12 h-12 bg-slate-100 group-hover:bg-brand-blue group-hover:text-white flex items-center justify-center transition-all">
            <Plus size={24} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-brand-blue">Add Sponsor</span>
        </button>

        {loading ? (
          [...Array(3)].map((_, index) => (
            <div key={index} className="h-48 border border-slate-200 bg-white animate-pulse" />
          ))
        ) : sponsors.length === 0 ? (
          <div className="col-span-full border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-400">
            No sponsors created yet.
          </div>
        ) : (
          sponsors.map((sponsor) => {
            const logoUrl = getAssetUrl(sponsor.logoUrl);
            return (
              <motion.div
                key={sponsor.id}
                whileHover={{ y: -4 }}
                onClick={() => void openSponsor(sponsor.id)}
                className="h-48 bg-white border border-slate-200 p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:border-brand-blue transition-all cursor-pointer relative overflow-hidden flex flex-col items-center justify-center text-center gap-4"
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleDeleteSponsor(sponsor);
                  }}
                  disabled={deletingSponsorId === sponsor.id}
                  className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center border border-slate-200 bg-white text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                  aria-label={`Delete ${sponsor.name}`}
                  title="Delete sponsor"
                >
                  {deletingSponsorId === sponsor.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
                <div className={cn(
                    "absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 border",
                    sponsor.status === "completed"
                      ? "bg-emerald-50 border-emerald-100"
                      : sponsor.status === "partial"
                        ? "bg-amber-50 border-amber-100"
                        : "bg-slate-50 border-slate-200",
                  )}
                >
                  {sponsor.status === "partial" && <Loader2 size={10} className="animate-spin text-amber-600" />}
                  <span
                    className={cn(
                      "text-[9px] font-black uppercase tracking-tighter",
                      sponsor.status === "completed"
                        ? "text-emerald-600"
                        : sponsor.status === "partial"
                          ? "text-amber-600"
                          : "text-slate-500",
                    )}
                  >
                    {sponsor.status}
                  </span>
                </div>

                <div className="w-20 h-20 bg-brand-surface flex items-center justify-center text-brand-blue font-black text-2xl border border-slate-100 overflow-hidden">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt={sponsor.name} className="h-full w-full object-cover" />
                  ) : (
                    sponsor.name.substring(0, 2).toUpperCase()
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">{sponsor.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {sponsor.allocatedCount} / {sponsor.requestedSlots} Allocated
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {activeSponsor && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSponsor(null)}
              className="absolute inset-x-0 top-16 bottom-0 bg-slate-900/20 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-16 bottom-0 z-50 flex flex-col w-full max-w-2xl bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)]"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-slate text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                    {activeSponsor.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={getAssetUrl(activeSponsor.logoUrl) ?? ""} alt={activeSponsor.name} className="h-full w-full object-cover" />
                    ) : (
                      activeSponsor.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-brand-slate tracking-tight">{activeSponsor.name}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {activeSponsor.allocatedCount} of {activeSponsor.requestedSlots} approved applicants allocated
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveSponsor(null)}
                  className="w-10 h-10 border border-slate-200 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {detailsLoading ? (
                  <div className="flex items-center gap-3 border border-slate-100 bg-slate-50 p-6 text-sm text-slate-500">
                    <Loader2 size={18} className="animate-spin" />
                    Loading sponsor allocations...
                  </div>
                ) : activeSponsor.applicants.length === 0 ? (
                  <div className="border border-slate-100 bg-slate-50 p-6">
                    <h4 className="text-sm font-bold text-brand-blue flex items-center gap-2 mb-2">
                      <Users size={16} /> No allocations yet
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      There are no unallocated approved applicants available for this sponsor yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h3 className="font-display font-bold text-brand-slate uppercase tracking-widest text-[10px]">Allocated Approved Applicants</h3>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Highest need index first
                      </span>
                    </div>

                    <div className="bg-white overflow-hidden border border-slate-200">
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
                          {activeSponsor.applicants.map((applicant, i) => (
                            <tr key={applicant.userId} className="hover:bg-slate-50 transition-colors text-sm">
                              <td className="px-6 py-4 text-sm font-normal text-slate-600">
                                {applicant.rank ?? i + 1}
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-normal text-slate-600">{applicant.name}</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {applicant.registrationNumber || applicant.email}
                                </p>
                              </td>
                              <td className="px-6 py-4 text-sm font-normal text-slate-600">{applicant.program}</td>
                              <td className="px-6 py-4 text-center">
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
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="h-14 flex-1 bg-emerald-500 text-white flex items-center justify-center gap-3 font-bold text-sm">
                    <FileText size={20} />
                    Live Sponsor Allocation
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDeleteSponsor(activeSponsor)}
                    disabled={deletingSponsorId === activeSponsor.id}
                    className="h-14 border border-red-200 bg-white px-5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                  >
                    {deletingSponsorId === activeSponsor.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
                <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-4">
                  Allocations are generated from approved applicants only.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-slate/60 backdrop-blur-md"
              onClick={() => setIsAddModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md p-10 relative z-10 shadow-2xl"
            >
              <h2 className="text-2xl font-display font-bold text-brand-slate tracking-tight mb-2">New Sponsor</h2>
              <p className="text-slate-500 text-sm mb-8 font-normal">Create a sponsor and allocate approved applicants from the backend.</p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">Sponsor Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter organization name"
                    className="h-14 rounded-none border border-slate-300 px-4 font-normal text-slate-800 placeholder:text-slate-400 placeholder:font-light hover:border-brand-blue focus:border-brand-blue transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">Number Of Applicants</label>
                  <Input
                    type="number"
                    min="1"
                    value={requestedSlots}
                    onChange={(e) => setRequestedSlots(e.target.value)}
                    placeholder="e.g. 50"
                    className="h-14 rounded-none border border-slate-300 px-4 font-normal text-slate-800 placeholder:text-slate-400 placeholder:font-light hover:border-brand-blue focus:border-brand-blue transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">Ranking Criteria</label>
                  <div className="relative">
                    <select
                      value={selectedCriteriaId}
                      onChange={(e) => setSelectedCriteriaId(e.target.value)}
                      disabled={criteriaLoading}
                      className="h-14 rounded-none border border-slate-300 px-4 font-normal text-slate-800 placeholder:text-slate-400 hover:border-brand-blue focus:border-brand-blue transition-colors appearance-none w-full bg-white cursor-pointer"
                    >
                      <option value="">
                        {criteriaLoading ? "Loading criteria…" : "— Select criteria (Optional) —"}
                      </option>
                      {criteria.map((crit) => (
                        <option key={crit.id} value={crit.id}>
                          {crit.name} {crit.isActive ? "(Active)" : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">Logo Image</label>
                  <label className="border-2 border-dashed border-slate-300 p-6 flex flex-col items-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer">
                    <Plus className="text-slate-300" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {logoFile ? logoFile.name : "Upload PNG, JPG, or WEBP"}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>

                {createError && (
                  <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {createError}
                  </div>
                )}

                <Button
                  onClick={() => void handleCreateSponsor()}
                  disabled={creating}
                  className="w-full h-14 bg-brand-blue text-white font-bold mt-4 hover:bg-brand-blueDark"
                >
                  {creating ? <Loader2 className="animate-spin" /> : "Register Sponsor"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
