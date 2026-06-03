"use client";

import { useApplicationStore } from "@/lib/store/use-application-store";
import { useOfflinePersistence, clearOfflinePersistence } from "@/hooks/use-offline-persistence";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Step1 from "@/components/student/wizard/step-1";
import Step2 from "@/components/student/wizard/step-2";
import Step3 from "@/components/student/wizard/step-3";
import Step4 from "@/components/student/wizard/step-4";
import { OtpVerificationModal } from "@/components/student/wizard/otp-verification-modal";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitApplication, getApplicationStatus, getStoredUser } from "@/lib/api";
import { calculateApplicationProgress } from "@/lib/application-progress";
import { toastSuccess, toastError } from "@/lib/toast";
import {
  FieldErrors,
  validateApplication,
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
} from "@/lib/application-validation";
import Link from "next/link";

const STEPS = ["Personal", "Family", "Education", "Review"];

export default function ApplicationWizard() {
  useOfflinePersistence();
  const { data, setStep, reset } = useApplicationStore();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [started, setStarted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [validationAttemptedSteps, setValidationAttemptedSteps] = useState<number[]>([]);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<Record<string, unknown> | null>(null);
  const router = useRouter();

  // Check on mount whether the application was already submitted
  useEffect(() => {
    getApplicationStatus()
      .then((s) => {
        if (s.status === "submitted" || s.status === "reviewing" || s.status === "approved") {
          setAlreadySubmitted(true);
        }
      })
      .catch(() => {});
  }, []);

  const nextStep = () => setStep(Math.min(data.currentStep + 1, 4));
  const prevStep = () => setStep(Math.max(data.currentStep - 1, 1));

  const markCurrentStepValidationAttempted = () => {
    setValidationAttemptedSteps((steps) =>
      steps.includes(data.currentStep) ? steps : [...steps, data.currentStep]
    );
  };

  const onlyErrors = (errors: FieldErrors, keys: string[]): FieldErrors =>
    keys.reduce<FieldErrors>((filtered, key) => {
      if (errors[key]) filtered[key] = errors[key];
      return filtered;
    }, {});

  const getImmediateValidationErrors = (step = data.currentStep): FieldErrors => {
    if (step === 1) {
      const errors = onlyErrors(validateStep1(data), [
        "personal.phoneNumber",
        "personal.dateOfBirth",
        "payment.phoneNumber",
      ]);

      if (!data.personal.phoneNumber) delete errors["personal.phoneNumber"];
      if (!data.personal.dateOfBirth) delete errors["personal.dateOfBirth"];
      if (!data.payment.phoneNumber) delete errors["payment.phoneNumber"];

      return errors;
    }

    if (step === 2) {
      const errors = onlyErrors(validateStep2(data), [
        "family.fatherPhone",
        "family.motherPhone",
        "family.parentPhone",
        "family.guardianPhone",
      ]);

      if (!data.family.fatherPhone) delete errors["family.fatherPhone"];
      if (!data.family.motherPhone) delete errors["family.motherPhone"];
      if (!data.family.parentPhone) delete errors["family.parentPhone"];
      if (!data.family.guardianPhone) delete errors["family.guardianPhone"];

      return errors;
    }

    return {};
  };

  const getDisplayErrors = (step = data.currentStep): FieldErrors => {
    if (submitAttempted) {
      if (step === 1) return validateStep1(data);
      if (step === 2) return validateStep2(data);
      if (step === 3) return validateStep3(data);
      if (step === 4) return validateStep4(data);
    }

    return validationAttemptedSteps.includes(step)
      ? getImmediateValidationErrors(step)
      : {};
  };
  const handleContinue = () => {
    markCurrentStepValidationAttempted();
    setSubmitError("");
    nextStep();
  };
  // If the store already has progress, skip the landing screen
  const showLanding = !started && data.currentStep === 1 &&
    !data.personal.firstName && !data.personal.surname;

  const handleSubmit = async () => {
    // This is the ONLY place data is sent to the backend database.
    // The "Continue" button only advances the step counter — it never calls the API.
    // All form data has been held in memory (Zustand) and locally in IndexedDB
    // as a draft. On Submit, everything is sent together in one request.
  
    setSubmitError("");

    const validation = validateApplication(data);
    if (validation.firstInvalidStep !== null) {
      setSubmitAttempted(true);
      setValidationAttemptedSteps([1, 2, 3, 4]);
      setStep(validation.firstInvalidStep);
      setSubmitError("Please complete the highlighted required fields before submitting.");
      return;
    }

    // Build payload
    const { family } = data;
    const sharedFamilyFields = {
      parentalStatus: family.parentalStatus,
      numberOfSiblings: family.numberOfSiblings,
      numberStillInSchool: family.numberStillInSchool,
      siblingsInPrimary: family.siblingsInPrimary,
      siblingsInSecondary: family.siblingsInSecondary,
      siblingsInTertiary: family.siblingsInTertiary,
    };

    const conditionalFamilyFields =
      family.parentalStatus === "both"
        ? {
            fatherFirstName: family.fatherFirstName,
            fatherSurname: family.fatherSurname,
            fatherNationalId: family.fatherNationalId,
            fatherPhone: family.fatherPhone,
            fatherProfession: family.fatherProfession,
            fatherMonthlyIncome: family.fatherMonthlyIncome,
            fatherTa: family.fatherTa,
            fatherResidentialAddress: family.fatherResidentialAddress,
            fatherPostalAddress: family.fatherPostalAddress,
            motherFirstName: family.motherFirstName,
            motherSurname: family.motherSurname,
            motherNationalId: family.motherNationalId,
            motherPhone: family.motherPhone,
            motherProfession: family.motherProfession,
            motherMonthlyIncome: family.motherMonthlyIncome,
            motherTa: family.motherTa,
            motherResidentialAddress: family.motherResidentialAddress,
            motherPostalAddress: family.motherPostalAddress,
          }
        : family.parentalStatus === "one"
          ? {
              parentFirstName: family.parentFirstName,
              parentSurname: family.parentSurname,
              parentNationalId: family.parentNationalId,
              parentPhone: family.parentPhone,
              parentMonthlyIncome: family.parentMonthlyIncome,
              studentRelationship: family.studentRelationship,
              parentTa: family.parentTa,
              parentResidentialAddress: family.parentResidentialAddress,
              parentPostalAddress: family.parentPostalAddress,
              deceasedParentId: family.deceasedParentId,
            }
          : family.parentalStatus === "none"
            ? {
                guardianFirstName: family.guardianFirstName,
                guardianSurname: family.guardianSurname,
                guardianNationalId: family.guardianNationalId,
                guardianPhone: family.guardianPhone,
                guardianMonthlyIncome: family.guardianMonthlyIncome,
                relationshipToGuardian: family.relationshipToGuardian,
                guardianTa: family.guardianTa,
                guardianResidentialAddress: family.guardianResidentialAddress,
                guardianPostalAddress: family.guardianPostalAddress,
                deceasedFatherId: family.deceasedFatherId,
                deceasedMotherId: family.deceasedMotherId,
              }
            : {};

    const payload = {
      personal: {
        ...data.personal,
        studentIdFile: undefined,
        nationalIdFile: undefined,
      },
      family: { ...sharedFamilyFields, ...conditionalFamilyFields },
      education: data.education,
      payment: { ...data.payment },
    };

    // Store payload and show OTP modal
    setPendingPayload(payload);
    setShowOtpModal(true);
  };

  const handleOtpVerified = async () => {
    if (!pendingPayload) return;

    setShowOtpModal(false);
    setSubmitting(true);

    try {
      // Upload the consent form first if the student provided one.
      // Uses the dedicated endpoint that does NOT require an existing family
      // record — just uploads the file and returns the URL. The URL is then
      // included in the submit payload so it lands in the DB atomically.
      let consentFormUrl: string | undefined;
      const consentFile = data.family.guarantorConsentFile;
      if (consentFile) {
        const formData = new FormData();
        formData.append("consentForm", consentFile);
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        const uploadRes = await fetch(`${BASE_URL}/family/upload-consent-form`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json() as { consentFormUrl?: string };
          consentFormUrl = uploadData.consentFormUrl;
        }
        // non-fatal — if upload fails the submission still proceeds
      }

      // Attach the consent form URL to the family payload so it is written
      // to the family record during the submit upsert in one step.
      const finalPayload = consentFormUrl
        ? { ...pendingPayload, family: { ...(pendingPayload.family as Record<string, unknown>), consentFormUrl } }
        : pendingPayload;

      const response = await submitApplication(finalPayload);
      reset();
      await clearOfflinePersistence();
      const userId = getStoredUser()?.id ?? "anonymous";
      localStorage.removeItem(`application_started_${userId}`);
      
      // Show success toast
      toastSuccess({
        title: "Application Submitted",
        description: "Your application has been received and is now in the review queue.",
      });
      
      const params = new URLSearchParams({
        submittedAt: response.submittedAt,
        status: response.applicationStatus,
      });
      router.push(`/apply/success?${params.toString()}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : "Submission failed. Please check your details and try again.";
      setSubmitError(errorMessage);
      toastError({
        title: "Submission Failed",
        description: errorMessage,
      });
    } finally {
      setSubmitting(false);
      setPendingPayload(null);
    }
  };

  const handleOtpCancel = () => {
    setShowOtpModal(false);
    setPendingPayload(null);
  };

  return (
    <div className="max-w-4xl mx-auto pb-32 pt-4">

      {/* Already submitted screen */}
      {alreadySubmitted ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-8"
        >
          <CheckCircle2 size={44} className="text-emerald-500" />
          <div>
            <h1 className="text-3xl font-display font-bold text-brand-slate tracking-tight mb-3">
              Application Already Submitted
            </h1>
            <p className="text-slate-500 font-normal max-w-md">
              You have already completed and submitted your profiling application.
              You cannot apply again. Track your progress on the status page.
            </p>
          </div>
          <Link
            href="/status"
            className="h-14 px-12 bg-brand-slate text-white font-bold text-sm tracking-wide hover:bg-brand-blue hover:scale-[1.02] transition-all duration-200 flex items-center gap-2"
          >
            Track Application Status <ChevronRight size={18} />
          </Link>
        </motion.div>
      ) : showLanding ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-8"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/apply.png" alt="Application" className="h-16 w-16 object-contain" />
          <div>
            <h1 className="text-3xl font-display font-bold text-brand-slate tracking-tight">Student Profiling</h1>
            <p className="text-slate-500 font-normal mt-2 max-w-md">
              Complete your profile to be considered for support.
              The process has 4 sections and takes about 10 minutes.
            </p>
          </div>
          <button
            onClick={() => {
              const userId = getStoredUser()?.id ?? "anonymous";
              localStorage.setItem(`application_started_${userId}`, "true");
              setStarted(true);
            }}
            className="h-14 px-12 bg-brand-slate text-white font-bold text-sm tracking-wide hover:bg-brand-blue hover:scale-[1.02] transition-all duration-200"
          >
            Start Application
          </button>
        </motion.div>
      ) : (
        <>
          {/* Header — step counter + dynamic title */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-brand-blue mb-1">
              Step {data.currentStep} of {STEPS.length}
            </p>
            <h1 className="text-3xl font-display font-bold text-brand-slate tracking-tight">
              {STEPS[data.currentStep - 1]} Details
            </h1>
          </div>

          <div className="mb-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-slate-500">Application progress</span>
              <span className="text-xs font-bold text-brand-blue">{calculateApplicationProgress(data).percent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden" style={{ backgroundColor: "#F7F5F2" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${calculateApplicationProgress(data).percent}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-full bg-brand-blue"
              />
            </div>
          </div>

          {/* Form — no box, fields rest directly on the background */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={data.currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "circOut" }}
              >
                {data.currentStep === 1 && <Step1 showValidation={validationAttemptedSteps.includes(1)} errors={getDisplayErrors(1)} />}
                {data.currentStep === 2 && <Step2 showValidation={validationAttemptedSteps.includes(2)} errors={getDisplayErrors(2)} />}
                {data.currentStep === 3 && <Step3 errors={getDisplayErrors(3)} />}
                {data.currentStep === 4 && <Step4 errors={getDisplayErrors(4)} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Nav Footer */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={data.currentStep === 1}
              className="font-bold text-brand-blue text-sm h-12 px-8"
            >
              <ChevronLeft className="mr-2 w-4 h-4" /> Back
            </Button>

            <div className="flex flex-col items-center">
              <div className="text-xs text-slate-400 font-medium">
                Step {data.currentStep} of 4
              </div>
              {submitError && (
                <p className="text-red-500 text-[10px] font-bold mt-2 text-center max-w-xs">{submitError}</p>
              )}
            </div>

            {data.currentStep < 4 ? (
              <button
                onClick={handleContinue}
                className="h-14 px-12 bg-brand-slate text-white font-bold text-sm w-full sm:w-auto tracking-wide hover:bg-brand-blue hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
              >
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="h-14 px-12 bg-brand-slate text-white font-bold text-sm w-full sm:w-auto tracking-wide hover:bg-brand-blue hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>Submit Profile <ChevronRight className="w-5 h-5" /></>
                )}
              </button>
            )}
          </div>
        </>
      )}

      {/* OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={showOtpModal}
        phoneNumber={data.personal.phoneNumber}
        onVerified={handleOtpVerified}
        onCancel={handleOtpCancel}
        isSubmitting={submitting}
      />
    </div>
  );
}

