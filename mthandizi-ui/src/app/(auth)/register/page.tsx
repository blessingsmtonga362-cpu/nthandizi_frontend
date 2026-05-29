// app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { registerUser } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [emailError, setEmailError] = useState("");

  const handleEmailChange = (value: string) => {
    setFormData({ ...formData, email: value });
    if (value.includes("@") && !value.endsWith("@unima.ac.mw")) {
      setEmailError("Please use your UNIMA email address (@unima.ac.mw)");
    } else {
      setEmailError("");
    }
  };

  const passwordStrength = (pwd: string) => {
    if (pwd.length === 0) return 0;
    let strength = 0;
    if (pwd.length > 7) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 1) return "bg-red-500";
    if (strength <= 3) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const currentStrength = passwordStrength(formData.password);
  const isPasswordStrong = currentStrength === 4;

  const isFormValid = () =>
    formData.firstName.trim() &&
    formData.surname.trim() &&
    formData.email.endsWith("@unima.ac.mw") &&
    formData.password.length >= 8 &&
    isPasswordStrong &&
    formData.password === formData.confirmPassword &&
    !emailError;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 8 || !isPasswordStrong) {
      setError("Choose a stronger password: at least 8 characters, including uppercase letters, numbers, and symbols.");
      return;
    }
    if (!isFormValid()) return;
    setIsLoading(true);
    setError("");
    try {
      await registerUser({
        firstName: formData.firstName.trim(),
        lastName: formData.surname.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
     
      router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fieldClass = "h-14 rounded-none border border-slate-300 px-4 font-normal text-slate-800 placeholder:text-slate-400 placeholder:font-light hover:border-brand-blue focus:border-brand-blue transition-colors";

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — photo ── */}
      <div className="hidden lg:block relative w-1/2 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/3-hanz.jpg"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-brand-slate/70" />

        {/* Animated logo centred on overlay */}
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

      {/* Right panel form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-20 py-12 overflow-y-auto" style={{ backgroundColor: "#FAF9F7" }}>
        {/* Go back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-blue transition-colors mb-10 self-start"
        >
          <ArrowLeft size={16} />
          Go back
        </Link>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-lg w-full"
        >
          {/* Heading */}
          <h1 className="text-4xl font-display font-bold text-brand-slate tracking-tight mb-1">
            Sign Up
          </h1>
          <p className="text-slate-500 font-normal mb-10">
            Join the Mthandizi student profiling platform.
          </p>

          <form autoComplete="off" className="space-y-6" onSubmit={handleRegister}>
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-6">

              {/* First Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">First Name</label>
                <Input
                  required
                  autoComplete="given-name"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={fieldClass}
                />
              </div>

              {/* Surname */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Surname</label>
                <Input
                  required
                  autoComplete="family-name"
                  placeholder="Surname"
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  className={fieldClass}
                />
              </div>

              {/* University Email */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 block">University Email</label>
                <Input
                  required
                  type="email"
                  autoComplete="email"
                  placeholder="your@unima.ac.mw"
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={cn(fieldClass, emailError ? "border-red-500" : "")}
                />
                <AnimatePresence>
                  {emailError && (
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="text-red-500 text-xs flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" /> {emailError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Password</label>
                <div className="relative">
                  <Input
                    required
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={cn(fieldClass, "pr-12")}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-blue transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formData.password.length > 0 && !isPasswordStrong && (
                  <p className="text-xs text-red-500">Needs 8+ chars, uppercase, numbers and symbols.</p>
                )}
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className={cn("h-1 w-full transition-colors duration-300", currentStrength >= step ? getStrengthColor(currentStrength) : "bg-slate-200")} />
                  ))}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Confirm Password</label>
                <div className="relative">
                  <Input
                    required
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={cn(fieldClass, "pr-12", formData.confirmPassword && formData.password !== formData.confirmPassword ? "border-red-500" : "")}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-blue transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <AnimatePresence>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="text-red-500 text-xs flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" /> Passwords do not match
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* API error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-red-500 text-xs flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className="w-full h-14 bg-brand-slate text-white font-bold text-sm tracking-wide hover:bg-brand-blue hover:scale-[1.01] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : "Create Account"}
            </button>

            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="text-brand-blue font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}


