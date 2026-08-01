import {
  integer,
  pgTable,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { activeColumn, idColumn, timestamps } from "../common/base-columns";
import { companies } from "../core/company";

export const dealStages = pgTable("deal_stages", {
  ...idColumn,

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 20 }),
  position: integer("position").default(0).notNull(),

  ...timestamps,
  ...activeColumn,
});
