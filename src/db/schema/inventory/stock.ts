import { numeric, pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

import { warehouses } from "./warehouse";
import { products } from "./product";

export const stocks = pgTable("stocks", {
  id: uuid("id").defaultRandom().primaryKey(),

  warehouseId: uuid("warehouse_id")
    .references(() => warehouses.id, { onDelete: "cascade" })
    .notNull(),

  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),

  availableQuantity: numeric("available_quantity", { precision: 12, scale: 2 }).default("0").notNull(),
  reservedQuantity: numeric("reserved_quantity", { precision: 12, scale: 2 }).default("0").notNull(),
  damagedQuantity: numeric("damaged_quantity", { precision: 12, scale: 2 }).default("0").notNull(),
  inTransitQuantity: numeric("in_transit_quantity", { precision: 12, scale: 2 }).default("0").notNull(),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).defaultNow().notNull(),
});
