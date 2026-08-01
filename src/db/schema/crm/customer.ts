import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { addresses } from "../common/address";
import { activeColumn, auditColumns, idColumn, softDelete, timestamps } from "../common/base-columns";
import { companies } from "../core/company";
import { users } from "../core/user";

export const customerTypeEnum = pgEnum("customer_type", [
  "individual",
  "business",
  "enterprise",
]);

export const customerStatusEnum = pgEnum("customer_status", [
  "active",
  "inactive",
  "prospect",
  "archived",
]);

export const customers = pgTable("customers", {
  ...idColumn,

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  customerCode: varchar("customer_code", { length: 50 }).notNull().unique(),
  customerType: customerTypeEnum("customer_type")
    .default("business")
    .notNull(),

  name: varchar("name", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  website: varchar("website", { length: 255 }),
  gstNumber: varchar("gst_number", { length: 50 }),
  panNumber: varchar("pan_number", { length: 20 }),

  addressId: uuid("address_id").references(() => addresses.id, {
    onDelete: "set null",
  }),

  industry: varchar("industry", { length: 100 }),
  annualRevenue: numeric("annual_revenue", { precision: 12, scale: 2 }),
  employeeCount: integer("employee_count"),

  status: customerStatusEnum("status").default("active").notNull(),

  assignedTo: uuid("assigned_to").references(() => users.id, {
    onDelete: "set null",
  }),

  ...timestamps,
  ...softDelete,
  ...auditColumns,
  ...activeColumn,
});
