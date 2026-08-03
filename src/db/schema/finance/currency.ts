import {
  pgTable,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { idColumn } from "../common/base-columns";

export const currencies = pgTable("currencies", {
  ...idColumn,

  code: varchar("code", { length: 10 }).notNull().unique(),
  symbol: varchar("symbol", { length: 10 }),
  name: varchar("name", { length: 100 }).notNull(),
});
