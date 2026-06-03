"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Loader } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface OtpVerificationModalProps {
  isOpen: boolean;
  phoneNumber: string;
  onVerified: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const inputClass = "h-14 rounded-none border border-slate-200 px-6 font-normal text-slate-800 placeholder:font-light hover:border-brand-blue focus:border-brand-blue transition-colors";
const errorClass = "border-red-400 hover:border-red-500 focus:border-red-500";

export function OtpVerificationModal({
  isOpen,
  phoneNumber,
  onVerified,
  onCancel,
  isSubmitting = false,
}: OtpVerificationModalProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [hasResent, setHasResent] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setError("");
    setHasResent(false);
    handleSendOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, phoneNumber]);

  // Timer for OTP expiry
  useEffect(() => {
    if (!isOpen || verified) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, verified]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendOtp = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-phone-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          purpose: "application_submission",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send OTP");
        return;
      }

      setOtp("");
      setTimeLeft(600);
      setHasResent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-phone-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          code: otp,
          purpose: "application_submission",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "OTP verification failed");
        return;
      }

      setVerified(true);
      setTimeout(() => {
        onVerified();
      }, 1500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 animate-in fade-in slide-in-from-bottom-4">
        {verified ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 size={48} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-brand-slate">Verified!</h2>
            <p className="text-sm text-slate-600">
              Your phone number has been verified. Submitting your application...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-brand-slate">Verify Phone Number</h2>
              <p className="text-sm text-slate-600 mt-2">
                We&apos;ve sent a verification code to {phoneNumber}
              </p>
            </div>

            {error && (
              <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 block">
                OTP Code
              </label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                className={cn(
                  inputClass,
                  "text-center text-2xl tracking-widest",
                  error && errorClass
                )}
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(value);
                }}
                disabled={loading || isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">
                Code expires in {formatTime(timeLeft)}
              </span>
              {hasResent && (
                <span className="text-slate-400">Code resent</span>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleVerifyOtp}
                disabled={loading || isSubmitting || otp.length !== 6 || timeLeft === 0}
                className="w-full h-12 bg-brand-blue text-white font-bold hover:bg-brand-blue/90 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>

              <Button
                onClick={handleSendOtp}
                disabled={loading || isSubmitting || hasResent}
                variant="outline"
                className="w-full h-12"
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  "Resend Code"
                )}
              </Button>

              <Button
                onClick={onCancel}
                disabled={loading || isSubmitting}
                variant="ghost"
                className="w-full h-12"
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-slate-500 text-center">
              You have 5 attempts to verify your code
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
