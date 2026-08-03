"use client";

import Link from "next/link";
import { useState, FormEvent, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!token) {
    return (
      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-2">
        <span>⚠</span>
        <span>Invalid or missing reset token. Please{" "}
          <Link href="/forgot-password" className="text-indigo-400 hover:text-indigo-300 font-medium">request a new one</Link>.
        </span>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword({ token, password });

      if (res.error) {
        setError(res.error || "Reset failed.");
        return;
      }

      setSuccess(res.data?.message || "Password reset successfully!");
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-2 mb-6">
          <span>⚠</span><span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 flex items-center gap-2 mb-6">
          <span>✓</span><span>{success} Redirecting to login…</span>
        </div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300" htmlFor="reset-password">New password</label>
            <div className="relative">
              <input
                id="reset-password"
                type={showPwd ? "text" : "password"}
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1" id="toggle-reset-password" onClick={() => setShowPwd((v) => !v)} aria-label="Toggle password">
                <EyeIcon open={showPwd} />
              </button>
            </div>
            <span className="text-xs text-slate-400">
              Min 8 chars · uppercase · lowercase · number
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300" htmlFor="reset-confirm">Confirm new password</label>
            <div className="relative">
              <input
                id="reset-confirm"
                type={showConfirm ? "text" : "password"}
                className={`w-full pl-3.5 pr-10 py-2.5 bg-slate-950/80 border ${confirmPassword && confirmPassword !== password ? "border-red-500" : "border-slate-800"} rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1" id="toggle-reset-confirm" onClick={() => setShowConfirm((v) => !v)} aria-label="Toggle confirm password">
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <span className="text-xs text-red-400 mt-0.5">Passwords do not match</span>
            )}
          </div>

          <button type="submit" className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-2" id="reset-submit" disabled={loading}>
            {loading && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {loading ? "Resetting…" : "Reset password"}
          </button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(99,102,241,0.15),transparent)]">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-indigo-950/20 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
            E
          </div>
          <span className="text-lg font-bold text-white tracking-tight">ERP SaaS</span>
        </div>

        <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Reset your password</h1>
        <p className="text-sm text-slate-400 mb-6">Enter and confirm your new password below.</p>

        <Suspense fallback={<div className="text-slate-400 text-sm">Loading…</div>}>
          <ResetPasswordForm />
        </Suspense>

        <p className="text-center text-xs text-slate-400 mt-6">
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">← Back to login</Link>
        </p>
      </div>
    </div>
  );
}
