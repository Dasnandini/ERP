"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { authApi } from "@/services/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await authApi.forgotPassword(email);

      if (res.error) {
        setError(res.error || "Something went wrong.");
        return;
      }

      setSuccess(res.data?.message || "Reset link sent!");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(16,185,129,0.12),transparent)]">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-8 shadow-2xl shadow-emerald-950/5 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-extrabold text-white shadow-md shadow-emerald-500/20">
            E
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">ERP SaaS</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Forgot your password?</h1>
        <p className="text-sm text-slate-500 mb-6">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2 mb-6">
            <span>⚠</span><span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 flex items-center gap-2 mb-6">
            <span>✓</span>
            <span>{success}</span>
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="forgot-email">Email address</label>
              <input
                id="forgot-email"
                type="email"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <button type="submit" className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-2" id="forgot-submit" disabled={loading}>
              {loading && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-500 mt-6">
          Remember your password?{" "}
          <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
