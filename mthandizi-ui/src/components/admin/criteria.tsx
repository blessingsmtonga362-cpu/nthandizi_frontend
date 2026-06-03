"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  activateDefaultRankingCriteria,
  activateRankingCriteriaTemplate,
  deleteRankingCriteriaTemplate,
  getRankingCriteria,
  saveRankingCriteriaTemplate,
  type CriteriaBand,
  type CriteriaNamedScore,
  type RankingCriteriaConfig,
  type RankingCriteriaResponse,
  type RankingCriteriaTemplate,
} from "@/lib/api";

type ViewMode = "default" | "custom";

function cloneCriteria(criteria: RankingCriteriaConfig): RankingCriteriaConfig {
  return JSON.parse(JSON.stringify(criteria)) as RankingCriteriaConfig;
}

function InfoTooltip({ text }: { text: string }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-slate-400 hover:border-brand-blue hover:text-brand-blue transition-colors"
      >
        <span className="text-[11px] font-semibold leading-none">i</span>
      </button>
      {showTooltip && (
        <div className="absolute left-0 top-full mt-2 z-10 w-64 bg-slate-900 text-white text-xs rounded border border-slate-700 p-3 shadow-lg">
          <p className="leading-relaxed font-normal">{text}</p>
          <div className="absolute bottom-full left-2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-slate-900"></div>
        </div>
      )}
    </div>
  );
}


function sum(values: number[]) {
  return values.reduce((total, value) => total + (Number(value) || 0), 0);
}

function parseNumberInput(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function NumericInput({
  value,
  onChange,
  className,
  min,
  max,
  placeholder,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  className: string;
  min?: number;
  max?: number;
  placeholder?: string;
}) {
  const [text, setText] = useState(value === null ? "" : String(value));

  useEffect(() => {
    setText(value === null ? "" : String(value));
  }, [value]);

  const commitValue = (rawValue: string) => {
    if (!/^\d*\.?\d*$/.test(rawValue)) return;
    setText(rawValue);

    const parsed = parseNumberInput(rawValue);
    if (parsed === null) {
      onChange(null);
      return;
    }

    const withMinimum = min === undefined ? parsed : Math.max(min, parsed);
    const withMaximum = max === undefined ? withMinimum : Math.min(max, withMinimum);
    onChange(withMaximum);
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={text}
      placeholder={placeholder}
      onChange={(event) => commitValue(event.target.value)}
      onFocus={(event) => event.currentTarget.select()}
      onBlur={() => setText(value === null ? "" : String(value))}
      className={className}
    />
  );
}

function prioritizeBands(bands: CriteriaBand[], maximumScore: number): CriteriaBand[] {
  if (bands.length === 0) return bands;
  const priorityIndex = bands.reduce(
    (bestIndex, band, index) => (band.score > bands[bestIndex].score ? index : bestIndex),
    0,
  );
  return bands.map((band, index) => ({ ...band, score: index === priorityIndex ? maximumScore : 0 }));
}

function prioritizeNamedScores(rows: CriteriaNamedScore[], maximumScore: number): CriteriaNamedScore[] {
  if (rows.length === 0) return rows;
  const priorityIndex = rows.reduce(
    (bestIndex, row, index) => (row.score > rows[bestIndex].score ? index : bestIndex),
    0,
  );
  return rows.map((row, index) => ({ ...row, score: index === priorityIndex ? maximumScore : 0 }));
}

function zeroBands(bands: CriteriaBand[]): CriteriaBand[] {
  return bands.map((band) => ({ ...band, score: 0 }));
}

function zeroNamedScores(rows: CriteriaNamedScore[]): CriteriaNamedScore[] {
  return rows.map((row) => ({ ...row, score: 0 }));
}

function NumberField({
  label,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
}) {
  return (
    <label className="space-y-1">
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <NumericInput
        value={value}
        min={min}
        onChange={onChange}
        className="h-10 w-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-brand-blue"
      />
    </label>
  );
}

function SectionMaximumNotice({ total }: { total: number }) {
  if (total === 100) return null;
  return (
    <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
      Section maximums currently add to {total} / 100. Adjust the other section maximums so the total remains 100.
    </div>
  );
}

function ReadOnlyList({ title, rows }: { title: string; rows: Array<{ label: string; value: string | number }> }) {
  return (
    <div className="border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-bold text-brand-slate">{title}</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            <span className="text-slate-500">{row.label}</span>
            <span className="font-bold text-brand-slate">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BandsTable({
  title,
  maximumScore,
  bands,
  onChange,
}: {
  title: ReactNode;
  maximumScore: number;
  bands: CriteriaBand[];
  onChange: (bands: CriteriaBand[]) => void;
}) {
  const updateBand = (index: number, patch: Partial<CriteriaBand>) => {
    onChange(bands.map((band, i) => (i === index ? { ...band, ...patch } : band)));
  };

  return (
    <div className="border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div>
          <h4 className="text-sm font-bold text-brand-slate">{title}</h4>
          <p className="mt-1 text-xs text-slate-400">Each row score must be between 0 and {maximumScore}.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...bands, { minimum: 0, maximum: null, score: 0, isFlagged: false }])}
          className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:border-brand-blue hover:text-brand-blue"
        >
          <Plus size={14} />
          Add row
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
            <tr>
              <th className="px-4 py-3">Minimum</th>
              <th className="px-4 py-3">Maximum</th>
              <th className="px-4 py-3">Marks</th>
              <th className="px-4 py-3">Flag</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bands.map((band, index) => (
              <tr key={index}>
                <td className="px-4 py-3">
                  <NumericInput
                    value={band.minimum}
                    min={0}
                    onChange={(value) => updateBand(index, { minimum: value ?? 0 })}
                    className="h-9 w-28 border border-slate-200 px-3 outline-none focus:border-brand-blue"
                  />
                </td>
                <td className="px-4 py-3">
                  <NumericInput
                    value={band.maximum}
                    placeholder="No limit"
                    min={0}
                    onChange={(value) => updateBand(index, { maximum: value })}
                    className="h-9 w-28 border border-slate-200 px-3 outline-none focus:border-brand-blue"
                  />
                </td>
                <td className="px-4 py-3">
                  <NumericInput
                    value={band.score}
                    min={0}
                    max={maximumScore}
                    onChange={(value) => updateBand(index, { score: value ?? 0 })}
                    className="h-9 w-24 border border-slate-200 px-3 outline-none focus:border-brand-blue"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={Boolean(band.isFlagged)}
                    onChange={(event) => updateBand(index, { isFlagged: event.target.checked })}
                    className="h-4 w-4 accent-brand-blue"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onChange(bands.filter((_, i) => i !== index))}
                    className="inline-flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete row"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NamedScoresEditor({
  title,
  maximumScore,
  rows,
  onChange,
}: {
  title: string;
  maximumScore: number;
  rows: CriteriaNamedScore[];
  onChange: (rows: CriteriaNamedScore[]) => void;
}) {
  const updateRow = (index: number, patch: Partial<CriteriaNamedScore>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <div className="border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <h4 className="text-sm font-bold text-brand-slate">{title}</h4>
        <p className="mt-1 text-xs text-slate-400">Marks must be between 0 and {maximumScore}.</p>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map((row, index) => (
          <div key={row.key} className="grid gap-3 px-4 py-3 md:grid-cols-[1fr_120px]">
            <input
              value={row.label}
              onChange={(event) => updateRow(index, { label: event.target.value })}
              className="h-10 border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue"
            />
            <NumericInput
              value={row.score}
              min={0}
              max={maximumScore}
              onChange={(value) => updateRow(index, { score: value ?? 0 })}
              className="h-10 border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionTotal({
  label,
  maximum,
  parts,
}: {
  label: string;
  maximum: number;
  parts: number[];
}) {
  const total = sum(parts);
  const ok = total === maximum;
  return (
    <div className={cn(
      "flex items-center justify-between gap-4 border px-4 py-3 text-sm",
      ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700",
    )}>
      <span className="font-bold">{label}</span>
      <span className="font-bold">{total} / {maximum}</span>
    </div>
  );
}

function CriteriaSummary({ criteria }: { criteria: RankingCriteriaConfig }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <ReadOnlyList
        title="Core sections"
        rows={[
          { label: "Academic Performance", value: criteria.academic.maximumScore },
          { label: "Family Background", value: criteria.familyBackground.maximumScore },
          { label: "Education Background", value: criteria.educationBackground.maximumScore },
          { label: "Data Integrity", value: criteria.integrityCheck.maximumScore },
          { label: "Disability", value: criteria.disability.maximumScore },
          { label: "Total", value: sum([
            criteria.academic.maximumScore,
            criteria.familyBackground.maximumScore,
            criteria.educationBackground.maximumScore,
            criteria.integrityCheck.maximumScore,
            criteria.disability.maximumScore,
          ]) },
        ]}
      />
      <ReadOnlyList
        title="Family sub-sections"
        rows={[
          { label: "Parent status", value: criteria.familyBackground.parentStatusMaximum },
          { label: "Monthly income", value: criteria.familyBackground.monthlyIncomeMaximum },
          { label: "Number of dependents", value: criteria.familyBackground.siblingMaximum },
          { label: "Education burden", value: criteria.familyBackground.educationBurdenMaximum },
        ]}
      />
      <ReadOnlyList
        title="Education background sub-sections"
        rows={[
          { label: "Primary fees", value: criteria.educationBackground.primaryFeeMaximum },
          { label: "Secondary fees", value: criteria.educationBackground.secondaryFeeMaximum },
          { label: "Funding source", value: criteria.educationBackground.fundingMaximum },
        ]}
      />
      <ReadOnlyList
        title="Data integrity sub-sections"
        rows={[
          { label: "Registration number", value: criteria.integrityCheck.registrationNumberScore },
          { label: "National ID", value: criteria.integrityCheck.nationalIdScore },
          { label: "Parent ID", value: criteria.integrityCheck.parentIdScore },
          { label: "Death verification", value: criteria.integrityCheck.deathVerificationScore },
          { label: "Required documents", value: criteria.integrityCheck.requiredDocumentsScore },
        ]}
      />
    </div>
  );
}

export function Criteria() {
  const [data, setData] = useState<RankingCriteriaResponse | null>(null);
  const [mode, setMode] = useState<ViewMode>("default");
  const [editing, setEditing] = useState<RankingCriteriaConfig | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [activateOnSave, setActivateOnSave] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [allocationNotice, setAllocationNotice] = useState("");

  const loadCriteria = async () => {
    setLoading(true);
    try {
      const response = await getRankingCriteria();
      setData(response);
      setEditing(cloneCriteria(response.defaultCriteria.criteria));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load criteria.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCriteria();
  }, []);

  const validationMessages = useMemo(() => {
    if (!editing) return [];
    const messages: string[] = [];
    const overallTotal = sum([
      editing.academic.maximumScore,
      editing.familyBackground.maximumScore,
      editing.educationBackground.maximumScore,
      editing.integrityCheck.maximumScore,
      editing.disability.maximumScore,
    ]);
    const familyTotal = sum([
      editing.familyBackground.parentStatusMaximum,
      editing.familyBackground.monthlyIncomeMaximum,
      editing.familyBackground.siblingMaximum,
      editing.familyBackground.educationBurdenMaximum,
    ]);
    const educationTotal = sum([
      editing.educationBackground.primaryFeeMaximum,
      editing.educationBackground.secondaryFeeMaximum,
      editing.educationBackground.fundingMaximum,
    ]);
    const integrityTotal = sum([
      editing.integrityCheck.registrationNumberScore,
      editing.integrityCheck.nationalIdScore,
      editing.integrityCheck.parentIdScore,
      editing.integrityCheck.deathVerificationScore,
      editing.integrityCheck.requiredDocumentsScore,
    ]);

    if (overallTotal !== 100) messages.push(`Main section maximums must add up to 100. They currently add to ${overallTotal}.`);
    if (familyTotal !== editing.familyBackground.maximumScore) messages.push("Family sub-sections must add back to the family maximum.");
    if (educationTotal !== editing.educationBackground.maximumScore) messages.push("Education sub-sections must add back to the education maximum.");
    if (integrityTotal !== editing.integrityCheck.maximumScore) messages.push("Data integrity sub-sections must add back to the integrity maximum.");
    if (editing.disability.disabilityScore !== editing.disability.maximumScore) messages.push("Disability score must match the disability maximum.");
    if (editing.disability.noDisabilityScore !== 0) messages.push("No disability score must remain 0.");
    if (editing.academic.minimumPassingScore > editing.academic.maximumScore) messages.push("Academic minimum passing score cannot exceed academic maximum.");

    return messages;
  }, [editing]);

  const updateEditing = (patch: Partial<RankingCriteriaConfig>) => {
    setEditing((current) => current ? { ...current, ...patch } : current);
  };

  const sectionMaximumTotal = editing
    ? sum([
        editing.academic.maximumScore,
        editing.familyBackground.maximumScore,
        editing.educationBackground.maximumScore,
        editing.integrityCheck.maximumScore,
        editing.disability.maximumScore,
      ])
    : 100;

  const updateSectionMaximum = (
    section: keyof RankingCriteriaConfig,
    maximumScore: number,
  ) => {
    setEditing((current) => {
      if (!current) return current;
      if (maximumScore === 0) {
        if (section === "academic") {
          return {
            ...current,
            academic: {
              ...current.academic,
              maximumScore: 0,
              minimumPassingScore: 0,
            },
          };
        }

        if (section === "familyBackground") {
          return {
            ...current,
            familyBackground: {
              ...current.familyBackground,
              maximumScore: 0,
              parentStatusMaximum: 0,
              monthlyIncomeMaximum: 0,
              siblingMaximum: 0,
              educationBurdenMaximum: 0,
              parentStatusScores: zeroNamedScores(current.familyBackground.parentStatusScores),
              incomeBands: zeroBands(current.familyBackground.incomeBands),
              siblingBands: zeroBands(current.familyBackground.siblingBands),
              educationBurdenBands: zeroBands(current.familyBackground.educationBurdenBands),
            },
          };
        }

        if (section === "educationBackground") {
          return {
            ...current,
            educationBackground: {
              ...current.educationBackground,
              maximumScore: 0,
              primaryFeeMaximum: 0,
              secondaryFeeMaximum: 0,
              fundingMaximum: 0,
              primaryFeeBands: zeroBands(current.educationBackground.primaryFeeBands),
              secondaryFeeBands: zeroBands(current.educationBackground.secondaryFeeBands),
              fundingScores: zeroNamedScores(current.educationBackground.fundingScores),
            },
          };
        }

        if (section === "integrityCheck") {
          return {
            ...current,
            integrityCheck: {
              ...current.integrityCheck,
              maximumScore: 0,
              registrationNumberScore: 0,
              nationalIdScore: 0,
              parentIdScore: 0,
              deathVerificationScore: 0,
              requiredDocumentsScore: 0,
            },
          };
        }

        if (section === "disability") {
          return {
            ...current,
            disability: {
              ...current.disability,
              maximumScore: 0,
              disabilityScore: 0,
              noDisabilityScore: 0,
            },
          };
        }
      }

      return {
        ...current,
        [section]: {
          ...current[section],
          maximumScore,
        },
      };
    });
    setAllocationNotice(
      maximumScore === 0
        ? "Main section maximum set to 0. All marks inside that section were also set to 0."
        : "Main section maximum changed. Adjust the other section maximums so all sections add up to 100.",
    );
  };

  const updateFamilySubMaximum = (
    key: "parentStatusMaximum" | "monthlyIncomeMaximum" | "siblingMaximum" | "educationBurdenMaximum",
    maximumScore: number,
    notice: string,
  ) => {
    setEditing((current) => {
      if (!current) return current;
      const familyBackground = { ...current.familyBackground, [key]: maximumScore };

      if (key === "parentStatusMaximum") {
        familyBackground.parentStatusScores = prioritizeNamedScores(familyBackground.parentStatusScores, maximumScore);
      }
      if (key === "monthlyIncomeMaximum") {
        familyBackground.incomeBands = prioritizeBands(familyBackground.incomeBands, maximumScore);
      }
      if (key === "siblingMaximum") {
        familyBackground.siblingBands = prioritizeBands(familyBackground.siblingBands, maximumScore);
      }
      if (key === "educationBurdenMaximum") {
        familyBackground.educationBurdenBands = prioritizeBands(familyBackground.educationBurdenBands, maximumScore);
      }

      return { ...current, familyBackground };
    });
    setAllocationNotice(notice);
  };

  const updateEducationSubMaximum = (
    key: "primaryFeeMaximum" | "secondaryFeeMaximum" | "fundingMaximum",
    maximumScore: number,
    notice: string,
  ) => {
    setEditing((current) => {
      if (!current) return current;
      const educationBackground = { ...current.educationBackground, [key]: maximumScore };

      if (key === "primaryFeeMaximum") {
        educationBackground.primaryFeeBands = prioritizeBands(educationBackground.primaryFeeBands, maximumScore);
      }
      if (key === "secondaryFeeMaximum") {
        educationBackground.secondaryFeeBands = prioritizeBands(educationBackground.secondaryFeeBands, maximumScore);
      }
      if (key === "fundingMaximum") {
        educationBackground.fundingScores = prioritizeNamedScores(educationBackground.fundingScores, maximumScore);
      }

      return { ...current, educationBackground };
    });
    setAllocationNotice(notice);
  };

  const updateIntegritySubMaximum = (
    key: keyof RankingCriteriaConfig["integrityCheck"],
    maximumScore: number,
    notice: string,
  ) => {
    setEditing((current) => {
      if (!current) return current;
      return {
        ...current,
        integrityCheck: {
          ...current.integrityCheck,
          [key]: maximumScore,
        },
      };
    });
    setAllocationNotice(notice);
  };

  const updateDisabilityMaximum = (maximumScore: number) => {
    setEditing((current) => current ? {
      ...current,
      disability: {
        ...current.disability,
        maximumScore,
        disabilityScore: maximumScore,
        noDisabilityScore: 0,
      },
    } : current);
    setAllocationNotice("Disability maximum changed. Adjust the other section maximums so all sections add up to 100.");
  };

  const applyTemplateForEditing = (template: RankingCriteriaTemplate) => {
    setEditing(cloneCriteria(template.criteria));
    setTemplateName(`${template.name} copy`);
    setMode("custom");
  };

  const startNewTemplate = () => {
    if (!data) return;
    setEditing(cloneCriteria(data.defaultCriteria.criteria));
    setTemplateName("");
    setActivateOnSave(true);
    setAllocationNotice("New custom template started from the default criteria.");
    setError("");
    setMessage("");
    setMode("custom");
  };

  const saveTemplate = async () => {
    if (!editing) return;
    if (!templateName.trim()) {
      setError("Template name is required.");
      return;
    }
    if (validationMessages.length > 0) {
      setError(validationMessages[0]);
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    try {
      await saveRankingCriteriaTemplate({
        name: templateName.trim(),
        criteria: editing,
        activate: activateOnSave,
      });
      setTemplateName("");
      setMessage("Criteria template saved.");
      await loadCriteria();
      setMode("custom");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save criteria template.");
    } finally {
      setSaving(false);
    }
  };

  const activateTemplate = async (template: RankingCriteriaTemplate) => {
    setError("");
    setMessage("");
    await activateRankingCriteriaTemplate(template.id);
    setMessage(`${template.name} is now active.`);
    await loadCriteria();
  };

  const activateDefault = async () => {
    setError("");
    setMessage("");
    await activateDefaultRankingCriteria();
    setMessage("Default criteria is now active.");
    await loadCriteria();
  };

  const removeTemplate = async (template: RankingCriteriaTemplate) => {
    const confirmed = window.confirm(`Delete ${template.name}?`);
    if (!confirmed) return;
    await deleteRankingCriteriaTemplate(template.id);
    await loadCriteria();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500">
        <Loader2 size={18} className="animate-spin" />
        Loading ranking criteria...
      </div>
    );
  }

  if (!data || !editing) {
    return <div className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error || "Criteria data is unavailable."}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/scorecriteria.png" alt="Criteria" className="h-9 w-9 object-contain" />
            <h1 className="text-2xl font-display font-bold text-brand-slate tracking-tight">Criteria</h1>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            View the current ranking allocation and save up to five custom scoring templates.
          </p>
        </div>
        <div className="flex border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setMode("default")}
            className={cn("px-4 py-2 text-sm font-bold", mode === "default" ? "bg-brand-blue text-white" : "text-slate-500 hover:text-brand-blue")}
          >
            Default
          </button>
          <button
            type="button"
            onClick={() => setMode("custom")}
            className={cn("px-4 py-2 text-sm font-bold", mode === "custom" ? "bg-brand-blue text-white" : "text-slate-500 hover:text-brand-blue")}
          >
            Custom Criteria
          </button>
        </div>
      </div>

      {error && <div className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}
      {message && <div className="border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">{message}</div>}
      {mode === "custom" && allocationNotice && (
        <div className="border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          {allocationNotice}
        </div>
      )}

      {mode === "default" ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border border-slate-200 bg-white px-5 py-4">
            <div>
              <h2 className="font-bold text-brand-slate">Default ranking criteria</h2>
              <p className="mt-1 text-xs text-slate-400">These values mirror the current backend scoring rules.</p>
            </div>
            <button
              type="button"
              onClick={() => void activateDefault()}
              className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition-colors hover:border-brand-blue hover:text-brand-blue"
            >
              {data.defaultCriteria.isActive && <Check size={14} />}
              {data.defaultCriteria.isActive ? "Active" : "Use default"}
            </button>
          </div>
          <CriteriaSummary criteria={data.defaultCriteria.criteria} />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <section className="border border-slate-200 bg-white p-5">
              <h2 className="font-bold text-brand-slate flex items-center gap-2">
                Academic Performance
                <InfoTooltip text="GPA thresholds and score boundaries for evaluating student academic performance based on Grade Point Average and minimum passing marks." />
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-4">
                <NumberField label="Maximum" value={editing.academic.maximumScore} onChange={(value) => updateSectionMaximum("academic", value ?? 0)} />
                <NumberField label="Minimum GPA" value={editing.academic.minimumGpa} onChange={(value) => updateEditing({ academic: { ...editing.academic, minimumGpa: value ?? 0 } })} />
                <NumberField label="Maximum GPA" value={editing.academic.maximumGpa} onChange={(value) => updateEditing({ academic: { ...editing.academic, maximumGpa: value ?? 0 } })} />
                <NumberField label="Minimum mark" value={editing.academic.minimumPassingScore} onChange={(value) => updateEditing({ academic: { ...editing.academic, minimumPassingScore: value ?? 0 } })} />
              </div>
              <div className="mt-4">
                <SectionMaximumNotice total={sectionMaximumTotal} />
              </div>
            </section>

            <section className="space-y-4 border border-slate-200 bg-white p-5">
              <h2 className="font-bold text-brand-slate flex items-center gap-2">
                Family Background
                <InfoTooltip text="Evaluates family circumstances including parent status, monthly household income, number of dependents, and education burden (number of dependents in school)." />
              </h2>
              <div className="grid gap-4 md:grid-cols-5">
                <NumberField label="Maximum" value={editing.familyBackground.maximumScore} onChange={(value) => updateSectionMaximum("familyBackground", value ?? 0)} />
                <NumberField label="Parent status" value={editing.familyBackground.parentStatusMaximum} onChange={(value) => updateFamilySubMaximum("parentStatusMaximum", value ?? 0, "Change the parent-status marks table. The highest-priority row receives this maximum and the other rows are set to 0.")} />
                <NumberField label="Income" value={editing.familyBackground.monthlyIncomeMaximum} onChange={(value) => updateFamilySubMaximum("monthlyIncomeMaximum", value ?? 0, "Change the monthly income ranges table. The highest-priority range receives this maximum and the other ranges are set to 0.")} />
                <NumberField label="Dependents" value={editing.familyBackground.siblingMaximum} onChange={(value) => updateFamilySubMaximum("siblingMaximum", value ?? 0, "Change the number of dependents ranges table. The highest-priority range receives this maximum and the other ranges are set to 0.")} />
                <label className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Edu burden</span>
                    <InfoTooltip text="Assess how siblings' education affects the distribution of funds within the family." />
                  </div>
                  <NumericInput
                    value={editing.familyBackground.educationBurdenMaximum}
                    min={0}
                    onChange={(value) => updateFamilySubMaximum("educationBurdenMaximum", value ?? 0, "Change the education burden ranges table. The highest-priority range receives this maximum and the other ranges are set to 0.")}
                    className="h-10 w-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-brand-blue"
                  />
                </label>
              </div>
              <SectionMaximumNotice total={sectionMaximumTotal} />
              <SectionTotal label="Family allocation" maximum={editing.familyBackground.maximumScore} parts={[
                editing.familyBackground.parentStatusMaximum,
                editing.familyBackground.monthlyIncomeMaximum,
                editing.familyBackground.siblingMaximum,
                editing.familyBackground.educationBurdenMaximum,
              ]} />
              <NamedScoresEditor title="Parent status marks" maximumScore={editing.familyBackground.parentStatusMaximum} rows={editing.familyBackground.parentStatusScores} onChange={(rows) => updateEditing({ familyBackground: { ...editing.familyBackground, parentStatusScores: rows } })} />
              <BandsTable title="Monthly income ranges" maximumScore={editing.familyBackground.monthlyIncomeMaximum} bands={editing.familyBackground.incomeBands} onChange={(bands) => updateEditing({ familyBackground: { ...editing.familyBackground, incomeBands: bands } })} />
              <BandsTable title="Number of dependents" maximumScore={editing.familyBackground.siblingMaximum} bands={editing.familyBackground.siblingBands} onChange={(bands) => updateEditing({ familyBackground: { ...editing.familyBackground, siblingBands: bands } })} />
              <BandsTable
                title={
                  <div className="flex items-center gap-2">
                    <span>Education burden weighted total</span>
                    <InfoTooltip text={"Asses how siblings' education affects the distribution of expenses within the family"} />
                  </div>
                }
                maximumScore={editing.familyBackground.educationBurdenMaximum}
                bands={editing.familyBackground.educationBurdenBands}
                onChange={(bands) => updateEditing({ familyBackground: { ...editing.familyBackground, educationBurdenBands: bands } })}
              />
            </section>

            <section className="space-y-4 border border-slate-200 bg-white p-5">
              <h2 className="font-bold text-brand-slate flex items-center gap-2">
                Education Background
                <InfoTooltip text="Assesses student education history including primary school fees paid, secondary school fees paid, and source of funding (personal, government, sponsor, etc.)." />
              </h2>
              <div className="grid gap-4 md:grid-cols-4">
                <NumberField label="Maximum" value={editing.educationBackground.maximumScore} onChange={(value) => updateSectionMaximum("educationBackground", value ?? 0)} />
                <NumberField label="Primary fees" value={editing.educationBackground.primaryFeeMaximum} onChange={(value) => updateEducationSubMaximum("primaryFeeMaximum", value ?? 0, "Change the primary fee ranges table. The highest-priority range receives this maximum and the other ranges are set to 0.")} />
                <NumberField label="Secondary fees" value={editing.educationBackground.secondaryFeeMaximum} onChange={(value) => updateEducationSubMaximum("secondaryFeeMaximum", value ?? 0, "Change the secondary fee ranges table. The highest-priority range receives this maximum and the other ranges are set to 0.")} />
                <NumberField label="Funding" value={editing.educationBackground.fundingMaximum} onChange={(value) => updateEducationSubMaximum("fundingMaximum", value ?? 0, "Change the funding source marks table. The highest-priority row receives this maximum and the other rows are set to 0.")} />
              </div>
              <SectionMaximumNotice total={sectionMaximumTotal} />
              <SectionTotal label="Education allocation" maximum={editing.educationBackground.maximumScore} parts={[
                editing.educationBackground.primaryFeeMaximum,
                editing.educationBackground.secondaryFeeMaximum,
                editing.educationBackground.fundingMaximum,
              ]} />
              <BandsTable title="Primary fee ranges" maximumScore={editing.educationBackground.primaryFeeMaximum} bands={editing.educationBackground.primaryFeeBands} onChange={(bands) => updateEditing({ educationBackground: { ...editing.educationBackground, primaryFeeBands: bands } })} />
              <BandsTable title="Secondary fee ranges" maximumScore={editing.educationBackground.secondaryFeeMaximum} bands={editing.educationBackground.secondaryFeeBands} onChange={(bands) => updateEditing({ educationBackground: { ...editing.educationBackground, secondaryFeeBands: bands } })} />
              <NamedScoresEditor title="Funding source marks" maximumScore={editing.educationBackground.fundingMaximum} rows={editing.educationBackground.fundingScores} onChange={(rows) => updateEditing({ educationBackground: { ...editing.educationBackground, fundingScores: rows } })} />
            </section>

            <section className="space-y-4 border border-slate-200 bg-white p-5">
              <h2 className="font-bold text-brand-slate flex items-center gap-2">
                Data Integrity
                <InfoTooltip text="Verifies authenticity and accuracy of submitted documents: registration number, national ID, parent ID, death verification, and required supporting documents." />
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <NumberField label="Maximum" value={editing.integrityCheck.maximumScore} onChange={(value) => updateSectionMaximum("integrityCheck", value ?? 0)} />
                <NumberField label="Registration" value={editing.integrityCheck.registrationNumberScore} onChange={(value) => updateIntegritySubMaximum("registrationNumberScore", value ?? 0, "Change registration number integrity marks. Keep the integrity sub-sections balanced to the data integrity maximum.")} />
                <NumberField label="National ID" value={editing.integrityCheck.nationalIdScore} onChange={(value) => updateIntegritySubMaximum("nationalIdScore", value ?? 0, "Change national ID integrity marks. Keep the integrity sub-sections balanced to the data integrity maximum.")} />
                <NumberField label="Parent ID" value={editing.integrityCheck.parentIdScore} onChange={(value) => updateIntegritySubMaximum("parentIdScore", value ?? 0, "Change parent ID integrity marks. Keep the integrity sub-sections balanced to the data integrity maximum.")} />
                <NumberField label="Death check" value={editing.integrityCheck.deathVerificationScore} onChange={(value) => updateIntegritySubMaximum("deathVerificationScore", value ?? 0, "Change death verification marks. Keep the integrity sub-sections balanced to the data integrity maximum.")} />
                <NumberField label="Documents" value={editing.integrityCheck.requiredDocumentsScore} onChange={(value) => updateIntegritySubMaximum("requiredDocumentsScore", value ?? 0, "Change required documents marks. Keep the integrity sub-sections balanced to the data integrity maximum.")} />
              </div>
              <SectionMaximumNotice total={sectionMaximumTotal} />
              <SectionTotal label="Integrity allocation" maximum={editing.integrityCheck.maximumScore} parts={[
                editing.integrityCheck.registrationNumberScore,
                editing.integrityCheck.nationalIdScore,
                editing.integrityCheck.parentIdScore,
                editing.integrityCheck.deathVerificationScore,
                editing.integrityCheck.requiredDocumentsScore,
              ]} />
            </section>

            <section className="space-y-4 border border-slate-200 bg-white p-5">
              <h2 className="font-bold text-brand-slate flex items-center gap-2">
                Disability
                <InfoTooltip text="Awards bonus marks to students with registered disabilities to provide additional support and recognize their circumstances." />
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <NumberField label="Maximum" value={editing.disability.maximumScore} onChange={(value) => updateDisabilityMaximum(value ?? 0)} />
                <NumberField label="Has disability" value={editing.disability.disabilityScore} onChange={(value) => updateEditing({ disability: { ...editing.disability, disabilityScore: value ?? 0 } })} />
                <NumberField label="No disability" value={editing.disability.noDisabilityScore} onChange={(value) => updateEditing({ disability: { ...editing.disability, noDisabilityScore: value ?? 0 } })} />
              </div>
              <SectionMaximumNotice total={sectionMaximumTotal} />
            </section>
          </div>

          <aside className="space-y-5">
            <div className="border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-brand-slate">Save template</h3>
                  <p className="mt-1 text-xs text-slate-400">{data.templates.length} / {data.limit} custom templates saved.</p>
                </div>
                <button
                  type="button"
                  onClick={startNewTemplate}
                  disabled={data.templates.length >= data.limit}
                  className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:border-brand-blue hover:text-brand-blue disabled:opacity-50"
                >
                  <Plus size={14} />
                  New
                </button>
              </div>
              <input
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
                placeholder="Template name"
                className="mt-4 h-11 w-full border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue"
              />
              <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={activateOnSave} onChange={(event) => setActivateOnSave(event.target.checked)} className="h-4 w-4 accent-brand-blue" />
                Activate after saving
              </label>
              {validationMessages.length > 0 && (
                <div className="mt-4 space-y-2">
                  {validationMessages.map((item) => (
                    <p key={item} className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{item}</p>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => void saveTemplate()}
                disabled={saving || data.templates.length >= data.limit || validationMessages.length > 0}
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 bg-brand-blue px-4 text-sm font-bold text-white transition-colors hover:bg-brand-blueDark disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Template
              </button>
            </div>

            <div className="border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-5 py-4">
                <h3 className="font-bold text-brand-slate">Saved templates</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {data.templates.length === 0 ? (
                  <p className="px-5 py-5 text-sm text-slate-400">No custom templates saved yet.</p>
                ) : (
                  data.templates.map((template) => (
                    <div key={template.id} className="space-y-3 px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-brand-slate">{template.name}</p>
                          <p className="mt-1 text-xs text-slate-400">{template.isActive ? "Active" : "Inactive"}</p>
                        </div>
                        {template.isActive && <Check size={16} className="text-emerald-600" />}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => applyTemplateForEditing(template)} className="border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-brand-blue hover:text-brand-blue">
                          Edit copy
                        </button>
                        <button type="button" onClick={() => void activateTemplate(template)} className="border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-brand-blue hover:text-brand-blue">
                          Activate
                        </button>
                        <button type="button" onClick={() => void removeTemplate(template)} className="border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
