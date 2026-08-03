import { pgEnum, pgTable, text, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

import { companies } from "../core/company";
import { files } from "../common/file";

export const categoryStatusEnum = pgEnum("category_status", [
  "active",
  "inactive",
  "archived",
]);

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  parentId: uuid("parent_id").references((): any => categories.id, {
    onDelete: "set null",
  }),

  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  imageId: uuid("image_id").references(() => files.id, {
    onDelete: "set null",
  }),
  status: categoryStatusEnum("status").default("active").notNull(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
