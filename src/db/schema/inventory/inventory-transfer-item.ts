import { pgTable, uuid, numeric } from "drizzle-orm/pg-core";

import { inventoryTransfers } from "./inventory-transfer";
import { products } from "./product";

export const inventoryTransferItems = pgTable("inventory_transfer_items", {
  id: uuid("id").defaultRandom().primaryKey(),

  transferId: uuid("transfer_id")
    .references(() => inventoryTransfers.id, { onDelete: "cascade" })
    .notNull(),

  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),

  quantity: numeric("quantity", { precision: 12, scale: 2 }).default("0").notNull(),
});
