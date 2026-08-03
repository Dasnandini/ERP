import {
  numeric,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { idColumn } from "../common/base-columns";
import { accounts } from "./account";
import { journalEntries } from "./journal-entry";

export const journalEntryLines = pgTable("journal_entry_lines", {
  ...idColumn,

  journalEntryId: uuid("journal_entry_id")
    .references(() => journalEntries.id, { onDelete: "cascade" })
    .notNull(),

  accountId: uuid("account_id")
    .references(() => accounts.id, { onDelete: "restrict" })
    .notNull(),

  debit: numeric("debit", { precision: 12, scale: 2 }).default("0"),
  credit: numeric("credit", { precision: 12, scale: 2 }).default("0"),
  description: text("description"),
});
