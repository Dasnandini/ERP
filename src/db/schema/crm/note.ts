import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { idColumn } from "../common/base-columns";
import { companies } from "../core/company";
import { users } from "../core/user";

export const notes = pgTable("notes", {
  ...idColumn,

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: uuid("entity_id").notNull(),
  content: text("content").notNull(),
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
