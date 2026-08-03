import {
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { idColumn, timestamps } from "../common/base-columns";
import { companies } from "../core/company";
import { accounts } from "./account";
import { paymentMethods } from "./payment-method";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "debit",
  "credit",
]);

export const transactions = pgTable("transactions", {
  ...idColumn,

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  accountId: uuid("account_id")
    .references(() => accounts.id, { onDelete: "restrict" })
    .notNull(),

  paymentMethodId: uuid("payment_method_id").references(() => paymentMethods.id, {
    onDelete: "set null",
  }),

  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: uuid("reference_id"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  transactionDate: timestamp("transaction_date", { withTimezone: true }).notNull(),
  transactionType: transactionTypeEnum("transaction_type").default("debit").notNull(),
  description: text("description"),

  ...timestamps,
});
