import { boolean, pgTable, uuid, integer, timestamp } from "drizzle-orm/pg-core";

import { products } from "./product";
import { files } from "../common/file";

export const productImages = pgTable("product_images", {
  id: uuid("id").defaultRandom().primaryKey(),

  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),

  fileId: uuid("file_id")
    .references(() => files.id, { onDelete: "cascade" })
    .notNull(),

  isPrimary: boolean("is_primary").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
