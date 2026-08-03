import { pgEnum, pgTable, uuid, varchar, numeric, timestamp } from "drizzle-orm/pg-core";

import { invoices } from "./invoice";

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
]);

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),

  invoiceId: uuid("invoice_id")
    .references(() => invoices.id, { onDelete: "cascade" })
    .notNull(),

  paymentMethodId: uuid("payment_method_id"),
  transactionId: varchar("transaction_id", { length: 100 }),
  amount: numeric("amount", { precision: 12, scale: 2 }).default("0").notNull(),
  paymentDate: timestamp("payment_date", { withTimezone: true }).defaultNow().notNull(),
  referenceNumber: varchar("reference_number", { length: 100 }),
  status: paymentStatusEnum("status").default("pending").notNull(),
});
