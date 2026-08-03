"use client";

import Link from "next/link";
import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });

      if (res.error) {
        if (res.code === "EMAIL_NOT_VERIFIED") {
          setError("Your email is not verified. Please check your inbox.");
        } else {
          setError(res.error || "Login failed. Please try again.");
        }
        return;
      }

      await refreshUser();

      const meRes = await authApi.getMe();
      if (meRes.data && meRes.data.hasCompany === false) {
        router.push("/company-setup");
      } else {
        router.push(redirect);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-8 shadow-2xl shadow-emerald-950/5 relative z-10">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-extrabold text-white shadow-md shadow-emerald-500/20">
          E
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">ERP SaaS</span>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Welcome back</h1>
      <p className="text-sm text-slate-500 mb-6">Sign in to your account to continue</p>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2 mb-6">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700" htmlFor="login-email">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700" htmlFor="login-password">
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPwd ? "text" : "password"}
              className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
              onClick={() => setShowPwd((v) => !v)}
              aria-label="Toggle password visibility"
              id="toggle-login-password"
            >
              <EyeIcon open={showPwd} />
            </button>
          </div>
        </div>

        {/* Forgot password */}
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          id="login-submit"
          disabled={loading}
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-semibold">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(16,185,129,0.12),transparent)]">
      <Suspense fallback={<div className="text-slate-500 text-sm">Loading login form…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
