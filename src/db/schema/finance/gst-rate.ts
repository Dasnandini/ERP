import {
  boolean,
  numeric,
  pgTable,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { idColumn } from "../common/base-columns";
import { companies } from "../core/company";

export const gstRates = pgTable("gst_rates", {
  ...idColumn,

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  name: varchar("name", { length: 100 }).notNull(),
  percentage: numeric("percentage", { precision: 5, scale: 2 }).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
});
