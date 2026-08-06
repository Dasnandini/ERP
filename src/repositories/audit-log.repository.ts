import { db } from "@/db";
import { auditLogs } from "@/db/schema/audit/audit-log";
import { users } from "@/db/schema/core/user";
import { eq, and, desc } from "drizzle-orm";

export interface LogActivityInput {
  companyId: string;
  actorId?: string | null;
  module: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  description: string;
  changes?: Record<string, any> | null;
  ipAddress?: string | null;
}

export class AuditLogRepository {
  async log(input: LogActivityInput) {
    try {
      const [record] = await db
        .insert(auditLogs)
        .values({
          companyId: input.companyId,
          actorId: input.actorId || null,
          module: input.module,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId || null,
          description: input.description,
          changes: input.changes || null,
          ipAddress: input.ipAddress || null,
        })
        .returning();
      return record;
    } catch (err) {
      console.error("[AuditLogRepository.log] Failed to write audit log:", err);
      return null;
    }
  }

  async findByModule(companyId: string, module: string, limit = 20) {
    try {
      return await db
        .select({
          id: auditLogs.id,
          module: auditLogs.module,
          action: auditLogs.action,
          entityType: auditLogs.entityType,
          entityId: auditLogs.entityId,
          description: auditLogs.description,
          changes: auditLogs.changes,
          createdAt: auditLogs.createdAt,
          actorName: users.firstName,
          actorEmail: users.email,
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.actorId, users.id))
        .where(and(eq(auditLogs.companyId, companyId), eq(auditLogs.module, module)))
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit);
    } catch (err) {
      console.error("[AuditLogRepository.findByModule] Failed to fetch audit logs:", err);
      return [];
    }
  }
}

export const auditLogRepository = new AuditLogRepository();
