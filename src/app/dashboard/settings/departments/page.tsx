"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { departmentApi } from "@/services/api";

interface Department {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  managerId: string | null;
  managerName: string | null;
  managerEmail: string | null;
  isDefault: boolean;
  status: "active" | "inactive";
  isActive: boolean;
  createdAt: string;
  deletedAt: string | null;
}

interface Manager {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
}

interface AuditLog {
  id: string;
  module: string;
  action: string;
  entityType: string;
  description: string;
  createdAt: string;
  actorName: string | null;
  actorEmail: string | null;
}

export default function DepartmentsPage() {
  const router = useRouter();
  const { user, hasCompany, activeCompany, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [deletedState, setDeletedState] = useState<"active_only" | "deleted_only" | "all">("active_only");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [stats, setStats] = useState({
    totalCount: 0,
    activeCount: 0,
    inactiveCount: 0,
    deletedCount: 0,
  });

  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    managerId: "",
    status: "active" as "active" | "inactive",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ─── Data Fetching ────────────────────────────────────────────────────────────
  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    const res = await departmentApi.getPaginated({
      search,
      status: statusFilter,
      deletedState,
      page,
      limit,
    });

    if (res.error) {
      showError(res.error);
    } else if (res.data) {
      setDepartments(res.data.data || []);
      setPage(res.data.pagination.page);
      setTotalPages(res.data.pagination.totalPages);
      setTotalCount(res.data.pagination.total);
      if (res.data.stats) {
        setStats(res.data.stats);
      }
    }
    setLoading(false);
  }, [search, statusFilter, deletedState, page, limit, showError]);

  const fetchManagers = useCallback(async () => {
    const res = await departmentApi.getManagers();
    if (res.data?.managers) {
      setManagers(res.data.managers);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    const res = await departmentApi.getLogs();
    if (res.data?.logs) {
      setLogs(res.data.logs);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
        return;
      }
      if (!hasCompany) {
        router.push("/company-setup");
        return;
      }
      fetchDepartments();
      fetchManagers();
    }
  }, [authLoading, user, hasCompany, router, fetchDepartments, fetchManagers]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // ─── Modal Handlers ───────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setFormData({ name: "", code: "", description: "", managerId: "", status: "active" });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setSelectedDepartment(dept);
    setFormData({
      name: dept.name,
      code: dept.code || "",
      description: dept.description || "",
      managerId: dept.managerId || "",
      status: dept.status,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (dept: Department) => {
    setSelectedDepartment(dept);
    setIsDeleteModalOpen(true);
  };

  const openRestoreModal = (dept: Department) => {
    setSelectedDepartment(dept);
    setIsRestoreModalOpen(true);
  };

  const openLogsModal = () => {
    fetchLogs();
    setIsLogsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = "Department name is required";
    } else if (formData.name.length > 150) {
      errors.name = "Name must be less than 150 characters";
    }
    if (formData.code && formData.code.length > 50) {
      errors.code = "Code must be less than 50 characters";
    }
    if (formData.description && formData.description.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── Actions ──────────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const res = await departmentApi.create({
      name: formData.name,
      code: formData.code || null,
      description: formData.description || null,
      managerId: formData.managerId || null,
      status: formData.status,
    });
    setSubmitting(false);

    if (res.error) {
      if (res.details) {
        const fieldErrs: Record<string, string> = {};
        Object.entries(res.details).forEach(([k, v]) => {
          fieldErrs[k] = v[0];
        });
        setFormErrors(fieldErrs);
      }
      showError(res.error);
    } else {
      showSuccess("Department created successfully!");
      setIsCreateModalOpen(false);
      fetchDepartments();
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment || !validateForm()) return;

    setSubmitting(true);
    const res = await departmentApi.update(selectedDepartment.id, {
      name: formData.name,
      code: formData.code || null,
      description: formData.description || null,
      managerId: formData.managerId || null,
      status: formData.status,
    });
    setSubmitting(false);

    if (res.error) {
      if (res.details) {
        const fieldErrs: Record<string, string> = {};
        Object.entries(res.details).forEach(([k, v]) => {
          fieldErrs[k] = v[0];
        });
        setFormErrors(fieldErrs);
      }
      showError(res.error);
    } else {
      showSuccess("Department updated successfully!");
      setIsEditModalOpen(false);
      fetchDepartments();
    }
  };

  const handleSoftDelete = async () => {
    if (!selectedDepartment) return;

    setSubmitting(true);
    const res = await departmentApi.softDelete(selectedDepartment.id);
    setSubmitting(false);

    if (res.error) {
      showError(res.error);
    } else {
      showSuccess(`Department '${selectedDepartment.name}' moved to Trash.`);
      setIsDeleteModalOpen(false);
      fetchDepartments();
    }
  };

  const handleRestore = async () => {
    if (!selectedDepartment) return;

    setSubmitting(true);
    const res = await departmentApi.restore(selectedDepartment.id);
    setSubmitting(false);

    if (res.error) {
      showError(res.error);
    } else {
      showSuccess(`Department '${selectedDepartment.name}' restored successfully.`);
      setIsRestoreModalOpen(false);
      fetchDepartments();
    }
  };

  if (authLoading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs font-medium">
        Loading Department Workspace…
      </div>
    );
  }

  if (!user || !activeCompany) return null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">

            Departments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage company departments, view managers, filter status, and track audit history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openLogsModal}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all shadow-2xs flex items-center gap-2"
          >
            Activity Logs
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
          >
            <span>+</span> Add Department
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Total Departments</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalCount}</div>
        </div>
        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs font-medium text-emerald-800">Active</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{stats.activeCount}</div>
        </div>
        <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs font-medium text-amber-800">Inactive</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{stats.inactiveCount}</div>
        </div>
        <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs font-medium text-rose-800">In Trash</div>
          <div className="text-2xl font-extrabold text-rose-700 mt-1">{stats.deletedCount}</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search department name, code..."
              className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-9 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Status Segmented Pills */}
            <div className="flex items-center bg-slate-100/80 p-1 rounded-xl text-xs">
              <button
                onClick={() => { setStatusFilter("all"); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${statusFilter === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                All
              </button>
              <button
                onClick={() => { setStatusFilter("active"); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${statusFilter === "active" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Active
              </button>
              <button
                onClick={() => { setStatusFilter("inactive"); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${statusFilter === "inactive" ? "bg-amber-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Inactive
              </button>
            </div>

            {/* Trash Segmented Pills */}
            <div className="flex items-center bg-slate-100/80 p-1 rounded-xl text-xs">
              <button
                onClick={() => { setDeletedState("active_only"); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${deletedState === "active_only" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Active Items
              </button>
              <button
                onClick={() => { setDeletedState("deleted_only"); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${deletedState === "deleted_only" ? "bg-rose-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Trash ({stats.deletedCount})
              </button>
            </div>

            {/* Page Limit Selector */}
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clean White Data Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Code</th>
                <th className="px-6 py-3.5">Department Name</th>
                <th className="px-6 py-3.5">Manager</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Created Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Loading departments…
                  </td>
                </tr>
              ) : departments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    {deletedState === "deleted_only"
                      ? "No soft-deleted departments in trash."
                      : "No departments found."}
                  </td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr
                    key={dept.id}
                    className={`hover:bg-slate-50/80 transition-colors ${dept.deletedAt ? "bg-rose-50/40 opacity-70" : ""
                      }`}
                  >
                    <td className="px-6 py-4 font-mono text-slate-500 font-semibold">
                      {dept.code || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        {dept.name}
                        {dept.isDefault && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold border border-slate-200">
                            Default
                          </span>
                        )}
                      </div>
                      {dept.description && (
                        <div className="text-slate-400 text-[11px] mt-0.5 line-clamp-1">
                          {dept.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {dept.managerName ? (
                        <div>
                          <div className="font-semibold text-slate-800">{dept.managerName}</div>
                          <div className="text-[11px] text-slate-400">{dept.managerEmail}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {dept.deletedAt ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Soft Deleted
                        </span>
                      ) : dept.status === "active" ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ● Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          ○ Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(dept.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {dept.deletedAt ? (
                          <button
                            onClick={() => openRestoreModal(dept)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold transition-all"
                          >
                            Restore
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openEditModal(dept)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200"
                            >
                              Edit
                            </button>
                            {!dept.isDefault && (
                              <button
                                onClick={() => openDeleteModal(dept)}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold transition-all"
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-slate-50/80 border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{(page - 1) * limit + (departments.length > 0 ? 1 : 0)}</strong> to{" "}
            <strong className="text-slate-800">{Math.min(page * limit, totalCount)}</strong> of{" "}
            <strong className="text-slate-800">{totalCount}</strong> entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold"
            >
              Previous
            </button>

            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${p === page
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ─── CREATE MODAL ───────────────────────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
              <h3 className="text-base font-extrabold text-slate-900">Create New Department</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Quality Assurance"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                {formErrors.name && (
                  <p className="text-rose-500 text-[11px] mt-1 font-semibold">{formErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Department Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. QA"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  {formErrors.code && (
                    <p className="text-rose-500 text-[11px] mt-1 font-semibold">{formErrors.code}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as "active" | "inactive" })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Department Manager
                </label>
                <select
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">No Manager Assigned</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName || ""} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Department scope and objectives…"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {submitting ? "Saving…" : "Save Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── EDIT MODAL ─────────────────────────────────────────────────────────── */}
      {isEditModalOpen && selectedDepartment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
              <h3 className="text-base font-extrabold text-slate-900">
                Edit Department: {selectedDepartment.name}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
                {formErrors.name && (
                  <p className="text-rose-500 text-[11px] mt-1 font-semibold">{formErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Department Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  {formErrors.code && (
                    <p className="text-rose-500 text-[11px] mt-1 font-semibold">{formErrors.code}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as "active" | "inactive" })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Department Manager
                </label>
                <select
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">No Manager Assigned</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName || ""} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {submitting ? "Updating…" : "Update Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── SOFT DELETE MODAL ─────────────────────────────────────────────────── */}
      {isDeleteModalOpen && selectedDepartment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-lg font-bold border border-rose-200">
              ⚠️
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Soft Delete Department?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Move department <strong className="text-slate-800">{selectedDepartment.name}</strong> to Trash? You can restore it anytime.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSoftDelete}
                disabled={submitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 disabled:opacity-50"
              >
                {submitting ? "Deleting…" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── RESTORE MODAL ─────────────────────────────────────────────────────── */}
      {isRestoreModalOpen && selectedDepartment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg font-bold border border-emerald-200">
              ♻️
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Restore Department?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Restore department <strong className="text-slate-800">{selectedDepartment.name}</strong> back to active list?
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsRestoreModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                disabled={submitting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {submitting ? "Restoring…" : "Restore Department"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── AUDIT LOGS MODAL ──────────────────────────────────────────────────── */}
      {isLogsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                📜 Department Activity Audit Logs
              </h3>
              <button
                onClick={() => setIsLogsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
              {logs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">
                  No activity logs recorded yet.
                </p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="font-bold text-emerald-700 capitalize">
                        {log.action.replace("_", " ")}
                      </span>
                      <span className="text-[11px]">
                        {new Date(log.createdAt).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <div className="text-slate-800 font-semibold">{log.description}</div>
                    <div className="text-[11px] text-slate-400">
                      Actor: {log.actorName || log.actorEmail || "System"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
