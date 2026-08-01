import {
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
import { leadSources } from "./lead-source";
import { leadStages } from "./lead-stage";

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
]);

export const leads = pgTable("leads", {
  ...idColumn,

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  leadCode: varchar("lead_code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  companyName: varchar("company_name", { length: 255 }),
  website: varchar("website", { length: 255 }),

  sourceId: uuid("source_id").references(() => leadSources.id, {
    onDelete: "set null",
  }),
  stageId: uuid("stage_id").references(() => leadStages.id, {
    onDelete: "set null",
  }),

  estimatedValue: numeric("estimated_value", { precision: 12, scale: 2 }),
  assignedTo: uuid("assigned_to").references(() => users.id, {
    onDelete: "set null",
  }),
  expectedCloseDate: timestamp("expected_close_date", { withTimezone: true }),
  description: text("description"),

  status: leadStatusEnum("status").default("new").notNull(),

  ...timestamps,
  ...softDelete,
  ...auditColumns,
  ...activeColumn,
});
