import { pgTable, uuid, numeric } from "drizzle-orm/pg-core";

import { purchaseOrders } from "./purchase-order";
import { products } from "../inventory/product";

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: uuid("id").defaultRandom().primaryKey(),

  purchaseOrderId: uuid("purchase_order_id")
    .references(() => purchaseOrders.id, { onDelete: "cascade" })
    .notNull(),

  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),

  quantity: numeric("quantity", { precision: 12, scale: 2 }).default("0").notNull(),
  receivedQuantity: numeric("received_quantity", { precision: 12, scale: 2 }).default("0").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).default("0").notNull(),
  discount: numeric("discount", { precision: 12, scale: 2 }).default("0").notNull(),
  tax: numeric("tax", { precision: 12, scale: 2 }).default("0").notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).default("0").notNull(),
});
