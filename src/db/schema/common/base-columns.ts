// db/schema/common/base-columns.ts

import {
  uuid,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const idColumn = {
  id: uuid("id").defaultRandom().primaryKey(),
};

export const timestamps = {
  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow().notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  }).defaultNow().notNull(),
};

export const softDelete = {
  deletedAt: timestamp("deleted_at", {
    withTimezone: true,
  }),
};

export const activeColumn = {
  isActive: boolean("is_active")
    .default(true)
    .notNull(),
};

export const auditColumns = {
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  deletedBy: uuid("deleted_by"),
};