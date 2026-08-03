import {
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { idColumn, timestamps } from "../common/base-columns";
import { companies } from "../core/company";

export const incomeCategories = pgTable("income_categories", {
  ...idColumn,

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 20 }),

  ...timestamps,
});
