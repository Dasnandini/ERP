"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/services/api";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function getPasswordStrength(pwd: string): { score: number; label: string; cls: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { score, label: "Weak", cls: "bg-red-500 text-red-600" };
  if (score === 2) return { score, label: "Fair", cls: "bg-amber-500 text-amber-600" };
  if (score === 3) return { score, label: "Good", cls: "bg-yellow-500 text-yellow-600" };
  return { score, label: "Strong", cls: "bg-emerald-500 text-emerald-600" };
}

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const strength = password ? getPasswordStrength(password) : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register({ firstName, lastName, email, password });

      if (res.error) {
        if (res.details) {
          setFieldErrors(res.details);
        } else {
          setError(res.error || "Registration failed.");
        }
        return;
      }

      setSuccess(res.data?.message || "Account created! Check your email to verify.");
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(16,185,129,0.12),transparent)]">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-8 shadow-2xl shadow-emerald-950/5 relative z-10">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-extrabold text-white shadow-md shadow-emerald-500/20">
            E
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">ERP SaaS</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Create your account</h1>
        <p className="text-sm text-slate-500 mb-6">Start your free trial today</p>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2 mb-6">
            <span>⚠</span><span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 flex items-center gap-2 mb-6">
            <span>✓</span><span>{success} Redirecting to login…</span>
          </div>
        )}

        {!success && (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700" htmlFor="reg-firstname">First name</label>
                <input
                  id="reg-firstname"
                  type="text"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border ${fieldErrors.firstName ? "border-red-400" : "border-slate-200"} rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all`}
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                />
                {fieldErrors.firstName && (
                  <span className="text-xs text-red-500 mt-0.5">{fieldErrors.firstName[0]}</span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700" htmlFor="reg-lastname">Last name</label>
                <input
                  id="reg-lastname"
                  type="text"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="reg-email">Email address</label>
              <input
                id="reg-email"
                type="email"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border ${fieldErrors.email ? "border-red-400" : "border-slate-200"} rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all`}
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              {fieldErrors.email && (
                <span className="text-xs text-red-500 mt-0.5">{fieldErrors.email[0]}</span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="reg-password">Password</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPwd ? "text" : "password"}
                  className={`w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border ${fieldErrors.password ? "border-red-400" : "border-slate-200"} rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1" id="toggle-reg-password" onClick={() => setShowPwd((v) => !v)} aria-label="Toggle password">
                  <EyeIcon open={showPwd} />
                </button>
              </div>
              {fieldErrors.password && (
                <span className="text-xs text-red-500 mt-0.5">{fieldErrors.password[0]}</span>
              )}
              {password && strength && (
                <div className="mt-1.5">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${i <= strength.score ? strength.cls.split(' ')[0] : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                  <span className={`text-[11px] font-semibold ${strength.cls.split(' ')[1]}`}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="reg-confirm-password">Confirm password</label>
              <div className="relative">
                <input
                  id="reg-confirm-password"
                  type={showConfirm ? "text" : "password"}
                  className={`w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border ${confirmPassword && confirmPassword !== password ? "border-red-400" : "border-slate-200"} rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all`}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1" id="toggle-confirm-password" onClick={() => setShowConfirm((v) => !v)} aria-label="Toggle confirm password">
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <span className="text-xs text-red-500 mt-0.5">Passwords do not match</span>
              )}
            </div>

            <button type="submit" className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-2" id="register-submit" disabled={loading}>
              {loading && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
