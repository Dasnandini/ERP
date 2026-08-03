import { pgEnum, pgTable, text, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

import { companies } from "../core/company";
import { warehouses } from "./warehouse";

export const adjustmentStatusEnum = pgEnum("adjustment_status", [
  "draft",
  "approved",
  "rejected",
]);

export const inventoryAdjustments = pgTable("inventory_adjustments", {
  id: uuid("id").defaultRandom().primaryKey(),

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  warehouseId: uuid("warehouse_id")
    .references(() => warehouses.id, { onDelete: "set null" }),

  reason: text("reason").notNull(),
  status: adjustmentStatusEnum("status").default("draft").notNull(),
  approvedBy: uuid("approved_by"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
