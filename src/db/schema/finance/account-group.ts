import {
  boolean,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { idColumn, timestamps } from "../common/base-columns";
import { companies } from "../core/company";

export const accountGroups = pgTable("account_groups", {
  ...idColumn,

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  parentId: uuid("parent_id"),
  description: text("description"),
  isSystem: boolean("is_system").default(false).notNull(),

  ...timestamps,
});
