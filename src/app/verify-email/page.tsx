"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { authApi } from "@/services/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    async function verify() {
      try {
        const res = await authApi.verifyEmail(token!);

        if (res.error) {
          setStatus("error");
          setMessage(res.error || "Verification failed.");
        } else {
          setStatus("success");
          setMessage(res.data?.message || "Email verified successfully!");
        }
      } catch {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    }

    verify();
  }, [token]);

  const icons = {
    loading: "⟳",
    success: "✓",
    error: "✕",
  };

  const titles = {
    loading: "Verifying your email…",
    success: "Email verified!",
    error: "Verification failed",
  };

  const subtitles = {
    loading: "Please wait while we verify your email address.",
    success: "Your account is now active.",
    error: "Something went wrong with the verification.",
  };

  return (
    <>
      <div className="text-center">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold ${
            status === "loading"
              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-spin"
              : status === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {icons[status]}
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mb-1">{titles[status]}</h1>
        <p className="text-sm text-slate-400 mb-6">{subtitles[status]}</p>
      </div>

      {message && (
        <div
          className={`p-3.5 border rounded-xl text-sm flex items-center gap-2 mb-6 ${
            status === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          <span>{status === "success" ? "✓" : "⚠"}</span>
          <span>{message}</span>
        </div>
      )}

      {status === "success" && (
        <Link
          href="/login"
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/25 block text-center"
          id="verify-go-login"
        >
          Go to Login
        </Link>
      )}

      {status === "error" && (
        <div className="flex flex-col gap-3">
          <Link
            href="/register"
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/25 block text-center"
            id="verify-register-again"
          >
            Register again
          </Link>
          <p className="text-center text-xs text-slate-400">
            or <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">go to login</Link>
          </p>
        </div>
      )}
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(99,102,241,0.15),transparent)]">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-indigo-950/20 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
            E
          </div>
          <span className="text-lg font-bold text-white tracking-tight">ERP SaaS</span>
        </div>

        <Suspense fallback={
          <div className="text-center text-slate-400 text-sm py-8">
            Verifying…
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
