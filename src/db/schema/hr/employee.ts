import {
  check,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgSequence,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm/_relations";
import { companies } from "../core/company";
import { users } from "../core/user";
import { addresses } from "../common/address";
import { departments } from "./department";
import { designations } from "./designation";
import { activeColumn, auditColumns, idColumn, timestamps } from "../common/base-columns";

export const employmentTypeEnum = pgEnum("employment_type", [
  "full_time",
  "part_time",
  "intern",
  "contract",
  "freelancer",
]);

export const employeeStatusEnum = pgEnum("employee_status", [
  "active",
  "resigned",
  "terminated",
  "on_leave",
]);

export const employeeCodeSeq = pgSequence("employee_code_seq");

export const employees = pgTable(
  "employees",
  {
    ...idColumn,

    companyId: uuid("company_id")
      .references(() => companies.id, { onDelete: "cascade" })
      .notNull(),

    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull()
      .unique(),

    employeeCode: varchar("employee_code", { length: 20 })
      .notNull()
      .unique()
      .default(sql`concat('EMP-', lpad(nextval('employee_code_seq')::text, 6, '0'))`),

    departmentId: uuid("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),

    designationId: uuid("designation_id").references(() => designations.id, {
      onDelete: "set null",
    }),

    managerId: uuid("manager_id").references((): any => employees.id, {
      onDelete: "set null",
    }),

    joiningDate: date("joining_date"),
    probationEndDate: date("probation_end_date"),
    employmentType: employmentTypeEnum("employment_type").default("full_time"),
    salary: numeric("salary", { precision: 12, scale: 2 }).default("0"),
    gender: varchar("gender", { length: 20 }),
    dob: date("dob"),
    bloodGroup: varchar("blood_group", { length: 10 }),
    maritalStatus: varchar("marital_status", { length: 30 }),
    emergencyContact: varchar("emergency_contact", { length: 50 }),
    addressId: uuid("address_id").references(() => addresses.id, {
      onDelete: "set null",
    }),
    status: employeeStatusEnum("status").default("active").notNull(),

    ...timestamps,
    ...activeColumn,
    ...auditColumns,
  },
  (table) => ({
    companyIdx: index("employees_company_id_idx").on(table.companyId),
    departmentIdx: index("employees_department_id_idx").on(table.departmentId),
    designationIdx: index("employees_designation_id_idx").on(table.designationId),
    managerIdx: index("employees_manager_id_idx").on(table.managerId),
    companyCodeUniqueIdx: uniqueIndex("employees_company_code_unique_idx").on(
      table.companyId,
      table.employeeCode,
    ),
    emailUserIdx: index("employees_user_id_idx").on(table.userId),
    employeeDateCheck: check(
      "employees_probation_date_check",
      sql`${table.probationEndDate} IS NULL OR ${table.probationEndDate} >= ${table.joiningDate}`,
    ),
  }),
);

export const employeeRelations = relations(employees, ({ one }) => ({
  company: one(companies, {
    fields: [employees.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  department: one(departments, {
    fields: [employees.departmentId],
    references: [departments.id],
  }),
  designation: one(designations, {
    fields: [employees.designationId],
    references: [designations.id],
  }),
  address: one(addresses, {
    fields: [employees.addressId],
    references: [addresses.id],
  }),
}));
