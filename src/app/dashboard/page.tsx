"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user, hasCompany, activeCompany, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
        return;
      }
      if (!hasCompany) {
        router.push("/company-setup");
        return;
      }
    }
  }, [user, hasCompany, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 text-xs font-medium">
        Loading Dashboard…
      </div>
    );
  }

  if (!user || !activeCompany) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Welcome back, {user.firstName || "John"}! 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Here's what's happening with your business today.
          </p>
        </div>

        {/* Date Filter Badge */}
        <div className="flex items-center gap-2 bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs text-slate-600 shadow-2xs font-semibold self-start md:self-auto">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>May 18, 2025 - May 24, 2025</span>
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl p-5 shadow-lg shadow-indigo-600/20 relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-indigo-100">Total Revenue</span>
            <div className="p-2 bg-white/10 rounded-xl">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight">₹12,45,000</span>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                ↑ 14.2%
              </span>
            </div>
            <div className="text-[11px] text-indigo-200/80 mt-1">vs ₹10,90,000 last month</div>
          </div>
          {/* Wave SVG decorative graphic */}
          <div className="mt-4 opacity-40">
            <svg viewBox="0 0 100 20" className="w-full h-6 stroke-white fill-none stroke-2">
              <path d="M0 15 Q 25 5, 50 12 T 100 2" />
            </svg>
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Total Sales</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">₹8,75,000</span>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200">
                ↑ 8.6%
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">vs ₹8,06,000 last month</div>
          </div>
          <div className="mt-4">
            <svg viewBox="0 0 100 20" className="w-full h-6 stroke-emerald-500 fill-none stroke-2">
              <path d="M0 18 Q 30 10, 60 14 T 100 4" />
            </svg>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Total Expenses</span>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">₹3,25,000</span>
              <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-200">
                ↑ 5.4%
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">vs ₹3,08,000 last month</div>
          </div>
          <div className="mt-4">
            <svg viewBox="0 0 100 20" className="w-full h-6 stroke-orange-500 fill-none stroke-2">
              <path d="M0 12 Q 25 18, 50 10 T 100 15" />
            </svg>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Net Profit</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">₹5,50,000</span>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200">
                ↑ 18.7%
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">vs ₹4,63,000 last month</div>
          </div>
          <div className="mt-4">
            <svg viewBox="0 0 100 20" className="w-full h-6 stroke-purple-500 fill-none stroke-2">
              <path d="M0 16 Q 35 4, 70 12 T 100 2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Module Operations Navigation Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>⚙️</span> Quick Navigation & Operations
          </h2>
          <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            {activeCompany.companyName}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/departments"
            className="group p-4 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                <span>🏢</span> Department Management
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Manage company departments, assign managers, and view activity logs.
              </p>
            </div>
            <span className="text-slate-400 group-hover:text-indigo-600 transition-colors text-sm font-bold">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
