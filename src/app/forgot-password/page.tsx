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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(99,102,241,0.15),transparent)]">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-indigo-950/20 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
            E
          </div>
          <span className="text-lg font-bold text-white tracking-tight">ERP SaaS</span>
        </div>

        <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Forgot your password?</h1>
        <p className="text-sm text-slate-400 mb-6">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-2 mb-6">
            <span>⚠</span><span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 flex items-center gap-2 mb-6">
            <span>✓</span>
            <span>{success}</span>
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300" htmlFor="forgot-email">Email address</label>
              <input
                id="forgot-email"
                type="email"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <button type="submit" className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-2" id="forgot-submit" disabled={loading}>
              {loading && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-400 mt-6">
          Remember your password?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
