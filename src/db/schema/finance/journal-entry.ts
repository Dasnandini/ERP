import {
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

export const journalEntryStatusEnum = pgEnum("journal_entry_status", [
  "draft",
  "posted",
  "approved",
  "cancelled",
]);

export const journalEntries = pgTable("journal_entries", {
  ...idColumn,

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  voucherNumber: varchar("voucher_number", { length: 50 }).notNull().unique(),
  journalDate: timestamp("journal_date", { withTimezone: true }).notNull(),
  description: text("description"),
  status: journalEntryStatusEnum("status").default("draft").notNull(),
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  approvedBy: uuid("approved_by").references(() => users.id, {
    onDelete: "set null",
  }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),

  ...timestamps,
});
