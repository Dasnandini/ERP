import {
  boolean,
  date,
  index,
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { companies } from "../core/company";
import { idColumn } from "../common/base-columns";

export const holidays = pgTable(
  "holidays",
  {
    ...idColumn,

    companyId: uuid("company_id")
      .references(() => companies.id, { onDelete: "cascade" })
      .notNull(),

    name: varchar("name", { length: 150 }).notNull(),
    holidayDate: date("holiday_date").notNull(),
    type: varchar("type", { length: 50 }).default("public"),
    optional: boolean("optional").default(false).notNull(),
  },
  (table) => ({
    companyIdx: index("holidays_company_id_idx").on(table.companyId),
    companyDateUniqueIdx: uniqueIndex("holidays_company_date_unique_idx").on(
      table.companyId,
      table.holidayDate,
    ),
  }),
);

export const holidayRelations = relations(holidays, ({ one }) => ({
  company: one(companies, {
    fields: [holidays.companyId],
    references: [companies.id],
  }),
}));
