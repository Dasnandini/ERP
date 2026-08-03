import { pgTable, uuid, numeric } from "drizzle-orm/pg-core";

import { salesOrders } from "./sales-order";
import { products } from "../inventory/product";

export const salesOrderItems = pgTable("sales_order_items", {
  id: uuid("id").defaultRandom().primaryKey(),

  salesOrderId: uuid("sales_order_id")
    .references(() => salesOrders.id, { onDelete: "cascade" })
    .notNull(),

  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),

  quantity: numeric("quantity", { precision: 12, scale: 2 }).default("0").notNull(),
  deliveredQuantity: numeric("delivered_quantity", { precision: 12, scale: 2 }).default("0").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).default("0").notNull(),
  tax: numeric("tax", { precision: 12, scale: 2 }).default("0").notNull(),
  discount: numeric("discount", { precision: 12, scale: 2 }).default("0").notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).default("0").notNull(),
});
