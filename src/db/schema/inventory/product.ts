import {
  boolean,
  numeric,
  pgEnum,
  pgTable,
  text,
  uuid,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

import { companies } from "../core/company";
import { categories } from "./category";
import { brands } from "./brand";
import { units } from "./unit";

export const productStatusEnum = pgEnum("product_status", [
  "active",
  "inactive",
  "archived",
]);

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  brandId: uuid("brand_id").references(() => brands.id, {
    onDelete: "set null",
  }),
  unitId: uuid("unit_id").references(() => units.id, {
    onDelete: "set null",
  }),

  productCode: varchar("product_code", { length: 50 }).notNull().unique(),
  sku: varchar("sku", { length: 100 }),
  barcode: varchar("barcode", { length: 100 }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  costPrice: numeric("cost_price", { precision: 12, scale: 2 }).default("0"),
  sellingPrice: numeric("selling_price", { precision: 12, scale: 2 }).default("0"),
  taxId: uuid("tax_id"),
  gstRateId: uuid("gst_rate_id"),
  reorderLevel: numeric("reorder_level", { precision: 12, scale: 2 }).default("0"),
  minimumStock: numeric("minimum_stock", { precision: 12, scale: 2 }).default("0"),
  maximumStock: numeric("maximum_stock", { precision: 12, scale: 2 }).default("0"),
  trackInventory: boolean("track_inventory").default(true).notNull(),
  allowNegativeStock: boolean("allow_negative_stock").default(false).notNull(),
  status: productStatusEnum("status").default("active").notNull(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
