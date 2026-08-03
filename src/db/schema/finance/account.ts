import {
  boolean,
  numeric,
  pgEnum,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { idColumn, timestamps } from "../common/base-columns";
import { companies } from "../core/company";
import { accountGroups } from "./account-group";

export const accountStatusEnum = pgEnum("account_status", [
  "active",
  "inactive",
  "archived",
]);

export const accounts = pgTable("accounts", {
  ...idColumn,

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  accountGroupId: uuid("account_group_id")
    .references(() => accountGroups.id, { onDelete: "set null" }),

  accountCode: varchar("account_code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  openingBalance: numeric("opening_balance", { precision: 12, scale: 2 }).default("0"),
  currentBalance: numeric("current_balance", { precision: 12, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).default("INR"),
  isSystem: boolean("is_system").default(false).notNull(),
  status: accountStatusEnum("status").default("active").notNull(),

  ...timestamps,
});
