import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { idColumn } from "../common/base-columns";
import { companies } from "../core/company";

export const fiscalYears = pgTable("fiscal_years", {
  ...idColumn,

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  name: varchar("name", { length: 50 }).notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  isCurrent: boolean("is_current").default(false).notNull(),
  isClosed: boolean("is_closed").default(false).notNull(),
});
