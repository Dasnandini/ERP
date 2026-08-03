import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  numeric,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { companies } from "../core/company";

export const quotationStatusEnum = pgEnum("quotation_status", [
  "draft",
  "sent",
  "accepted",
  "rejected",
]);

export const quotations = pgTable("quotations", {
  id: uuid("id").defaultRandom().primaryKey(),

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  quotationNumber: varchar("quotation_number", { length: 50 }).notNull().unique(),
  customerId: uuid("customer_id"),
  quotationDate: timestamp("quotation_date", { withTimezone: true }).defaultNow().notNull(),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  status: quotationStatusEnum("status").default("draft").notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).default("0").notNull(),
  tax: numeric("tax", { precision: 12, scale: 2 }).default("0").notNull(),
  discount: numeric("discount", { precision: 12, scale: 2 }).default("0").notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).default("0").notNull(),
  notes: text("notes"),
});
