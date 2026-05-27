"use client";
import { useEffect, useState } from "react";
import { useApplicationStore } from "@/lib/store/use-application-store";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EducationLevel } from "@/lib/store/use-application-store";
import { motion, AnimatePresence } from "framer-motion";
import { getAcademicYearOptions } from "@/lib/api";

const labelClass = "text-sm font-medium text-slate-700 mb-2 block";
const inputClass = "h-14 rounded-none border border-slate-200 px-6 font-normal text-slate-800 placeholder:font-light hover:border-brand-blue focus:border-brand-blue transition-colors";
const selectClass = "wizard-select w-full h-14 rounded-none border border-slate-200 px-6 font-normal text-slate-800 outline-none appearance-none hover:border-brand-blue focus:border-brand-blue transition-colors";
const DEFAULT_YEAR_OPTIONS = [1, 2, 3, 4, 5, 6];

type TabKey = "primary" | "secondary" | "tertiary";
const TABS: { key: TabKey; label: string }[] = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "tertiary", label: "Tertiary" },
];

function EducationForm({ level, data, onChange }: { level: TabKey; data: EducationLevel; onChange: (d: Partial<EducationLevel>) => void }) {
  return (
    <motion.div
      key={level}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="grid md:grid-cols-2 gap-6 pt-6"
    >
      <div className="space-y-2">
        <label className={labelClass}>Name of School</label>
        <Input className={inputClass} placeholder="e.g. Kamuzu Academy" value={data.schoolName} onChange={(e) => onChange({ schoolName: e.target.value })} />
      </div>
      <div className="space-y-2">
        <label className={labelClass}>Tuition Fee (Per Term)</label>
        <Input type="number" className={inputClass} placeholder="e.g. 50000" value={data.tuitionFee} onChange={(e) => onChange({ tuitionFee: e.target.value })} />
      </div>
      <div className="space-y-2">
        <label className={labelClass}>Year Completed</label>
        <Input type="number" className={inputClass} placeholder="e.g. 2018" value={data.yearCompleted} onChange={(e) => onChange({ yearCompleted: e.target.value })} />
      </div>
      <div className="space-y-2">
        <label className={labelClass}>Who Paid Fees</label>
        <select className={selectClass} value={data.whoPaidFees} onChange={(e) => onChange({ whoPaidFees: e.target.value })}>
          <option value="">Select payer</option>
          <option value="Parent">Parent</option>
          <option value="Sponsor">Sponsor</option>
        </select>
      </div>
    </motion.div>
  );
}

export default function Step3() {
  const [activeTab, setActiveTab] = useState<TabKey>("primary");
  const [yearOptions, setYearOptions] = useState<number[]>(DEFAULT_YEAR_OPTIONS);
  const { data, updateEducation, updateAcademics } = useApplicationStore();

  useEffect(() => {
    let cancelled = false;

    const loadYearOptions = async () => {
      try {
        const options = await getAcademicYearOptions();
        if (!cancelled) {
          setYearOptions(options.length > 0 ? options : DEFAULT_YEAR_OPTIONS);
        }
      } catch {
        if (!cancelled) {
          setYearOptions(DEFAULT_YEAR_OPTIONS);
        }
      }
    };

    void loadYearOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Current Academic Details</p>
          <p className="text-sm text-slate-500">Tell us about your current university enrollment before adding your education history.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={labelClass}>Program of Study</label>
            <Input
              className={inputClass}
              placeholder="e.g. Bachelor of Science in Computer Science"
              value={data.academics.programOfStudy}
              onChange={(e) => updateAcademics({ programOfStudy: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Department</label>
            <Input
              className={inputClass}
              placeholder="e.g. Computer Science"
              value={data.academics.department}
              onChange={(e) => updateAcademics({ department: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:max-w-xs">
            <label className={labelClass}>Year of Study</label>
            <select
              className={selectClass}
              value={data.academics.yearOfStudy}
              onChange={(e) => updateAcademics({ yearOfStudy: e.target.value })}
            >
              <option value="">Select year</option>
              {yearOptions.map((year) => (
                <option key={year} value={String(year)}>
                  Year {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Education History</p>
          <p className="text-sm text-slate-500">Add each level only if you have attended it. If you start filling a level, complete all its fields.</p>
        </div>

      {/* Tabs */}
        <div className="flex gap-2 p-1.5 border border-slate-200" style={{ backgroundColor: "#F0EDE8" }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 h-11 font-black text-xs uppercase tracking-widest transition-all duration-300",
                activeTab === tab.key
                  ? "text-brand-blue shadow-sm border border-slate-200"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <EducationForm
            key={activeTab}
            level={activeTab}
            data={data.education[activeTab]}
            onChange={(d) => updateEducation(activeTab, d)}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
