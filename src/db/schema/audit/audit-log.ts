import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { companies } from "../core/company";
import { users } from "../core/user";
import { idColumn, timestamps } from "../common/base-columns";
import { relations } from "drizzle-orm/_relations";

export const auditLogs = pgTable(
  "audit_logs",
  {
    ...idColumn,

    companyId: uuid("company_id")
      .references(() => companies.id, { onDelete: "cascade" })
      .notNull(),

    actorId: uuid("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),

    module: varchar("module", { length: 100 }).notNull(),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityId: uuid("entity_id"),

    description: text("description").notNull(),
    changes: jsonb("changes"),
    ipAddress: varchar("ip_address", { length: 45 }),

    ...timestamps,
  },
  (table) => ({
    companyIdx: index("audit_logs_company_id_idx").on(table.companyId),
    actorIdx: index("audit_logs_actor_id_idx").on(table.actorId),
    moduleIdx: index("audit_logs_module_idx").on(table.companyId, table.module),
    entityIdx: index("audit_logs_entity_idx").on(table.entityType, table.entityId),
  })
);

export const auditLogRelations = relations(auditLogs, ({ one }) => ({
  company: one(companies, {
    fields: [auditLogs.companyId],
    references: [companies.id],
  }),
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id],
  }),
}));
