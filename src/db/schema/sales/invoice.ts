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
import { salesOrders } from "./sales-order";

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "partial",
  "overdue",
]);

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  customerId: uuid("customer_id"),
  salesOrderId: uuid("sales_order_id").references(() => salesOrders.id, {
    onDelete: "set null",
  }),

  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  invoiceDate: timestamp("invoice_date", { withTimezone: true }).defaultNow().notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }),
  status: invoiceStatusEnum("status").default("draft").notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).default("0").notNull(),
  tax: numeric("tax", { precision: 12, scale: 2 }).default("0").notNull(),
  discount: numeric("discount", { precision: 12, scale: 2 }).default("0").notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).default("0").notNull(),
  balance: numeric("balance", { precision: 12, scale: 2 }).default("0").notNull(),
  notes: text("notes"),
});
