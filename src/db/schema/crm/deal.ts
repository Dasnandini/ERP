import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { activeColumn, auditColumns, idColumn, softDelete, timestamps } from "../common/base-columns";
import { companies } from "../core/company";
import { users } from "../core/user";
import { customers } from "./customer";
import { dealStages } from "./deal-stage";
import { leads } from "./lead";

export const dealStatusEnum = pgEnum("deal_status", [
  "open",
  "won",
  "lost",
  "closed",
]);

export const deals = pgTable("deals", {
  ...idColumn,

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  leadId: uuid("lead_id").references(() => leads.id, {
    onDelete: "set null",
  }),
  customerId: uuid("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),

  dealCode: varchar("deal_code", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }),
  stageId: uuid("stage_id").references(() => dealStages.id, {
    onDelete: "set null",
  }),
  probability: integer("probability").default(0).notNull(),
  assignedTo: uuid("assigned_to").references(() => users.id, {
    onDelete: "set null",
  }),
  expectedCloseDate: timestamp("expected_close_date", { withTimezone: true }),
  actualCloseDate: timestamp("actual_close_date", { withTimezone: true }),
  description: text("description"),

  status: dealStatusEnum("status").default("open").notNull(),

  ...timestamps,
  ...softDelete,
  ...auditColumns,
  ...activeColumn,
});
