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
import { expenseCategories } from "./expense-category";
import { paymentMethods } from "./payment-method";
import { files } from "../common/file";

export const expenseStatusEnum = pgEnum("expense_status", [
  "draft",
  "submitted",
  "approved",
  "paid",
  "cancelled",
]);

export const expenses = pgTable("expenses", {
  ...idColumn,

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  expenseNumber: varchar("expense_number", { length: 50 }).notNull().unique(),
  categoryId: uuid("category_id")
    .references(() => expenseCategories.id, { onDelete: "set null" }),
  vendorId: uuid("vendor_id"),
  accountId: uuid("account_id")
    .references(() => accounts.id, { onDelete: "restrict" })
    .notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  expenseDate: timestamp("expense_date", { withTimezone: true }).notNull(),
  paymentMethodId: uuid("payment_method_id").references(() => paymentMethods.id, {
    onDelete: "set null",
  }),
  receiptFileId: uuid("receipt_file_id").references(() => files.id, {
    onDelete: "set null",
  }),
  status: expenseStatusEnum("status").default("draft").notNull(),
  notes: text("notes"),
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  updatedBy: uuid("updated_by").references(() => users.id, {
    onDelete: "set null",
  }),

  ...timestamps,
});
