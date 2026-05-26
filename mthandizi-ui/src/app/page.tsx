"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Globe, Layers, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const [isIntro, setIsIntro] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  const impactOpacity = useTransform(scrollY, [0, 400], [0, 1]);
  const impactY = useTransform(scrollY, [0, 400], [100, 0]);

  useEffect(() => {
    const timer = setTimeout(() => setIsIntro(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", updateScroll);
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.8 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] as const } },
  };

  return (
    <div className="flex flex-col min-h-screen selection:bg-brand-blue/30 overflow-x-hidden" style={{ backgroundColor: "#FAF9F7" }}>

      {/* ── NAV ── */}
      <motion.nav
        initial={false}
        animate={{
          backgroundColor: isScrolled ? "rgba(250,249,247,0.92)" : "rgba(0,0,0,0)",
          backdropFilter: isScrolled ? "blur(12px)" : "blur(0px)",
          borderBottomColor: isScrolled ? "rgba(226,232,240,1)" : "rgba(226,232,240,0)",
        }}
        className="px-6 py-4 flex justify-between items-center fixed top-0 w-full z-50 transition-all duration-500 border-b"
      >
        <div className="w-40 h-10 relative">
          {!isIntro && (
            <motion.img
              layoutId="brand-logo"
              src="/mthandizi.png"
              alt="Mthandizi"
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="h-10 w-auto absolute left-0 top-0"
            />
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isIntro ? 0 : 1 }}
          transition={{ delay: 1 }}
          className="flex items-center gap-6"
        >
          <Link
            href="/login"
            className={cn("text-sm font-bold transition-colors", !isScrolled ? "text-white/80 hover:text-white" : "text-brand-slate hover:text-brand-blue")}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className={cn(
              "px-6 h-10 flex items-center text-sm font-bold transition-all hover:scale-[1.02]",
              !isScrolled
                ? "bg-white text-brand-slate hover:bg-white/90"
                : "bg-brand-slate text-white hover:bg-brand-blue"
            )}
          >
            Create Account
          </Link>
        </motion.div>
      </motion.nav>

      <main className="flex-1">

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">

          {/* Background photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/2-hanz.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Overlay — fades in after intro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isIntro ? 0 : 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-brand-slate/65 z-0"
          />

          {/* Intro logo animation — fades out as isIntro becomes false */}
          <AnimatePresence>
            {isIntro && (
              <motion.div
                className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
                style={{ backgroundColor: "#FAF9F7" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.img
                  layoutId="brand-logo"
                  src="/mthandizi.png"
                  alt="Mthandizi"
                  className="h-24 md:h-32 w-auto"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{
                    layout: { type: "spring", stiffness: 120, damping: 20 },
                    scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hero content */}
          <div className="flex-1 flex items-center justify-center w-full relative z-10">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isIntro ? "hidden" : "visible"}
              className="max-w-5xl w-full mx-auto text-center"
            >
              <motion.h1
                variants={itemVariants}
                className="text-5xl md:text-8xl font-display font-bold text-white mb-8 tracking-tighter leading-[0.9]"
              >
                The Future of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-cyan-400 to-brand-blue">
                  Empowerment.
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-12 leading-relaxed font-normal"
              >
                Mthandizi is an independent platform built to standardize student support
                across Malawi. Build a profile that connects you to institutional resources.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                <Link
                  href="register"
                  className="h-14 px-12 bg-brand-blue text-white text-base font-bold flex items-center gap-2 hover:bg-brand-blueDark hover:scale-[1.02] transition-all duration-200 shadow-2xl shadow-brand-blue/30"
                >
                  Get Started Now <ArrowRight size={18} />
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll hint */}
          <div className="relative z-10 pb-10 flex justify-center w-full">
            <AnimatePresence>
              {!isIntro && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, y: [0, 10, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{
                    opacity: { delay: 0.6, duration: 0.8 },
                    y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  }}
                  className="text-white/40 hidden md:block"
                >
                  <ChevronDown size={32} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <motion.section
          style={{ opacity: impactOpacity, y: impactY, backgroundColor: "#FAF9F7" }}
          className="py-32 relative z-20"
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-brand-slate mb-4">
                How It Works
              </h2>
              <div className="w-20 h-1 bg-brand-blue mx-auto" />
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  icon: Globe,
                  title: "1. Clear Eligibility Criteria",
                  desc: "The system uses a single non-discriminating approach for selecting students who are eligible and the process is highly standardized to enhance equity.",
                },
                {
                  icon: Layers,
                  title: "2. Secure Profiling",
                  desc: "Complete a structured, neutral profile that highlights your academic standing.",
                },
                {
                  icon: CheckCircle2,
                  title: "3. Direct Updates",
                  desc: "Receive real-time notifications about your status and support decisions.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="group border border-slate-200 p-8 hover:border-brand-blue hover:shadow-lg hover:shadow-brand-blue/10 hover:scale-[1.01] transition-all duration-300"
                >
                  <div className="w-14 h-14 border border-slate-200 flex items-center justify-center mb-6 group-hover:bg-brand-blue group-hover:border-brand-blue transition-all duration-300">
                    <feature.icon className="text-brand-blue w-7 h-7 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-brand-slate mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed font-normal text-sm">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="py-16 px-6 border-t border-slate-200" style={{ backgroundColor: "#FAF9F7" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mthandizi.png" alt="Mthandizi" className="h-10 w-auto" />
          <div className="flex gap-10 text-sm font-bold uppercase tracking-wider text-slate-400">
            <Link href="#" className="hover:text-brand-blue transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-brand-blue transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
