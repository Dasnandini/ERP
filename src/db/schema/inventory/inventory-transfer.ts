import { pgEnum, pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

import { companies } from "../core/company";
import { warehouses } from "./warehouse";

export const transferStatusEnum = pgEnum("transfer_status", [
  "draft",
  "approved",
  "in_transit",
  "completed",
  "rejected",
]);

export const inventoryTransfers = pgTable("inventory_transfers", {
  id: uuid("id").defaultRandom().primaryKey(),

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  fromWarehouseId: uuid("from_warehouse_id")
    .references(() => warehouses.id, { onDelete: "set null" })
    .notNull(),

  toWarehouseId: uuid("to_warehouse_id")
    .references(() => warehouses.id, { onDelete: "set null" })
    .notNull(),

  status: transferStatusEnum("status").default("draft").notNull(),
  approvedBy: uuid("approved_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
