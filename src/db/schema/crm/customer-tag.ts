import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";

import { customers } from "./customer";
import { tags } from "./tag";

export const customerTags = pgTable(
  "customer_tags",
  {
    customerId: uuid("customer_id")
      .references(() => customers.id, { onDelete: "cascade" })
      .notNull(),
    tagId: uuid("tag_id")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.customerId, table.tagId] }),
  }),
);
