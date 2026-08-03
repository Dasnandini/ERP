import {
  boolean,
  index,
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { employees } from "./employee";

export const employeeBanks = pgTable(
  "employee_banks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),
    accountHolderName: varchar("account_holder_name", { length: 150 }).notNull(),
    bankName: varchar("bank_name", { length: 150 }).notNull(),
    branch: varchar("branch", { length: 150 }),
    accountNumber: varchar("account_number", { length: 30 }).notNull(),
    ifsc: varchar("ifsc", { length: 20 }),
    upiId: varchar("upi_id", { length: 100 }),
    isPrimary: boolean("is_primary").default(false).notNull(),
  },
  (table) => ({
    employeeIdx: index("employee_banks_employee_id_idx").on(table.employeeId),
    employeeAccountUniqueIdx: uniqueIndex("employee_banks_account_unique_idx").on(
      table.employeeId,
      table.accountNumber,
    ),
  }),
);

export const employeeBankRelations = relations(employeeBanks, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeBanks.employeeId],
    references: [employees.id],
  }),
}));
