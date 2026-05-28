
import {
  ArrowRight,
  Check,
  KeyRound,
  Fingerprint,
  ShieldCheck,
  Moon,
  Sun,
  Monitor,
  Menu,
  X,
} from "lucide-react";

import { motion } from "framer-motion";
import AegisPassShield from "@/components/ui/aegis-pass-shield";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "@/context/theme-provider";

const features = [
  {
    icon: ShieldCheck,
    title: "Zero-Knowledge Architecture",
    description:
      "Encryption and decryption happen locally on your device.",
  },
  {
    icon: KeyRound,
    title: "AES-256-GCM Encryption",
    description:
      "Your vault stays encrypted before data ever leaves your system.",
  },
  {
    icon: Fingerprint,
    title: "Secure Access",
    description:
      "Fast and secure access with modern privacy-first protection.",
  },
];




export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const { theme } = useTheme();


  return (
    <div className="relative isolate min-h-screen bg-background text-foreground overflow-hidden">
      {/* animated background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: "72px 72px",
          }}
        />

        <motion.div
          animate={{
            x: [0, 50, -20, 0],
            y: [0, -40, 20, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[-10%] left-[15%] h-[500px] w-[500px] rounded-full bg-violet-500/15 blur-[140px]"
        />

        <motion.div
          animate={{
            x: [0, -40, 20, 0],
            y: [0, 30, -20, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[-10%] right-[10%] h-[450px] w-[450px] rounded-full bg-blue-500/10 blur-[140px]"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,hsl(var(--background))_90%)]" />
      </div>

      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
          <div className="h-16 rounded-2xl border border-border bg-background/70 backdrop-blur-2xl flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <AegisPassShield />

              <span className="text-2xl font-semibold tracking-tight">
                Aegis-Pass
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-10 text-sm text-fg-muted">
              <a href="#security" className="hover:text-foreground transition">
                Security
              </a>

              <a href="#features" className="hover:text-foreground transition">
                Features
              </a>

              <a href="#vault" className="hover:text-foreground transition">
                Vault
              </a>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />

              <Link
                to="/login"
                className="text-sm text-fg-muted hover:text-foreground transition mx-3"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="h-11 px-5 rounded-xl bg-accent-brand-muted text-white hover:opacity-90 transition flex items-center text-sm font-medium"
              >
                Get Started
              </Link>
            </div>

            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden h-11 w-11 rounded-xl border border-border flex items-center justify-center"
            >
              {mobileMenu ? <X /> : <Menu />}
            </button>
          </div>

          {mobileMenu && (
            <div className="md:hidden mt-3 rounded-2xl border border-border bg-background/95 backdrop-blur-xl p-5">
              <div className="flex flex-col gap-5">
                <a href="#security">Security</a>
                <a href="#features">Features</a>
                <a href="#vault">Vault</a>

                <div className="flex items-center gap-3 pt-2">
                  <ThemeToggle />

                  <Link
                    to="/signup"
                    className="flex-1 h-11 rounded-xl bg-accent-brand-muted text-white flex items-center justify-center"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* HERO */}
      <section
        id="vault"
        className="relative pt-40 pb-15 bg-gradient-to-b from-white to-accent-brand-muted/80 dark:from-black dark:to-accent-brand-muted/50 flex flex-col items-center justify-center rounded-4xl sm:px-5"
      >
        <div className="flex-col justify-center items-center  max-w-6xl mx-auto pb-25 sm:px-6 px-5">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >

            <h1 className="flex flex-col text-center items-center justify-center max-w-xl text-5xl sm:text-6xl xl:text-7xl font-semibold tracking-[-0.05em] leading-[0.92]">
              <span>Stress less.</span>

              <span className="text-accent-brand-muted/70 dark:text-fg-muted mx-auto text-wrap">
                Remember one. Forget the rest.
              </span>
            </h1>

            <p className="mt-8 text-lg text-fg-muted leading-relaxed max-w-xl text-center">
              Store passwords, notes, and sensitive data in one secure vault with seamless access across all your devices.
            </p>

            <div className="my-10 flex flex-wrap gap-4 max-w-xl justify-center">
              <Link
                to="/signup"
                className="h-14 px-7 rounded-2xl bg-accent-brand-muted text-white hover:opacity-90 transition flex items-center gap-2 font-medium"
              >
                Create Secure Vault
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/login"
                className="h-14 px-7 rounded-2xl border border-border bg-background/60 backdrop-blur flex items-center"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
        <div className=" max-w-6xl mx-auto sm:px-6 px-5">
            <img src="/dashboard-display.png" alt="Dashboard-mock" className="rounded-lg" />
        </div>          
      </section>

      

      {/* FEATURES */}
      <section id="security" className="relative py-10 sm:py-28 mt-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">

            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
              Security that works quietly in the background
            </h2>

            <p className="mt-6 text-lg text-fg-muted leading-relaxed">
              Built using modern, battle-tested cryptographic standards and security best practices .
            </p>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-border bg-background/60 backdrop-blur-xl p-7"
              >
                <div className="h-12 w-12 rounded-2xl bg-accent-brand-muted/10 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-accent-brand-muted" />
                </div>

                <h3 className="mt-6 text-xl font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-4 text-fg-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* generator + checker */}
          <div className="mt-16 grid lg:grid-cols-2 gap-8">
          </div>
        </div>
      </section>

      {/* TOOLS */}
       

      {/* FEATURES */}
      <section
        id="features"
        className="relative my-10 py-5 sm:py-15 bg-gradient-to-b from-accent-brand-muted/80 via-white to-accent-brand-muted/80 dark:from-accent-brand-muted/50 dark:via-black dark:to-accent-brand-muted/50 rounded-4xl"
      >
        <div className="p-5 max-w-7xl mx-auto px-4 sm:px-6">

                <h2 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
                  Built-in password
                  tools
                  <br />
                   designed for
                  everyday security.
                </h2>

                <div className="my-10">
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 h-14 px-7 rounded-2xl bg-accent-brand-muted text-white hover:opacity-90 transition font-medium"
                  >
                    Start Securing Passwords
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="rounded-[36px] border border-border bg-background/50 backdrop-blur-xl overflow-hidden p-6 sm:p-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>

                <h6 className="mt-6 text-xl sm:text-5xl font-semibold tracking-tight leading-tight">
                  Create strong, unique and random passwords easily
                </h6>

                <p className="mt-6 text-lg text-fg-muted leading-relaxed">
                  Create strong, unique passwords instantly with customizable length, symbols, numbers, and character rules designed for maximum security.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    "Customize password length",
                    "Config characters for password",
                    "Fast and minimal password generation experience",
                    "Cryptographically secure random password generation"
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3"
                    >
                      <Check className="h-5 w-5 text-emerald-500" />

                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative rounded-xl max-w-md mx-auto">
                <div className="absolute inset-0 bg-accent-brand-muted/20 blur-3xl rounded-full" />

                <div className="relative rounded-xl">
                  {/* <DashboardPreview /> */}
                  {theme === "dark" ? 
                    <img src="/password-generator-demo-dark.png" alt="password-generator-mock-dark" className="rounded-xl " />
                    :
                    <img src="/password-generator-demo-light.png" alt="password-generator-mock-light" className="rounded-xl " />
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
          <div className="rounded-[36px] border border-border bg-background/50 backdrop-blur-xl overflow-hidden p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="relative rounded-xl max-w-md mx-auto order-2 lg:order-1">
                    <div className="absolute inset-0 bg-accent-brand-muted/20 blur-3xl rounded-full" />

                    <div className="relative rounded-xl">
                    {/* <DashboardPreview /> */}
                    {theme === "dark" ? 
                        <img src="/password-checker-demo-dark.png" alt="password-checker-mock-dark" className="rounded-xl " />
                        :
                        <img src="/password-checker-demo-light.png" alt="password-checker-mock-light" className="rounded-xl " />
                    }
                    </div>
                </div>
                
              <div className="order-1 lg:order-2">

                <h2 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
                  Check the strength of your passwords with security suggestions.
                </h2>

                <p className="mt-6 text-lg text-fg-muted leading-relaxed">
                  Analyze password strength in real time and identify weak, reused, or vulnerable credentials before they become a security risk.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    "Check randomness",
                    "Check uniqueness",
                    "Check for patterns",
                    "UI representing strength of a password",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3"
                    >
                      <Check className="h-5 w-5 text-emerald-500" />

                      <span>{item}</span>
                    </div>
                  ))}
                </div>

              </div>

              
            </div>
          </div>
        </div>
      </section>


       {/* CTA */}
       <section className=" py-28 sm:mt-30">
         <div className="max-w-6xl mx-auto rounded-[40px] p-16 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-accent-brand-muted-soft opacity-60" />

           <div className="relative">
             <h2 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1]">
               Built for people who
               <br />
               take security seriously.
             </h2>

             <p className="mt-8 text-lg text-fg-muted max-w-2xl mx-auto">
               Store passwords, notes, and sensitive information securely with a
               vault experience built around privacy and simplicity.
             </p>

             <div className="mt-10 flex justify-center gap-4 flex-wrap">
              <Link
                to="/signup"
                className="h-14 px-7 rounded-2xl bg-accent-brand-muted text-white hover:opacity-90 transition flex items-center gap-2 font-medium"
              >
                Create Account
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/login"
                className="h-14 px-7 rounded-2xl border border-border bg-background/60 backdrop-blur flex items-center"
              >
                Login
              </Link>
            </div>

             {/* <div className="mt-10 flex justify-center gap-4 flex-wrap">
               <a
                href="/signup"
                className="h-14 px-8 rounded-2xl bg-accent-brand-muted text-white hover:opacity-90 transition flex items-center font-medium"
              >
                Create Account
              </a>

              <a
                href="/login"
                className="h-14 px-8 rounded-2xl border border-border bg-bg-subtle hover:bg-bg-elevated transition flex items-center"
              >
                Login
              </a>
            </div> */}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AegisPassShield />

            <span className="font-semibold text-fg-muted">
              Aegis-Pass
            </span>
          </div>

            <div className="flex gap-6 text-fg-muted">
                <a href="#">Privacy</a>
                <a href="#security">Security</a>
                <a href="#">Support</a>
            </div>
        </div>
      </footer>
    </div>
  );
}




function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") return setTheme("dark");
    if (theme === "dark") return setTheme("light");
  };

  return (
    <button
      onClick={cycleTheme}
      className="h-11 w-11 rounded-xl flex items-center justify-center hover:bg-muted transition"
    >
      {theme === "system" ? (
        <Monitor className="h-5 w-5" />
      ) : theme === "dark" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
}