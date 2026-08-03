import { pgEnum, pgTable, text, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

import { companies } from "../core/company";
import { files } from "../common/file";

export const brandStatusEnum = pgEnum("brand_status", [
  "active",
  "inactive",
  "archived",
]);

export const brands = pgTable("brands", {
  id: uuid("id").defaultRandom().primaryKey(),

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  logoId: uuid("logo_id").references(() => files.id, {
    onDelete: "set null",
  }),
  status: brandStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
