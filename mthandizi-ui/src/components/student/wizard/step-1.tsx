"use client";
import { useApplicationStore } from "@/lib/store/use-application-store";
import { Input } from "@/components/ui/input";
import { MalawiPhoneInput } from "@/components/student/wizard/malawi-phone-input";
import { cn } from "@/lib/utils";
import { MALAWI_DISTRICTS, MALAWI_TAS } from "@/lib/constants/malawi-data";
import { motion, AnimatePresence } from "framer-motion";
import { FieldErrors, getDateInputMaxForAge, toNationalIdValue } from "@/lib/application-validation";

const selectClass = "wizard-select w-full h-14 rounded-none border border-slate-200 px-6 font-normal text-slate-800 outline-none appearance-none hover:border-brand-blue focus:border-brand-blue transition-colors";
const labelClass = "text-sm font-medium text-slate-700 mb-2 block";
const inputClass = "h-14 rounded-none border border-slate-200 px-6 font-normal text-slate-800 placeholder:font-light hover:border-brand-blue focus:border-brand-blue transition-colors [background-color:#F7F5F2]";
const errorClass = "border-red-400 hover:border-red-500 focus:border-red-500";
const errorTextClass = "text-xs font-normal text-red-500";

const PAYMENT_METHODS = [
  { value: "airtel", label: "Airtel Money", type: "mobile" },
  { value: "tnm", label: "TNM Mpamba", type: "mobile" },
  { value: "national", label: "National Bank", type: "bank" },
  { value: "standard", label: "Standard Bank", type: "bank" },
];

function FieldError({ message }: { message?: string }) {
  return message ? <p className={errorTextClass}>{message}</p> : null;
}

export default function Step1({
  showValidation = false,
  errors = {},
}: {
  showValidation?: boolean;
  errors?: FieldErrors;
}) {
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
          <Input className={cn(inputClass, errors["personal.firstName"] && errorClass)} placeholder="John" value={p.firstName} onChange={(e) => updatePersonal({ firstName: e.target.value })} />
          <FieldError message={errors["personal.firstName"]} />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Surname</label>
          <Input className={cn(inputClass, errors["personal.surname"] && errorClass)} placeholder="Doe" value={p.surname} onChange={(e) => updatePersonal({ surname: e.target.value })} />
          <FieldError message={errors["personal.surname"]} />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Phone Number</label>
          <MalawiPhoneInput value={p.phoneNumber} onChange={(phoneNumber) => updatePersonal({ phoneNumber })} showError={showValidation} error={errors["personal.phoneNumber"]} />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>National ID Number</label>
          <Input className={cn(inputClass, errors["personal.nationalId"] && errorClass)} placeholder="e.g. AB123456" maxLength={8} value={p.nationalId} onChange={(e) => updatePersonal({ nationalId: toNationalIdValue(e.target.value) })} />
          <FieldError message={errors["personal.nationalId"]} />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Home District</label>
          <select className={cn(selectClass, errors["personal.homeDistrict"] && errorClass)} value={p.homeDistrict} onChange={(e) => updatePersonal({ homeDistrict: e.target.value })}>
            <option value="">Select District</option>
            {MALAWI_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <FieldError message={errors["personal.homeDistrict"]} />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>T/A (Traditional Authority)</label>
          <select className={cn(selectClass, errors["personal.ta"] && errorClass)} value={p.ta} onChange={(e) => updatePersonal({ ta: e.target.value })}>
            <option value="">Select T/A</option>
            {MALAWI_TAS.map((t, i) => <option key={`ta-${i}`} value={t}>{t}</option>)}
          </select>
          <FieldError message={errors["personal.ta"]} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className={labelClass}>Physical Address</label>
          <Input className={cn(inputClass, errors["personal.physicalAddress"] && errorClass)} placeholder="e.g. Area 25, Lilongwe" value={p.physicalAddress} onChange={(e) => updatePersonal({ physicalAddress: e.target.value })} />
          <FieldError message={errors["personal.physicalAddress"]} />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Date of Birth</label>
          <div className="relative">
            <Input
              type="date"
              max={getDateInputMaxForAge(12)}
              className={cn(inputClass, errors["personal.dateOfBirth"] && errorClass, "pr-4 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-4 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer")}
              value={p.dateOfBirth}
              onChange={(e) => updatePersonal({ dateOfBirth: e.target.value })}
            />
          </div>
          <FieldError message={errors["personal.dateOfBirth"]} />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Registration Number</label>
          <Input className={cn(inputClass, errors["personal.registrationNumber"] && errorClass)} placeholder="e.g. BSC-COM-14-21" value={p.registrationNumber} onChange={(e) => updatePersonal({ registrationNumber: e.target.value })} />
          <FieldError message={errors["personal.registrationNumber"]} />
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
          <FieldError message={errors["personal.maritalStatus"]} />
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
          <FieldError message={errors["personal.gender"]} />
        </div>

        {/* Disability */}
        <div className="space-y-2 md:col-span-2">
          <label className={labelClass}>Disability (leave as &quot;None&quot; if not applicable)</label>
          <Input className={inputClass} placeholder="None" value={p.disability} onChange={(e) => updatePersonal({ disability: e.target.value })} />
        </div>
      </div>

      {/* Payment Details */}
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-slate-700">Payment Details</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Ensure your payment details are correct. Mthandizi will not be held accountable for
            disbursements sent to incorrect accounts or numbers provided by the applicant.
          </p>
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Payment Method</label>
          <select
            className={cn(selectClass, errors["payment.paymentMethod"] && errorClass)}
            value={pay.paymentMethod}
            onChange={(e) => updatePayment({ paymentMethod: e.target.value, phoneNumber: "", accountName: "", accountNumber: "" })}
          >
            <option value="">Choose a method...</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <FieldError message={errors["payment.paymentMethod"]} />
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
                  <MalawiPhoneInput value={pay.phoneNumber} onChange={(phoneNumber) => updatePayment({ phoneNumber })} showError={showValidation} error={errors["payment.phoneNumber"]} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Account Name</label>
                  <Input className={cn(inputClass, errors["payment.accountName"] && errorClass)} placeholder="Name on account" value={pay.accountName} onChange={(e) => updatePayment({ accountName: e.target.value })} />
                  <FieldError message={errors["payment.accountName"]} />
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
                  <Input className={cn(inputClass, errors["payment.accountNumber"] && errorClass)} placeholder="e.g. 0123456789" value={pay.accountNumber} onChange={(e) => updatePayment({ accountNumber: e.target.value })} />
                  <FieldError message={errors["payment.accountNumber"]} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Account Name</label>
                  <Input className={cn(inputClass, errors["payment.accountName"] && errorClass)} placeholder="Name on account" value={pay.accountName} onChange={(e) => updatePayment({ accountName: e.target.value })} />
                  <FieldError message={errors["payment.accountName"]} />
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
