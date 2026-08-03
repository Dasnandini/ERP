import {
  boolean,
  index,
  integer,
  pgTable,
  time,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { companies } from "../core/company";
import { activeColumn, idColumn } from "../common/base-columns";

export const shifts = pgTable(
  "shifts",
  {
    ...idColumn,

    companyId: uuid("company_id")
      .references(() => companies.id, { onDelete: "cascade" })
      .notNull(),

    name: varchar("name", { length: 100 }).notNull(),
    startTime: time("start_time", { precision: 0 }).notNull(),
    endTime: time("end_time", { precision: 0 }).notNull(),
    graceMinutes: integer("grace_minutes").default(0).notNull(),
    weeklyOff: varchar("weekly_off", { length: 20 }),
    isNightShift: boolean("is_night_shift").default(false).notNull(),

    ...activeColumn,
  },
  (table) => ({
    companyIdx: index("shifts_company_id_idx").on(table.companyId),
    companyNameUniqueIdx: uniqueIndex("shifts_company_name_unique_idx").on(
      table.companyId,
      table.name,
    ),
  }),
);

export const shiftRelations = relations(shifts, ({ one }) => ({
  company: one(companies, {
    fields: [shifts.companyId],
    references: [companies.id],
  }),
}));
