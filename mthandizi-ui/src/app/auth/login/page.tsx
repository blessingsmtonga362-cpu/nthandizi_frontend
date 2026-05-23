"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { login, setToken, setStoredUser } from "@/lib/api";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    setEmail("");
    setPassword("");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const { token, user } = await login(email.trim().toLowerCase(), password);
      setToken(token);
      setStoredUser(user);
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid credentials. Please try again.";
      setError(message);
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

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-20" style={{ backgroundColor: "#FAF9F7" }}>
        {/* Go back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-blue transition-colors mb-12 self-start"
        >
          <ArrowLeft size={16} />
          Go back
        </Link>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-sm w-full"
        >
          {/* Heading */}
          <h1 className="text-4xl font-display font-bold text-brand-slate tracking-tight mb-1">
            Welcome!
          </h1>
          <p className="text-slate-500 font-normal mb-10">
            Sign in to your account.
          </p>

          <form autoComplete="off" className="space-y-6" onSubmit={handleLogin}>
            <input type="text" name="username" autoComplete="username" value="" readOnly hidden />
            <input type="password" name="password" autoComplete="new-password" value="" readOnly hidden />

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 block">Email</label>
              <Input
                type="email"
                placeholder="your@unima.ac.mw"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                className={cn(fieldClass, error ? "border-red-500" : "")}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700 block">Password</label>
                <Link href="#" className="text-xs text-brand-blue hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <Input
                  required
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
                  className={fieldClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-blue transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
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

            {/* Sign In */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-brand-slate text-white font-bold text-sm tracking-wide hover:bg-brand-blue hover:scale-[1.01] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : "Sign In"}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200" />
              <span className="mx-4 text-xs text-slate-400">or</span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            <Link
              href="/register"
              className="w-full h-14 border border-slate-300 text-brand-slate font-bold text-sm hover:border-brand-blue hover:text-brand-blue transition-colors flex items-center justify-center"
            >
              Create Student Account
            </Link>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
