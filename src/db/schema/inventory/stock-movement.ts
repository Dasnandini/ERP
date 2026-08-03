import { pgEnum, pgTable, text, uuid, varchar, numeric, timestamp } from "drizzle-orm/pg-core";

import { companies } from "../core/company";
import { warehouses } from "./warehouse";
import { products } from "./product";

export const stockMovementTypeEnum = pgEnum("stock_movement_type", [
  "IN",
  "OUT",
  "TRANSFER",
  "RETURN",
  "ADJUSTMENT",
]);

export const stockMovements = pgTable("stock_movements", {
  id: uuid("id").defaultRandom().primaryKey(),

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  warehouseId: uuid("warehouse_id")
    .references(() => warehouses.id, { onDelete: "set null" }),

  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),

  referenceType: varchar("reference_type", { length: 100 }),
  referenceId: uuid("reference_id"),
  movementType: stockMovementTypeEnum("movement_type").notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 2 }).default("0").notNull(),
  balanceAfter: numeric("balance_after", { precision: 12, scale: 2 }).default("0").notNull(),
  remarks: text("remarks"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
