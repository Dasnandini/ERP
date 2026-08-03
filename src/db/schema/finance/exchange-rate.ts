import {
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { idColumn } from "../common/base-columns";

export const exchangeRates = pgTable("exchange_rates", {
  ...idColumn,

  baseCurrency: varchar("base_currency", { length: 10 }).notNull(),
  targetCurrency: varchar("target_currency", { length: 10 }).notNull(),
  rate: numeric("rate", { precision: 12, scale: 6 }).notNull(),
  effectiveDate: timestamp("effective_date", { withTimezone: true }).notNull(),
});
