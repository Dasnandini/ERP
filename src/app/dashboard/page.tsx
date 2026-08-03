"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user, hasCompany, activeCompany, memberships, loading, logout } = useAuth();

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

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-400 text-sm">
        Loading Dashboard…
      </div>
    );
  }

  if (!user || !activeCompany) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Navbar */}
        <div className="flex justify-between items-center bg-slate-900/80 border border-slate-800 rounded-2xl p-4 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
              E
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white tracking-tight">ERP SaaS</span>
              <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full font-medium">
                {activeCompany.companyName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400">
              Role: <strong className="text-indigo-400 font-semibold">{activeCompany.roleName || "Owner"}</strong>
            </span>
            <button
              onClick={handleLogout}
              id="logout-btn"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-sm font-medium transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Welcome Header */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Welcome to {activeCompany.companyName}! 👋
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Logged in as <strong className="text-slate-200">{user.firstName} {user.lastName || ""}</strong> ({user.email})
              </p>
            </div>
            <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              ✓ Setup Complete
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400 mb-1">Company Slug</div>
              <div className="text-sm font-mono font-semibold text-slate-200">{activeCompany.companySlug}</div>
            </div>
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400 mb-1">Operating Currency</div>
              <div className="text-sm font-semibold text-slate-200">{activeCompany.currency}</div>
            </div>
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400 mb-1">Timezone</div>
              <div className="text-sm font-semibold text-slate-200">{activeCompany.timezone}</div>
            </div>
          </div>
        </div>

        {/* Multi-Company / Membership Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-semibold text-white">
            Your Companies ({memberships.length})
          </h2>
          <div className="space-y-3">
            {memberships.map((m) => (
              <div
                key={m.companyId}
                className={`flex justify-between items-center p-4 rounded-xl border transition-all ${
                  m.companyId === activeCompany.companyId
                    ? "bg-indigo-950/30 border-indigo-500/40"
                    : "bg-slate-950/60 border-slate-800/80"
                }`}
              >
                <div>
                  <div className="font-semibold text-sm text-slate-200">{m.companyName}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Phone: {m.companyPhone} • Role: {m.roleName || "Owner"}
                  </div>
                </div>
                {m.isDefaultCompany && (
                  <span className="text-[11px] bg-indigo-600 text-white px-2.5 py-0.5 rounded-full font-semibold">
                    Default Workspace
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
