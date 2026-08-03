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
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200 animate-spin"
              : status === "success"
              ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          {icons[status]}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{titles[status]}</h1>
        <p className="text-sm text-slate-500 mb-6">{subtitles[status]}</p>
      </div>

      {message && (
        <div
          className={`p-3.5 border rounded-xl text-sm flex items-center gap-2 mb-6 ${
            status === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-600"
          }`}
        >
          <span>{status === "success" ? "✓" : "⚠"}</span>
          <span>{message}</span>
        </div>
      )}

      {status === "success" && (
        <Link
          href="/login"
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20 block text-center"
          id="verify-go-login"
        >
          Go to Login
        </Link>
      )}

      {status === "error" && (
        <div className="flex flex-col gap-3">
          <Link
            href="/register"
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20 block text-center"
            id="verify-register-again"
          >
            Register again
          </Link>
          <p className="text-center text-xs text-slate-500">
            or <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">go to login</Link>
          </p>
        </div>
      )}
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(16,185,129,0.12),transparent)]">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-8 shadow-2xl shadow-emerald-950/5 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-extrabold text-white shadow-md shadow-emerald-500/20">
            E
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">ERP SaaS</span>
        </div>

        <Suspense fallback={
          <div className="text-center text-slate-500 text-sm py-8">
            Verifying…
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
