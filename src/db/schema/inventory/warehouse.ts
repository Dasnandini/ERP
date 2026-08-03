import { pgEnum, pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

import { companies } from "../core/company";
import { addresses } from "../common/address";
import { users } from "../core/user";

export const warehouseStatusEnum = pgEnum("warehouse_status", [
  "active",
  "inactive",
  "archived",
]);

export const warehouses = pgTable("warehouses", {
  id: uuid("id").defaultRandom().primaryKey(),

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  warehouseCode: varchar("warehouse_code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  addressId: uuid("address_id").references(() => addresses.id, {
    onDelete: "set null",
  }),
  managerId: uuid("manager_id").references(() => users.id, {
    onDelete: "set null",
  }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  status: warehouseStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
