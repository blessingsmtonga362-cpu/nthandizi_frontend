"use client";
import { useApplicationStore } from "@/lib/store/use-application-store";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MALAWI_DISTRICTS, MALAWI_TAS } from "@/lib/constants/malawi-data";
import { motion, AnimatePresence } from "framer-motion";

const selectClass = "wizard-select w-full h-14 rounded-none border border-slate-200 px-6 font-normal text-slate-800 outline-none appearance-none hover:border-brand-blue focus:border-brand-blue transition-colors";
const labelClass = "text-sm font-medium text-slate-700 mb-2 block";
const inputClass = "h-14 rounded-none border border-slate-200 px-6 font-normal text-slate-800 placeholder:font-light hover:border-brand-blue focus:border-brand-blue transition-colors [background-color:#F7F5F2]";

const PAYMENT_METHODS = [
  { value: "airtel", label: "Airtel Money", type: "mobile" },
  { value: "tnm", label: "TNM Mpamba", type: "mobile" },
  { value: "national", label: "National Bank", type: "bank" },
  { value: "standard", label: "Standard Bank", type: "bank" },
];

export default function Step1() {
  const { data, updatePersonal, updatePayment } = useApplicationStore();
  const p = data.personal;
  const pay = data.payment;

  const selected = PAYMENT_METHODS.find((m) => m.value === pay.paymentMethod);
  const isMobile = selected?.type === "mobile";
  const isBank = selected?.type === "bank";

  return (
    <div className="space-y-10">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className={labelClass}>First Name</label>
          <Input className={inputClass} placeholder="John" value={p.firstName} onChange={(e) => updatePersonal({ firstName: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Surname</label>
          <Input className={inputClass} placeholder="Doe" value={p.surname} onChange={(e) => updatePersonal({ surname: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Phone Number</label>
          <Input className={inputClass} placeholder="+265 999 000 000" value={p.phoneNumber} onChange={(e) => updatePersonal({ phoneNumber: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>National ID Number</label>
          <Input className={inputClass} placeholder="e.g. ABC12345678" value={p.nationalId} onChange={(e) => updatePersonal({ nationalId: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Home District</label>
          <select className={selectClass} value={p.homeDistrict} onChange={(e) => updatePersonal({ homeDistrict: e.target.value })}>
            <option value="">Select District</option>
            {MALAWI_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className={labelClass}>T/A (Traditional Authority)</label>
          <select className={selectClass} value={p.ta} onChange={(e) => updatePersonal({ ta: e.target.value })}>
            <option value="">Select T/A</option>
            {MALAWI_TAS.map((t, i) => <option key={`ta-${i}`} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className={labelClass}>Physical Address</label>
          <Input className={inputClass} placeholder="e.g. Area 25, Lilongwe" value={p.physicalAddress} onChange={(e) => updatePersonal({ physicalAddress: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Date of Birth</label>
          <div className="relative">
            <Input
              type="date"
              className={cn(inputClass, "pr-4 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-4 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer")}
              value={p.dateOfBirth}
              onChange={(e) => updatePersonal({ dateOfBirth: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Registration Number</label>
          <Input className={inputClass} placeholder="e.g. BSC-COM-14-21" value={p.registrationNumber} onChange={(e) => updatePersonal({ registrationNumber: e.target.value })} />
        </div>

        {/* Marital Status */}
        <div className="space-y-3">
          <label className={labelClass}>Marital Status</label>
          <div className="flex flex-wrap gap-6">
            {["Single", "Married", "Divorced"].map((s) => (
              <button key={s} type="button" onClick={() => updatePersonal({ maritalStatus: s })}
                className="flex items-center gap-2.5 group focus:outline-none">
                <span className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                  p.maritalStatus === s ? "border-brand-blue" : "border-slate-300 group-hover:border-slate-400"
                )}>
                  {p.maritalStatus === s && <span className="w-2.5 h-2.5 rounded-full bg-brand-blue block" />}
                </span>
                <span className={cn("text-sm font-bold transition-colors",
                  p.maritalStatus === s ? "text-brand-blue" : "text-slate-500 group-hover:text-slate-700"
                )}>{s}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-3">
          <label className={labelClass}>Gender</label>
          <div className="flex gap-6">
            {["Male", "Female"].map((g) => (
              <button key={g} type="button" onClick={() => updatePersonal({ gender: g })}
                className="flex items-center gap-2.5 group focus:outline-none">
                <span className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                  p.gender === g ? "border-brand-blue" : "border-slate-300 group-hover:border-slate-400"
                )}>
                  {p.gender === g && <span className="w-2.5 h-2.5 rounded-full bg-brand-blue block" />}
                </span>
                <span className={cn("text-sm font-bold transition-colors",
                  p.gender === g ? "text-brand-blue" : "text-slate-500 group-hover:text-slate-700"
                )}>{g}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Disability */}
        <div className="space-y-2 md:col-span-2">
          <label className={labelClass}>Disability (leave as "None" if not applicable)</label>
          <Input className={inputClass} placeholder="None" value={p.disability} onChange={(e) => updatePersonal({ disability: e.target.value })} />
        </div>
      </div>

      {/* Payment Details */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-slate-700">Payment Details</p>
        <div className="space-y-2">
          <label className={labelClass}>Payment Method</label>
          <select
            className={selectClass}
            value={pay.paymentMethod}
            onChange={(e) => updatePayment({ paymentMethod: e.target.value, phoneNumber: "", accountName: "", accountNumber: "" })}
          >
            <option value="">Choose a method...</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        <AnimatePresence>
          {isMobile && (
            <motion.div
              key="mobile-fields"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="grid md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className={labelClass}>Phone Number</label>
                  <Input className={inputClass} placeholder="+265 999 000 000" value={pay.phoneNumber} onChange={(e) => updatePayment({ phoneNumber: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Account Name</label>
                  <Input className={inputClass} placeholder="Name on account" value={pay.accountName} onChange={(e) => updatePayment({ accountName: e.target.value })} />
                </div>
              </div>
            </motion.div>
          )}
          {isBank && (
            <motion.div
              key="bank-fields"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="grid md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className={labelClass}>Account Number</label>
                  <Input className={inputClass} placeholder="e.g. 0123456789" value={pay.accountNumber} onChange={(e) => updatePayment({ accountNumber: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Account Name</label>
                  <Input className={inputClass} placeholder="Name on account" value={pay.accountName} onChange={(e) => updatePayment({ accountName: e.target.value })} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {pay.paymentMethod && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "p-4 border flex items-center gap-4",
              isMobile ? "bg-amber-50 border-amber-100" : "bg-blue-50 border-blue-100"
            )}
          >
            <div className={cn(
              "w-9 h-9 flex items-center justify-center font-black text-xs",
              isMobile ? "bg-amber-500 text-white" : "bg-blue-600 text-white"
            )}>
              {isMobile ? "M" : "B"}
            </div>
            <div>
              <p className="font-bold text-brand-slate text-sm">{selected?.label}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                {isMobile ? "Mobile Money Transfer" : "Bank Transfer"}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
