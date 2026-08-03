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
import { users } from "../core/user";
import { accounts } from "./account";
import { incomeCategories } from "./income-category";
import { paymentMethods } from "./payment-method";

export const incomeStatusEnum = pgEnum("income_status", [
  "draft",
  "submitted",
  "approved",
  "received",
  "cancelled",
]);

export const incomes = pgTable("incomes", {
  ...idColumn,

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  incomeNumber: varchar("income_number", { length: 50 }).notNull().unique(),
  categoryId: uuid("category_id")
    .references(() => incomeCategories.id, { onDelete: "set null" }),
  customerId: uuid("customer_id"),
  accountId: uuid("account_id")
    .references(() => accounts.id, { onDelete: "restrict" })
    .notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  incomeDate: timestamp("income_date", { withTimezone: true }).notNull(),
  paymentMethodId: uuid("payment_method_id").references(() => paymentMethods.id, {
    onDelete: "set null",
  }),
  notes: text("notes"),
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  updatedBy: uuid("updated_by").references(() => users.id, {
    onDelete: "set null",
  }),

  ...timestamps,
});
