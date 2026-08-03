import { pgEnum, pgTable, uuid, varchar, numeric, timestamp } from "drizzle-orm/pg-core";

import { purchaseOrders } from "./purchase-order";

export const purchaseBillStatusEnum = pgEnum("purchase_bill_status", [
  "draft",
  "paid",
  "partial",
  "overdue",
]);

export const purchaseBills = pgTable("purchase_bills", {
  id: uuid("id").defaultRandom().primaryKey(),

  purchaseOrderId: uuid("purchase_order_id")
    .references(() => purchaseOrders.id, { onDelete: "set null" })
    .notNull(),

  billNumber: varchar("bill_number", { length: 50 }).notNull().unique(),
  billDate: timestamp("bill_date", { withTimezone: true }).defaultNow().notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).default("0").notNull(),
  tax: numeric("tax", { precision: 12, scale: 2 }).default("0").notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).default("0").notNull(),
  status: purchaseBillStatusEnum("status").default("draft").notNull(),
});
