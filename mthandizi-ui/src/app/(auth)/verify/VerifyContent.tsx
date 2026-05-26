"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowLeft, RefreshCcw, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { verifyOtp, resendOtp } from "@/lib/api";

export default function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
      sessionStorage.setItem("registration_email", decodeURIComponent(emailParam));
    } else {
      const storedEmail = sessionStorage.getItem("registration_email");
      if (storedEmail) {
        setEmail(storedEmail);
      } else {
        setError("Email not found. Please go back and register again.");
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!email) return;
    setCanResend(false);
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [email]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData.split(""));
      inputRefs.current[5]?.focus();
      e.preventDefault();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.some((d) => d === "") || !email) {
      setError("Please enter the verification code");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await verifyOtp(email, otp.join(""));
      setVerified(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError("Email not found. Please go back and register again.");
      return;
    }
    setIsResending(true);
    setError("");
    try {
      await resendOtp(email);
      setCanResend(false);
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  // Loading state
  if (!email && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAF9F7" }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-normal">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state (no email)
  if (!email && error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAF9F7" }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Mail className="text-red-500" size={32} />
          </div>
          <h2 className="text-xl font-display font-bold text-brand-slate mb-2">No Email Found</h2>
          <p className="text-slate-500 font-normal mb-4">Please go back and register first.</p>
          <Link href="/register" className="text-brand-blue font-normal hover:text-brand-blueDark transition-colors">
            Back to Registration
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#FAF9F7" }}>
      {/* ── Left panel — photo ── */}
      <div className="hidden lg:block relative w-1/2 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/3-hanz.jpg"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-slate/70" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.img
            src="/mthandizi.png"
            alt="Mthandizi"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="h-24 w-auto object-contain brightness-0 invert"
          />
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-20">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 text-sm font-normal text-slate-500 hover:text-brand-blue transition-colors mb-12 self-start"
        >
          <ArrowLeft size={16} />
          Back to Registration
        </Link>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-sm w-full"
        >
          <AnimatePresence mode="wait">
            {verified ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-14 h-14 bg-emerald-50 flex items-center justify-center mb-8">
                  <CheckCircle2 size={28} className="text-emerald-500" />
                </div>
                <h1 className="text-4xl font-display font-bold text-brand-slate tracking-tight mb-2">
                  Email Verified!
                </h1>
                <p className="text-slate-500 font-normal mb-8">
                  Your account is confirmed. Redirecting you to sign in...
                </p>
                <div className="w-6 h-6 border-2 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin" />
              </motion.div>
            ) : (
              <motion.div key="form">
                <div className="w-14 h-14 bg-brand-blue/5 flex items-center justify-center mb-8">
                  <Mail size={28} className="text-brand-blue" />
                </div>

                <h1 className="text-4xl font-display font-bold text-brand-slate tracking-tight mb-1">
                  Verify Your Email
                </h1>
                <p className="text-slate-500 font-normal mb-10">
                  We sent a 6-digit code to{" "}
                  <span className="text-brand-blue">{email}</span>
                </p>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="text-red-500 text-xs font-normal flex items-center gap-1.5 mb-6"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <form onSubmit={handleVerify} className="space-y-8">
                  {/* OTP inputs */}
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onPaste={handlePaste}
                        className="w-12 h-14 text-center text-xl font-normal border border-slate-300 bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all text-brand-slate"
                        disabled={isLoading}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={otp.some((d) => d === "") || isLoading}
                    className="w-full h-14 bg-brand-slate text-white font-normal text-sm tracking-wide hover:bg-brand-blue hover:scale-[1.01] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Confirm & Proceed"
                    )}
                  </button>
                </form>

                <p className="text-sm font-normal text-slate-500 mt-8">
                  Didn't receive the code?{" "}
                  {!canResend ? (
                    <span className="text-brand-blue">Resend in {timer}s</span>
                  ) : (
                    <button
                      onClick={handleResendCode}
                      disabled={isResending}
                      className="text-brand-blue hover:text-brand-blueDark inline-flex items-center gap-1 transition-colors"
                    >
                      <RefreshCcw size={13} className={isResending ? "animate-spin" : ""} />
                      {isResending ? "Sending..." : "Resend Code"}
                    </button>
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
