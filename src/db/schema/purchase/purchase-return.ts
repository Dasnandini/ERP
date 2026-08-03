import { pgEnum, pgTable, uuid, text, numeric, timestamp } from "drizzle-orm/pg-core";

import { purchaseBills } from "./purchase-bill";
import { products } from "../inventory/product";

export const purchaseReturnStatusEnum = pgEnum("purchase_return_status", [
  "requested",
  "approved",
  "rejected",
]);

export const purchaseReturns = pgTable("purchase_returns", {
  id: uuid("id").defaultRandom().primaryKey(),

  purchaseBillId: uuid("purchase_bill_id")
    .references(() => purchaseBills.id, { onDelete: "cascade" })
    .notNull(),

  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),

  quantity: numeric("quantity", { precision: 12, scale: 2 }).default("0").notNull(),
  reason: text("reason"),
  refundAmount: numeric("refund_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  status: purchaseReturnStatusEnum("status").default("requested").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
