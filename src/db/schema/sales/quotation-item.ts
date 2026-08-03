import { pgTable, uuid, numeric } from "drizzle-orm/pg-core";

import { quotations } from "./quotation";
import { products } from "../inventory/product";

export const quotationItems = pgTable("quotation_items", {
  id: uuid("id").defaultRandom().primaryKey(),

  quotationId: uuid("quotation_id")
    .references(() => quotations.id, { onDelete: "cascade" })
    .notNull(),

  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),

  quantity: numeric("quantity", { precision: 12, scale: 2 }).default("0").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).default("0").notNull(),
  discount: numeric("discount", { precision: 12, scale: 2 }).default("0").notNull(),
  tax: numeric("tax", { precision: 12, scale: 2 }).default("0").notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).default("0").notNull(),
});
