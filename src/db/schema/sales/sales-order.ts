import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";

import { companies } from "../core/company";
import { quotations } from "./quotation";

export const salesOrderStatusEnum = pgEnum("sales_order_status", [
  "draft",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
]);

export const salesOrders = pgTable("sales_orders", {
  id: uuid("id").defaultRandom().primaryKey(),

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  customerId: uuid("customer_id"),
  quotationId: uuid("quotation_id").references(() => quotations.id, {
    onDelete: "set null",
  }),

  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  orderDate: timestamp("order_date", { withTimezone: true }).defaultNow().notNull(),
  status: salesOrderStatusEnum("status").default("draft").notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).default("0").notNull(),
  tax: numeric("tax", { precision: 12, scale: 2 }).default("0").notNull(),
  discount: numeric("discount", { precision: 12, scale: 2 }).default("0").notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).default("0").notNull(),
});
