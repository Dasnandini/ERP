import { pgEnum, pgTable, uuid, varchar, numeric, timestamp } from "drizzle-orm/pg-core";

import { purchaseBills } from "./purchase-bill";

export const purchasePaymentStatusEnum = pgEnum("purchase_payment_status", [
  "pending",
  "completed",
  "failed",
]);

export const purchasePayments = pgTable("purchase_payments", {
  id: uuid("id").defaultRandom().primaryKey(),

  purchaseBillId: uuid("purchase_bill_id")
    .references(() => purchaseBills.id, { onDelete: "cascade" })
    .notNull(),

  paymentMethodId: uuid("payment_method_id"),
  amount: numeric("amount", { precision: 12, scale: 2 }).default("0").notNull(),
  paymentDate: timestamp("payment_date", { withTimezone: true }).defaultNow().notNull(),
  referenceNumber: varchar("reference_number", { length: 100 }),
  status: purchasePaymentStatusEnum("status").default("pending").notNull(),
});
