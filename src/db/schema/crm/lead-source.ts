import {
  boolean,
  integer,
  pgTable,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { activeColumn, idColumn, timestamps } from "../common/base-columns";
import { companies } from "../core/company";

export const leadSources = pgTable("lead_sources", {
  ...idColumn,

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 20 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),

  ...timestamps,
  ...activeColumn,
});
