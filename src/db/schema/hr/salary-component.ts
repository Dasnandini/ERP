import {
  index,
  numeric,
  pgTable,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { salaryStructures } from "./salary-structure";

export const salaryComponents = pgTable(
  "salary_components",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    salaryStructureId: uuid("salary_structure_id")
      .references(() => salaryStructures.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    type: varchar("type", { length: 50 }).default("earning"),
    amount: numeric("amount", { precision: 12, scale: 2 }).default("0"),
    percentage: numeric("percentage", { precision: 5, scale: 2 }).default("0"),
  },
  (table) => ({
    salaryStructureIdx: index("salary_components_salary_structure_id_idx").on(
      table.salaryStructureId,
    ),
    nameIdx: index("salary_components_name_idx").on(table.name),
  }),
);

export const salaryComponentRelations = relations(salaryComponents, ({ one }) => ({
  salaryStructure: one(salaryStructures, {
    fields: [salaryComponents.salaryStructureId],
    references: [salaryStructures.id],
  }),
}));
