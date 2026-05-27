"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2, Users, FileText, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  createSponsor,
  getAssetUrl,
  getSponsorDetails,
  getSponsors,
  type SponsorDetails,
  type SponsorListItem,
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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

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

  useEffect(() => {
    
    void loadSponsors().catch(() => {});
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

  const fieldClass = "h-14 rounded-none border border-slate-300 px-4 font-normal text-slate-800 placeholder:text-slate-400 placeholder:font-light hover:border-brand-blue focus:border-brand-blue transition-colors";

  return (
    <div className="min-h-[calc(100vh-8rem)] pb-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Partner Sponsors</h1>
          <p className="text-slate-500 text-sm mt-1">Create sponsors and allocate approved applicants.</p>
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
              className="fixed inset-x-0 top-16 bottom-0 bg-slate-900/20 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-16 bottom-0 z-50 flex flex-col w-full max-w-2xl bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)]"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-slate text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                    {activeSponsor.logoUrl ? (
                    
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
                        Highest score first
                      </span>
                    </div>

                    <div className="bg-slate-50 overflow-hidden border border-slate-100">
                      <table className="w-full text-left">
                        <thead className="bg-slate-100/50">
                          <tr className="text-xs font-semibold text-slate-500">
                            <th className="px-6 py-4">Rank</th>
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">Programme</th>
                            <th className="px-6 py-4 text-center">Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activeSponsor.applicants.map((applicant) => (
                            <tr key={applicant.userId} className="text-sm">
                              <td className="px-6 py-4 font-black text-brand-blue">#{String(applicant.rank).padStart(2, "0")}</td>
                              <td className="px-6 py-4">
                                <p className="font-bold text-brand-slate">{applicant.name}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                  {applicant.registrationNumber || applicant.email}
                                </p>
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-500">{applicant.program}</td>
                              <td className="px-6 py-4 text-center">
                                <span className="border border-slate-200 bg-white px-2 py-1 text-[10px] font-black">
                                  {applicant.score}
                                </span>
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
                <div className="w-full h-14 bg-emerald-500 text-white flex items-center justify-center gap-3 font-bold text-sm">
                  <FileText size={20} />
                  Live Sponsor Allocation
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
          <div className="fixed inset-0 z-[100] flex justify-center overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setIsAddModalOpen(false)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/3-hanz.jpg"
                alt="Background"
                className="absolute inset-0 h-full w-full scale-105 object-cover blur-md"
              />
              <div className="absolute inset-0 bg-brand-slate/70" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative z-10 flex h-screen w-full max-w-md shadow-2xl"
            >
              <div className="flex-1 overflow-y-auto px-8 py-12 md:px-16 custom-scrollbar" style={{ backgroundColor: "#FAF9F7" }}>
                <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-full max-w-sm"
                >
                  <h2 className="text-4xl font-display font-bold text-brand-slate tracking-tight mb-1">
                    New Sponsor
                  </h2>
                  <p className="text-slate-500 font-normal mb-10">
                    Create a sponsor and allocate approved applicants from the backend.
                  </p>

                  <form
                    autoComplete="off"
                    className="space-y-6"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void handleCreateSponsor();
                    }}
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 block">Sponsor Name</label>
                      <Input
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (createError) setCreateError("");
                        }}
                        placeholder="Enter organization name"
                        className={cn(fieldClass, createError && !name.trim() ? "border-red-500" : "")}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 block">Number of Applicants</label>
                      <Input
                        type="number"
                        min="1"
                        value={requestedSlots}
                        onChange={(e) => {
                          setRequestedSlots(e.target.value);
                          if (createError) setCreateError("");
                        }}
                        placeholder="e.g. 50"
                        className={fieldClass}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 block">Logo Image</label>
                      <label className="border-2 border-dashed border-slate-300 p-6 flex cursor-pointer flex-col items-center gap-2 transition-colors hover:border-brand-blue hover:bg-white/50">
                        <Plus size={20} className="text-slate-400" />
                        <span className="text-xs font-medium text-slate-600">
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

                    <AnimatePresence>
                      {createError && (
                        <motion.p
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="text-red-500 text-xs flex items-center gap-1.5"
                        >
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {createError}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={creating}
                      className="w-full h-14 bg-brand-slate text-white font-bold text-sm tracking-wide hover:bg-brand-blue hover:scale-[1.01] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                    >
                      {creating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Creating...
                        </>
                      ) : "Register Sponsor"}
                    </button>

                    <div className="relative flex items-center py-2">
                      <div className="flex-grow border-t border-slate-200" />
                      <span className="mx-4 text-xs text-slate-400">or</span>
                      <div className="flex-grow border-t border-slate-200" />
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="w-full h-14 border border-slate-300 text-brand-slate font-bold text-sm hover:border-brand-blue hover:text-brand-blue transition-colors"
                    >
                      Cancel
                    </button>
                  </form>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
