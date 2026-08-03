import { pgTable, text, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

import { companies } from "../core/company";

export const units = pgTable("units", {
  id: uuid("id").defaultRandom().primaryKey(),

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  name: varchar("name", { length: 100 }).notNull(),
  shortName: varchar("short_name", { length: 20 }),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
