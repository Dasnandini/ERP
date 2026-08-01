import {
  boolean,
  integer,
  pgTable,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { activeColumn, idColumn, timestamps } from "../common/base-columns";
import { companies } from "../core/company";

export const leadStages = pgTable("lead_stages", {
  ...idColumn,

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 20 }),
  position: integer("position").default(0).notNull(),
  isClosed: boolean("is_closed").default(false).notNull(),
  isWon: boolean("is_won").default(false).notNull(),

  ...timestamps,
  ...activeColumn,
});
