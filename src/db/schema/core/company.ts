import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
  uuid ,
  pgEnum
} from "drizzle-orm/pg-core";
import { addresses } from "../common/address";
import { files } from "../common/file";
import { relations } from "drizzle-orm/_relations";
import { activeColumn, auditColumns, idColumn, softDelete, timestamps } from "../common/base-columns";
export const companyStatusEnum = pgEnum("company_status", [
    "active",
    "inactive",
    "suspended"
]);
export const companies = pgTable("companies", {
  ...idColumn,
    name: text("name").notNull(),

  email: varchar("email", { length: 255 }),

  phone: varchar("phone", { length: 20 }).notNull(),

  gstNumber: varchar("gst_number", { length: 15 }).unique(),

  pan: varchar("pan", { length: 10 }).unique(),

  website: varchar("website", { length: 255 }),

  industry: varchar("industry", { length: 100 }),

  currency: varchar("currency", { length: 3 }).default("INR"),

  timezone: varchar("timezone", { length: 64 }).default("Asia/Kolkata"),

  slug: varchar("slug", { length: 255 })
    .notNull()
    .unique(),

  status: companyStatusEnum("status")
    .default("active")
    .notNull(),

  logoFileId: uuid("logo_file_id").references(() => files.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),

  addressId: uuid("address_id").references(() => addresses.id, {
    onDelete: "set null",
  }),

  ...timestamps,

  ...softDelete,

  ...auditColumns,

  ...activeColumn,
});



export const companyRelations = relations(companies, ({ one }) => ({
  address: one(addresses, {
    fields: [companies.addressId],
    references: [addresses.id],
  }),

  logo: one(files, {
    fields: [companies.logoFileId],
    references: [files.id],
  }),
}));


