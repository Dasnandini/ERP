import {
  boolean,
  pgTable,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { idColumn } from "../common/base-columns";
import { companies } from "../core/company";

export const paymentMethods = pgTable("payment_methods", {
  ...idColumn,

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  name: varchar("name", { length: 100 }).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});
