import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  numeric,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { companies } from "../core/company";
import { vendors } from "./vendor";
import { warehouses } from "../inventory/warehouse";

export const purchaseOrderStatusEnum = pgEnum("purchase_order_status", [
  "draft",
  "submitted",
  "approved",
  "received",
  "cancelled",
]);

export const purchaseOrders = pgTable("purchase_orders", {
  id: uuid("id").defaultRandom().primaryKey(),

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  vendorId: uuid("vendor_id")
    .references(() => vendors.id, { onDelete: "set null" })
    .notNull(),

  warehouseId: uuid("warehouse_id")
    .references(() => warehouses.id, { onDelete: "set null" }),

  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  orderDate: timestamp("order_date", { withTimezone: true }).defaultNow().notNull(),
  expectedDate: timestamp("expected_date", { withTimezone: true }),
  status: purchaseOrderStatusEnum("status").default("draft").notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).default("0").notNull(),
  tax: numeric("tax", { precision: 12, scale: 2 }).default("0").notNull(),
  discount: numeric("discount", { precision: 12, scale: 2 }).default("0").notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).default("0").notNull(),
  remarks: text("remarks"),
  createdBy: uuid("created_by"),
  approvedBy: uuid("approved_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
