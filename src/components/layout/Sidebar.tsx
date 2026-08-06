"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export interface SubItem {
  name: string;
  path: string;
}

export interface SidebarItem {
  name: string;
  path?: string;
  icon?: string;
  subItems?: SubItem[];
}

export const sidebaritems: SidebarItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: "▦",
  },
  {
    name: "HR",
    icon: "👥",
  },
  {
    name: "Inventory",
    icon: "📦",
  },
  {
    name: "Sales",
    icon: "🏷️",
  },
  {
    name: "Purchase",
    icon: "🛍️",
  },
  {
    name: "Finance",
    icon: "🪙",
  },
  {
    name: "CRM",
    icon: "🤝",
  },
  {
    name: "Reports",
    path: "/dashboard/reports",
    icon: "📊",
  },
  {
    name: "Settings",
    icon: "⚙️",
    subItems: [
      { name: "Company", path: "/dashboard/settings/company" },
      { name: "Users", path: "/dashboard/settings/users" },
      { name: "Roles", path: "/dashboard/settings/roles" },
      { name: "Departments", path: "/dashboard/settings/departments" },
      { name: "Designations", path: "/dashboard/settings/designations" },
      { name: "Shifts", path: "/dashboard/settings/shifts" },
      { name: "Leave Types", path: "/dashboard/settings/leave-types" },
      { name: "Taxes", path: "/dashboard/settings/taxes" },
      { name: "Payment Methods", path: "/dashboard/settings/payment-methods" },
      { name: "Categories", path: "/dashboard/settings/categories" },
      { name: "Units", path: "/dashboard/settings/units" },
      { name: "Warehouses", path: "/dashboard/settings/warehouses" },
      { name: "Brands", path: "/dashboard/settings/brands" },
    ],
  },
];

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  // State to track open dropdown sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Auto-expand section if current route matches a sub-item
  useEffect(() => {
    const initialOpen: Record<string, boolean> = {};
    sidebaritems.forEach((item) => {
      if (item.subItems?.some((sub) => pathname === sub.path || pathname.startsWith(sub.path))) {
        initialOpen[item.name] = true;
      }
    });
    setOpenSections((prev) => ({ ...initialOpen, ...prev }));
  }, [pathname]);

  const toggleSection = (name: string) => {
    setOpenSections((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return pathname === path || (path !== "/dashboard" && pathname.startsWith(path));
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Branding Logo */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-green-900 flex items-center justify-center text-white font-bold shadow-md shadow-green-900/30">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="flex items-center gap-1.5 text-lg tracking-tight font-extrabold text-slate-900">
            <span>Nexora</span>
            <span className="text-slate-400 font-medium text-xs">ERP</span>
          </div>
        </div>

        {/* Dynamic Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scrollbar-thin">
          {sidebaritems.map((item) => {
            const hasSub = item.subItems && item.subItems.length > 0;
            const isSubActive = hasSub && item.subItems?.some((sub) => isActive(sub.path));
            const isSelfActive = isActive(item.path);
            const isOpenSection = openSections[item.name] ?? isSubActive;

            if (hasSub) {
              return (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => toggleSection(item.name)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                      isSubActive
                        ? "bg-slate-100 text-green-900 font-bold"
                        : "text-slate-700 hover:bg-slate-50 font-semibold"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">{item.icon || "📁"}</span>
                      <span>{item.name}</span>
                    </div>
                    <svg
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                        isOpenSection ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isOpenSection && (
                    <div className="ml-7 pl-3 border-l border-slate-200/80 my-1 space-y-1">
                      {item.subItems!.map((sub) => {
                        const active = isActive(sub.path);
                        return (
                          <Link
                            key={sub.name}
                            href={sub.path}
                            className={`flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
                              active
                                ? "text-green-900 font-bold bg-indigo-50/60"
                                : "text-slate-600 hover:text-green-900 hover:font-semibold"
                            }`}
                          >
                            <span>{sub.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Single item without dropdown
            return (
              <Link
                key={item.name}
                href={item.path || "#"}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                  isSelfActive
                    ? "bg-indigo-50 text-green-900 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">{item.icon || "📄"}</span>
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom Help Box */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 space-y-2">
            <div className="text-xs font-bold text-slate-800">Need Help?</div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Contact our support team for assistance.
            </p>
            <button className="w-full mt-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-xl py-2 px-3 text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-2">
              <span>🎧</span> Contact Support
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
