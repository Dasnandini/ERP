import { pgEnum, pgTable, uuid, text, numeric, timestamp } from "drizzle-orm/pg-core";

import { invoices } from "./invoice";
import { products } from "../inventory/product";

export const salesReturnStatusEnum = pgEnum("sales_return_status", [
  "requested",
  "approved",
  "rejected",
]);

export const salesReturns = pgTable("sales_returns", {
  id: uuid("id").defaultRandom().primaryKey(),

  invoiceId: uuid("invoice_id")
    .references(() => invoices.id, { onDelete: "cascade" })
    .notNull(),

  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),

  quantity: numeric("quantity", { precision: 12, scale: 2 }).default("0").notNull(),
  reason: text("reason"),
  refundAmount: numeric("refund_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  status: salesReturnStatusEnum("status").default("requested").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
