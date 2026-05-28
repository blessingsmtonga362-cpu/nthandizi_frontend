"use client";
import { useApplicationStore } from "@/lib/store/use-application-store";
import { Input } from "@/components/ui/input";
import { EducationLevel } from "@/lib/store/use-application-store";

const labelClass = "text-sm font-medium text-slate-700 mb-2 block";
const inputClass = "h-14 rounded-none border border-slate-200 px-6 font-normal text-slate-800 placeholder:font-light hover:border-brand-blue focus:border-brand-blue transition-colors";
const selectClass = "wizard-select w-full h-14 rounded-none border border-slate-200 px-6 font-normal text-slate-800 outline-none appearance-none hover:border-brand-blue focus:border-brand-blue transition-colors";

const LEVEL_LABELS: Record<"primary" | "secondary" | "tertiary", string> = {
  primary: "Primary Education",
  secondary: "Secondary Education",
  tertiary: "Tertiary Education",
};

const LEVEL_SUBTITLES: Record<"primary" | "secondary" | "tertiary", string> = {
  primary: "Required.",
  secondary: "Required.",
  tertiary: "Optional — leave blank if not applicable.",
};

function EducationForm({
  level,
  data,
  onChange,
}: {
  level: "primary" | "secondary" | "tertiary";
  data: EducationLevel;
  onChange: (d: Partial<EducationLevel>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <p className="text-sm font-medium text-slate-700">{LEVEL_LABELS[level]}</p>
        <p className="text-xs font-normal text-slate-400 mt-0.5">
          {LEVEL_SUBTITLES[level]}
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className={labelClass}>Name of School</label>
          <Input
            className={inputClass}
            placeholder="e.g. Kamuzu Academy"
            value={data.schoolName}
            onChange={(e) => onChange({ schoolName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Tuition Fee (Per Term)</label>
          <Input
            type="number"
            className={inputClass}
            placeholder="e.g. 50000"
            value={data.tuitionFee}
            onChange={(e) => onChange({ tuitionFee: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Year Completed</label>
          <Input
            type="number"
            className={inputClass}
            placeholder="e.g. 2018"
            value={data.yearCompleted}
            onChange={(e) => onChange({ yearCompleted: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Who Paid Fees</label>
          <select
            className={selectClass}
            value={data.whoPaidFees}
            onChange={(e) => onChange({ whoPaidFees: e.target.value })}
          >
            <option value="">Select payer</option>
            <option value="Parent">Parent</option>
            <option value="Sponsor">Sponsor</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default function Step3() {
  const { data, updateEducation } = useApplicationStore();

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm font-normal text-slate-500">
          Primary and secondary education are required. Tertiary is optional — only fill it if you have attended.
        </p>
      </div>

      <EducationForm
        level="primary"
        data={data.education.primary}
        onChange={(d) => updateEducation("primary", d)}
      />

      <div className="border-t border-slate-100" />

      <EducationForm
        level="secondary"
        data={data.education.secondary}
        onChange={(d) => updateEducation("secondary", d)}
      />

      <div className="border-t border-slate-100" />

      <EducationForm
        level="tertiary"
        data={data.education.tertiary}
        onChange={(d) => updateEducation("tertiary", d)}
      />
    </div>
  );
}
