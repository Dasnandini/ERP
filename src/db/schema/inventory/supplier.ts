import {
  pgEnum,
  pgTable,
  text,
  uuid,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

import { companies } from "../core/company";
import { addresses } from "../common/address";

export const supplierStatusEnum = pgEnum("supplier_status", [
  "active",
  "inactive",
  "blocked",
]);

export const suppliers = pgTable("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  supplierCode: varchar("supplier_code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  gstNumber: varchar("gst_number", { length: 15 }),
  panNumber: varchar("pan_number", { length: 10 }),
  addressId: uuid("address_id").references(() => addresses.id, {
    onDelete: "set null",
  }),
  website: varchar("website", { length: 255 }),
  contactPerson: varchar("contact_person", { length: 255 }),
  status: supplierStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
