import { db } from "@/db";
import { departments } from "@/db/schema/hr/department";
import { users } from "@/db/schema/core/user";
import { memberships } from "@/db/schema/core/membership";
import { eq, and, ilike, or, isNull, isNotNull, count, sql, desc, ne } from "drizzle-orm";

export interface DepartmentFilterOptions {
  companyId: string;
  search?: string;
  status?: "active" | "inactive" | "all";
  deletedState?: "active_only" | "deleted_only" | "all";
  page?: number;
  limit?: number;
}

export interface CreateDepartmentPayload {
  companyId: string;
  name: string;
  code?: string | null;
  description?: string | null;
  managerId?: string | null;
  status?: "active" | "inactive";
  createdBy: string;
}

export interface UpdateDepartmentPayload {
  name?: string;
  code?: string | null;
  description?: string | null;
  managerId?: string | null;
  status?: "active" | "inactive";
  updatedBy: string;
}

export class DepartmentRepository {
  async findPaginated(options: DepartmentFilterOptions) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 10));
    const offset = (page - 1) * limit;

    const conditions = [eq(departments.companyId, options.companyId)];

    // Handle soft delete state
    if (options.deletedState === "deleted_only") {
      conditions.push(isNotNull(departments.deletedAt));
    } else if (options.deletedState === "all") {
      // no deletedAt restriction
    } else {
      // Default: active_only (not deleted)
      conditions.push(isNull(departments.deletedAt));
    }

    // Handle status filter
    if (options.status && options.status !== "all") {
      conditions.push(eq(departments.status, options.status));
    }

    // Handle search query
    if (options.search && options.search.trim() !== "") {
      const searchTerm = `%${options.search.trim()}%`;
      conditions.push(
        or(
          ilike(departments.name, searchTerm),
          ilike(departments.code, searchTerm),
          ilike(departments.description, searchTerm)
        )!
      );
    }

    const whereClause = and(...conditions);

    // 1. Get total record count
    const countResult = await db
      .select({ total: count() })
      .from(departments)
      .where(whereClause);

    const total = Number(countResult[0]?.total || 0);

    // 2. Fetch page data with manager info
    const data = await db
      .select({
        id: departments.id,
        companyId: departments.companyId,
        name: departments.name,
        code: departments.code,
        description: departments.description,
        managerId: departments.managerId,
        isDefault: departments.isDefault,
        status: departments.status,
        isActive: departments.isActive,
        createdAt: departments.createdAt,
        updatedAt: departments.updatedAt,
        deletedAt: departments.deletedAt,
        createdBy: departments.createdBy,
        updatedBy: departments.updatedBy,
        deletedBy: departments.deletedBy,
        managerName: sql<string | null>`CASE WHEN ${users.id} IS NOT NULL THEN concat(${users.firstName}, ' ', coalesce(${users.lastName}, '')) ELSE NULL END`,
        managerEmail: users.email,
      })
      .from(departments)
      .leftJoin(users, eq(departments.managerId, users.id))
      .where(whereClause)
      .orderBy(desc(departments.createdAt))
      .limit(limit)
      .offset(offset);

    // 3. Summary stats for counts (Active, Inactive, Deleted)
    const statsResult = await db
      .select({
        totalCount: count(),
        activeCount: sql<number>`count(case when ${departments.status} = 'active' and ${departments.deletedAt} is null then 1 end)`,
        inactiveCount: sql<number>`count(case when ${departments.status} = 'inactive' and ${departments.deletedAt} is null then 1 end)`,
        deletedCount: sql<number>`count(case when ${departments.deletedAt} is not null then 1 end)`,
      })
      .from(departments)
      .where(eq(departments.companyId, options.companyId));

    const stats = {
      totalCount: Number(statsResult[0]?.totalCount || 0),
      activeCount: Number(statsResult[0]?.activeCount || 0),
      inactiveCount: Number(statsResult[0]?.inactiveCount || 0),
      deletedCount: Number(statsResult[0]?.deletedCount || 0),
    };

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      stats,
    };
  }

  async findById(id: string, companyId: string) {
    const result = await db
      .select({
        id: departments.id,
        companyId: departments.companyId,
        name: departments.name,
        code: departments.code,
        description: departments.description,
        managerId: departments.managerId,
        isDefault: departments.isDefault,
        status: departments.status,
        isActive: departments.isActive,
        createdAt: departments.createdAt,
        updatedAt: departments.updatedAt,
        deletedAt: departments.deletedAt,
        managerName: sql<string | null>`CASE WHEN ${users.id} IS NOT NULL THEN concat(${users.firstName}, ' ', coalesce(${users.lastName}, '')) ELSE NULL END`,
        managerEmail: users.email,
      })
      .from(departments)
      .leftJoin(users, eq(departments.managerId, users.id))
      .where(and(eq(departments.id, id), eq(departments.companyId, companyId)))
      .limit(1);

    return result[0] || null;
  }

  async checkDuplicateName(companyId: string, name: string, excludeId?: string) {
    const conditions = [
      eq(departments.companyId, companyId),
      ilike(departments.name, name.trim()),
      isNull(departments.deletedAt),
    ];
    if (excludeId) {
      conditions.push(ne(departments.id, excludeId));
    }
    const result = await db
      .select({ id: departments.id })
      .from(departments)
      .where(and(...conditions))
      .limit(1);

    return result.length > 0;
  }

  async checkDuplicateCode(companyId: string, code: string, excludeId?: string) {
    if (!code || code.trim() === "") return false;
    const conditions = [
      eq(departments.companyId, companyId),
      ilike(departments.code, code.trim()),
      isNull(departments.deletedAt),
    ];
    if (excludeId) {
      conditions.push(ne(departments.id, excludeId));
    }
    const result = await db
      .select({ id: departments.id })
      .from(departments)
      .where(and(...conditions))
      .limit(1);

    return result.length > 0;
  }

  async create(payload: CreateDepartmentPayload) {
    const [department] = await db
      .insert(departments)
      .values({
        companyId: payload.companyId,
        name: payload.name.trim(),
        code: payload.code ? payload.code.trim() : null,
        description: payload.description ? payload.description.trim() : null,
        managerId: payload.managerId || null,
        status: payload.status || "active",
        isDefault: false,
        isActive: payload.status !== "inactive",
        createdBy: payload.createdBy,
        updatedBy: payload.createdBy,
      })
      .returning();

    return department;
  }

  async update(id: string, companyId: string, payload: UpdateDepartmentPayload) {
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
      updatedBy: payload.updatedBy,
    };

    if (payload.name !== undefined) updateData.name = payload.name.trim();
    if (payload.code !== undefined) updateData.code = payload.code ? payload.code.trim() : null;
    if (payload.description !== undefined) updateData.description = payload.description ? payload.description.trim() : null;
    if (payload.managerId !== undefined) updateData.managerId = payload.managerId || null;
    if (payload.status !== undefined) {
      updateData.status = payload.status;
      updateData.isActive = payload.status === "active";
    }

    const [updated] = await db
      .update(departments)
      .set(updateData)
      .where(and(eq(departments.id, id), eq(departments.companyId, companyId)))
      .returning();

    return updated;
  }

  async softDelete(id: string, companyId: string, userId: string) {
    const [deleted] = await db
      .update(departments)
      .set({
        deletedAt: new Date(),
        deletedBy: userId,
        isActive: false,
        status: "inactive",
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(and(eq(departments.id, id), eq(departments.companyId, companyId)))
      .returning();

    return deleted;
  }

  async restore(id: string, companyId: string, userId: string) {
    const [restored] = await db
      .update(departments)
      .set({
        deletedAt: null,
        deletedBy: null,
        isActive: true,
        status: "active",
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(and(eq(departments.id, id), eq(departments.companyId, companyId)))
      .returning();

    return restored;
  }

  async findManagers(companyId: string) {
    return await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(memberships)
      .innerJoin(users, eq(memberships.userId, users.id))
      .where(eq(memberships.companyId, companyId));
  }
}

export const departmentRepository = new DepartmentRepository();
