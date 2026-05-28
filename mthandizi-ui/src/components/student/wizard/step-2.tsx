"use client";
import { useApplicationStore } from "@/lib/store/use-application-store";
import { Input } from "@/components/ui/input";
import { MALAWI_TAS } from "@/lib/constants/malawi-data";
import { Upload, CheckCircle2, User, Users, HeartHandshake, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const selectClass = "wizard-select w-full h-14 rounded-none border border-slate-200 px-6 font-normal text-slate-800 outline-none appearance-none hover:border-brand-blue focus:border-brand-blue transition-colors";
const labelClass = "text-sm font-medium text-slate-700 mb-2 block";
const inputClass = "h-14 rounded-none border border-slate-200 px-6 font-normal text-slate-800 placeholder:font-light hover:border-brand-blue focus:border-brand-blue transition-colors";

function FileUploadField({ label, file, onChange }: { label: string; file: File | null; onChange: (f: File | null) => void }) {
  return (
    <div className="max-w-sm">
      <label className={labelClass}>{label}</label>
      <label className={cn(
        "border-2 border-dashed p-5 flex items-center gap-4 cursor-pointer transition-all",
        file ? "bg-emerald-50/30 border-emerald-100" : "bg-slate-50 border-slate-200 hover:border-brand-blue/30 hover:bg-white"
      )}>
        <div className={cn(
          "w-12 h-12 flex items-center justify-center shrink-0",
          file ? "bg-emerald-500 text-white" : "bg-white text-slate-400"
        )}>
          {file ? <CheckCircle2 size={22} /> : <Upload size={22} />}
        </div>
        <div className="min-w-0">
          <p className="font-black text-brand-slate text-sm truncate">{file ? file.name : "Click to upload"}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PDF or JPEG · Max 5MB</p>
        </div>
        <input type="file" accept=".pdf,.jpg,.jpeg" className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
      </label>
    </div>
  );
}

function SectionHeader({ title, icon: Icon }: { title: string; icon: any }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
      <div className="w-8 h-8 bg-brand-blue/10 flex items-center justify-center text-brand-blue">
        <Icon size={18} />
      </div>
      <h3 className="font-display font-bold text-brand-slate uppercase tracking-tight text-sm">{title}</h3>
    </div>
  );
}

function SiblingsSection() {
  const { data, updateFamily } = useApplicationStore();
  const f = data.family;

  const totalSiblings = parseInt(f.numberOfSiblings) || 0;
  const stillInSchool = parseInt(f.numberStillInSchool || "0") || 0;
  const inPrimary = parseInt(f.siblingsInPrimary || "0") || 0;
  const inSecondary = parseInt(f.siblingsInSecondary || "0") || 0;
  const inTertiary = parseInt(f.siblingsInTertiary || "0") || 0;

  const levelTotal = inPrimary + inSecondary + inTertiary;
  const remainingAfterPrimary = Math.max(0, stillInSchool - inPrimary);
  const remainingAfterSecondary = Math.max(0, remainingAfterPrimary - inSecondary);

  // When numberStillInSchool is 0 (or empty), level fields are not needed
  const noOneInSchool = f.numberOfSiblings !== "" && stillInSchool === 0;

  const schoolExceedsSiblings =
    f.numberStillInSchool !== "" && f.numberOfSiblings !== "" &&
    stillInSchool > totalSiblings;

  const levelExceedsSchool =
    !noOneInSchool && f.numberStillInSchool !== "" && levelTotal > stillInSchool;

  const errorClass = "border-red-400 focus:border-red-500";
  const hintClass = "text-xs font-normal text-red-500 mt-1";

  // When numberOfSiblings is entered, default numberStillInSchool to "0" if empty
  const handleSiblingsChange = (value: string) => {
    updateFamily({ numberOfSiblings: value });
    if (f.numberStillInSchool === "") {
      updateFamily({ numberStillInSchool: "0" });
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Siblings Information" icon={Users} />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className={labelClass}>Number of Siblings</label>
          <Input
            type="number"
            min="0"
            className={inputClass}
            value={f.numberOfSiblings}
            onChange={(e) => handleSiblingsChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Number Still in School</label>
          <Input
            type="number"
            min="0"
            className={cn(inputClass, schoolExceedsSiblings && errorClass)}
            value={f.numberStillInSchool}
            onChange={(e) => updateFamily({ numberStillInSchool: e.target.value })}
          />
          {schoolExceedsSiblings && (
            <p className={hintClass}>
              Cannot exceed number of siblings ({totalSiblings}).
            </p>
          )}
        </div>
      </div>

      <div className="border border-slate-100 bg-slate-50/70 p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-slate-700">Siblings Still in School by Level</p>
          {!noOneInSchool && f.numberStillInSchool !== "" && (
            <span className={cn(
              "text-xs font-normal px-2 py-1 border",
              levelExceedsSchool
                ? "border-red-200 bg-red-50 text-red-600"
                : levelTotal === stillInSchool && stillInSchool > 0
                  ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                  : "border-slate-200 bg-white text-slate-500"
            )}>
              {levelTotal} / {stillInSchool} allocated
            </span>
          )}
        </div>

        {noOneInSchool ? (
          <p className="text-xs font-normal text-slate-400 mb-4">
            No siblings are currently in school — the level breakdown defaults to 0. You can leave these blank.
          </p>
        ) : (
          levelExceedsSchool && (
            <p className={cn(hintClass, "mb-4")}>
              Total across levels ({levelTotal}) exceeds siblings still in school ({stillInSchool}).
            </p>
          )
        )}

        <div className={cn("grid md:grid-cols-3 gap-6", noOneInSchool && "opacity-40 pointer-events-none")}>
          <div className="space-y-2">
            <label className={labelClass}>Primary</label>
            <Input
              type="number"
              min="0"
              max={stillInSchool}
              className={cn(inputClass, !noOneInSchool && inPrimary > stillInSchool && errorClass)}
              value={noOneInSchool ? "0" : f.siblingsInPrimary}
              onChange={(e) => updateFamily({ siblingsInPrimary: e.target.value })}
              disabled={noOneInSchool}
            />
            {!noOneInSchool && f.numberStillInSchool !== "" && (
              <p className="text-[10px] font-normal text-slate-400">Max {stillInSchool}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Secondary</label>
            <Input
              type="number"
              min="0"
              max={remainingAfterPrimary}
              className={cn(inputClass, !noOneInSchool && inSecondary > remainingAfterPrimary && errorClass)}
              value={noOneInSchool ? "0" : f.siblingsInSecondary}
              onChange={(e) => updateFamily({ siblingsInSecondary: e.target.value })}
              disabled={noOneInSchool}
            />
            {!noOneInSchool && f.numberStillInSchool !== "" && (
              <p className="text-[10px] font-normal text-slate-400">Max {remainingAfterPrimary} remaining</p>
            )}
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Tertiary</label>
            <Input
              type="number"
              min="0"
              max={remainingAfterSecondary}
              className={cn(inputClass, !noOneInSchool && inTertiary > remainingAfterSecondary && errorClass)}
              value={noOneInSchool ? "0" : f.siblingsInTertiary}
              onChange={(e) => updateFamily({ siblingsInTertiary: e.target.value })}
              disabled={noOneInSchool}
            />
            {!noOneInSchool && f.numberStillInSchool !== "" && (
              <p className="text-[10px] font-normal text-slate-400">Max {remainingAfterSecondary} remaining</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Step2() {
  const { data, updateFamily } = useApplicationStore();
  const f = data.family;

  // Detect if the current condition's fields have any data filled —
  // if so, lock the dropdown to prevent switching and losing data.
  const bothHasData = !!(
    f.fatherFirstName || f.fatherSurname || f.fatherNationalId || f.fatherPhone ||
    f.motherFirstName || f.motherSurname || f.motherNationalId || f.motherPhone
  );
  const oneHasData = !!(
    f.parentFirstName || f.parentSurname || f.parentNationalId || f.parentPhone || f.deceasedParentId
  );
  const noneHasData = !!(
    f.guardianFirstName || f.guardianSurname || f.guardianNationalId || f.guardianPhone ||
    f.deceasedFatherId || f.deceasedMotherId
  );

  const isLocked =
    (f.parentalStatus === "both" && bothHasData) ||
    (f.parentalStatus === "one" && oneHasData) ||
    (f.parentalStatus === "none" && noneHasData);

  return (
    <div className="space-y-12">
      {/* 1. Parental Status Selection */}
      <div className="max-w-md">
        <label className={labelClass}>Household Parental Status</label>
        <div className="relative">
          <select
            className={cn(
              selectClass,
              isLocked && "opacity-60 cursor-not-allowed pointer-events-none bg-slate-50"
            )}
            value={f.parentalStatus}
            disabled={isLocked}
            onChange={(e) => updateFamily({ parentalStatus: e.target.value })}
          >
            <option value="">Select status</option>
            <option value="both">Both Parents Alive</option>
            <option value="one">One Parent Alive</option>
            <option value="none">None (Guardian / Next of Kin)</option>
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <Users size={16} />
          </div>
        </div>
        {isLocked && (
          <p className="text-xs font-normal text-slate-400 mt-2">
            Clear all fields in this section to change the parental status.
          </p>
        )}
      </div>

      {/* 2. Conditional Details Sections */}
      {f.parentalStatus === "both" && (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <SectionHeader title="Father's Information" icon={User} />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2"><label className={labelClass}>First Name</label><Input className={inputClass} value={f.fatherFirstName} onChange={(e) => updateFamily({ fatherFirstName: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>Surname</label><Input className={inputClass} value={f.fatherSurname} onChange={(e) => updateFamily({ fatherSurname: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>National ID</label><Input className={inputClass} placeholder="e.g. CZ29182" value={f.fatherNationalId} onChange={(e) => updateFamily({ fatherNationalId: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>Phone Number</label><Input className={inputClass} placeholder="099..." value={f.fatherPhone} onChange={(e) => updateFamily({ fatherPhone: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>Profession</label><Input className={inputClass} value={f.fatherProfession} onChange={(e) => updateFamily({ fatherProfession: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>Monthly Income</label><Input type="number" min="0" className={inputClass} value={f.fatherMonthlyIncome} onChange={(e) => updateFamily({ fatherMonthlyIncome: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>T/A (Traditional Authority)</label>
                <select className={selectClass} value={f.fatherTa} onChange={(e) => updateFamily({ fatherTa: e.target.value })}>
                  <option value="">Select T/A</option>
                  {MALAWI_TAS.map((t, i) => <option key={`fta-${i}`} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2"><label className={labelClass}>Residential Address</label><Input className={inputClass} value={f.fatherResidentialAddress} onChange={(e) => updateFamily({ fatherResidentialAddress: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>Postal Address</label><Input className={inputClass} value={f.fatherPostalAddress} onChange={(e) => updateFamily({ fatherPostalAddress: e.target.value })} /></div>
            </div>
          </div>

          <div>
            <SectionHeader title="Mother's Information" icon={User} />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2"><label className={labelClass}>First Name</label><Input className={inputClass} value={f.motherFirstName} onChange={(e) => updateFamily({ motherFirstName: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>Surname</label><Input className={inputClass} value={f.motherSurname} onChange={(e) => updateFamily({ motherSurname: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>National ID</label><Input className={inputClass} value={f.motherNationalId} onChange={(e) => updateFamily({ motherNationalId: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>Phone Number</label><Input className={inputClass} value={f.motherPhone} onChange={(e) => updateFamily({ motherPhone: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>Profession</label><Input className={inputClass} value={f.motherProfession} onChange={(e) => updateFamily({ motherProfession: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>Monthly Income</label><Input type="number" min="0" className={inputClass} value={f.motherMonthlyIncome} onChange={(e) => updateFamily({ motherMonthlyIncome: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>T/A</label>
                <select className={selectClass} value={f.motherTa} onChange={(e) => updateFamily({ motherTa: e.target.value })}>
                  <option value="">Select T/A</option>
                  {MALAWI_TAS.map((t, i) => <option key={`mta-${i}`} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2"><label className={labelClass}>Residential Address</label><Input className={inputClass} value={f.motherResidentialAddress} onChange={(e) => updateFamily({ motherResidentialAddress: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>Postal Address</label><Input className={inputClass} value={f.motherPostalAddress} onChange={(e) => updateFamily({ motherPostalAddress: e.target.value })} /></div>
            </div>
          </div>
        </div>
      )}

      {f.parentalStatus === "one" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <SectionHeader title="Living Parent Information" icon={User} />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2"><label className={labelClass}>First Name</label><Input className={inputClass} value={f.parentFirstName} onChange={(e) => updateFamily({ parentFirstName: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>Surname</label><Input className={inputClass} value={f.parentSurname} onChange={(e) => updateFamily({ parentSurname: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>National ID</label><Input className={inputClass} value={f.parentNationalId} onChange={(e) => updateFamily({ parentNationalId: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>Phone Number</label><Input className={inputClass} value={f.parentPhone} onChange={(e) => updateFamily({ parentPhone: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>Monthly Income</label><Input type="number" min="0" className={inputClass} value={f.parentMonthlyIncome} onChange={(e) => updateFamily({ parentMonthlyIncome: e.target.value })} /></div>
              <div className="space-y-2">
                <label className={labelClass}>Relationship</label>
                <select className={selectClass} value={f.studentRelationship} onChange={(e) => updateFamily({ studentRelationship: e.target.value })}>
                  <option value="">Select</option>
                  <option value="son">Father</option>
                  <option value="daughter">Mother</option>
                </select>
              </div>
              <div className="space-y-2"><label className={labelClass}>T/A</label>
                <select className={selectClass} value={f.parentTa} onChange={(e) => updateFamily({ parentTa: e.target.value })}>
                  <option value="">Select T/A</option>
                  {MALAWI_TAS.map((t, i) => <option key={`pta-${i}`} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2"><label className={labelClass}>Residential Address</label><Input className={inputClass} value={f.parentResidentialAddress} onChange={(e) => updateFamily({ parentResidentialAddress: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>Postal Address</label><Input className={inputClass} value={f.parentPostalAddress} onChange={(e) => updateFamily({ parentPostalAddress: e.target.value })} /></div>
            </div>
          </div>
          <div className="max-w-md p-6 bg-slate-50 border border-slate-100">
            <label className={labelClass}>National ID of Deceased Parent</label>
            <Input className={inputClass} placeholder="Enter National ID" value={f.deceasedParentId} onChange={(e) => updateFamily({ deceasedParentId: e.target.value })} />
          </div>
        </div>
      )}

      {f.parentalStatus === "none" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <SectionHeader title="Guardian / Next of Kin Information" icon={HeartHandshake} />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2"><label className={labelClass}>Guardian First Name</label><Input className={inputClass} value={f.guardianFirstName} onChange={(e) => updateFamily({ guardianFirstName: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>Guardian Surname</label><Input className={inputClass} value={f.guardianSurname} onChange={(e) => updateFamily({ guardianSurname: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>National ID</label><Input className={inputClass} value={f.guardianNationalId} onChange={(e) => updateFamily({ guardianNationalId: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>Phone Number</label><Input className={inputClass} value={f.guardianPhone} onChange={(e) => updateFamily({ guardianPhone: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>Monthly Income</label><Input type="number" min="0" className={inputClass} value={f.guardianMonthlyIncome} onChange={(e) => updateFamily({ guardianMonthlyIncome: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>Relationship</label><Input className={inputClass} placeholder="e.g uncle" value={f.relationshipToGuardian} onChange={(e) => updateFamily({ relationshipToGuardian: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>T/A</label>
                <select className={selectClass} value={f.guardianTa} onChange={(e) => updateFamily({ guardianTa: e.target.value })}>
                  <option value="">Select T/A</option>
                  {MALAWI_TAS.map((t, i) => <option key={`gta-${i}`} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2"><label className={labelClass}>Residential Address</label><Input className={inputClass} value={f.guardianResidentialAddress} onChange={(e) => updateFamily({ guardianResidentialAddress: e.target.value })} /></div>
              <div className="space-y-2"><label className={labelClass}>Postal Address</label><Input className={inputClass} value={f.guardianPostalAddress} onChange={(e) => updateFamily({ guardianPostalAddress: e.target.value })} /></div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 p-6 bg-slate-50 border border-slate-100">
            <div className="space-y-2">
              <label className={labelClass}>Deceased Father National ID</label>
              <Input className={inputClass} value={f.deceasedFatherId} onChange={(e) => updateFamily({ deceasedFatherId: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Deceased Mother National ID</label>
              <Input className={inputClass} value={f.deceasedMotherId} onChange={(e) => updateFamily({ deceasedMotherId: e.target.value })} />
            </div>
          </div>
        </div>
      )}

      <SiblingsSection />

      {/* 3. Document Upload Section (Guarantor Only) */}
      {f.parentalStatus && (
        <div className="pt-10 border-t border-slate-100">
          <SectionHeader title="Required Documentation" icon={Upload} />
          <FileUploadField 
            label="Guarantor Consent Form" 
            file={f.guarantorConsentFile} 
            onChange={(file) => updateFamily({ guarantorConsentFile: file })} 
          />
          <div className="mt-8 flex items-start gap-3 p-5 bg-brand-blue/5 border border-brand-blue/10">
            <Mail className="text-brand-blue mt-0.5 shrink-0" size={16} />
            <p className="text-[10px] text-brand-blue font-bold uppercase tracking-wide leading-relaxed">
              Verify that the National IDs for deceased records and living guardians are accurate. 
             
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
