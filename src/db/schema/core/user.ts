import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

import { files } from "../common/file";
import { relations } from "drizzle-orm/_relations";
import { memberships } from "./membership";
import { addresses } from "../common/address";
import { activeColumn, idColumn, softDelete, timestamps } from "../common/base-columns";

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "inactive",
  "blocked",
]);

export const users = pgTable("users", {
  ...idColumn,

  firstName: varchar("first_name", { length: 100 }).notNull(),

  lastName: varchar("last_name", { length: 100 }),

  email: varchar("email", { length: 255 }).notNull().unique(),

  phone: varchar("phone", { length: 20 }),

  passwordHash: text("password_hash"),

  profileImageId: uuid("profile_image_id").references(() => files.id, {
    onDelete: "set null",
  }),
 addressId: uuid("address_id").references(() => addresses.id, {
  onDelete: "set null",
  }),
  emailVerified: boolean("email_verified").default(false).notNull(),

  phoneVerified: boolean("phone_verified").default(false).notNull(),

  lastLoginAt: timestamp("last_login_at", {
    withTimezone: true,
  }),

  status: userStatusEnum("status")
    .default("active")
    .notNull(),

    ...timestamps,

    ...softDelete,

    ...activeColumn
    });



export const userRelations = relations(users, ({ one, many }) => ({
  profileImage: one(files, {
    fields: [users.profileImageId],
    references: [files.id],
  }),
  address: one(addresses, {
    fields: [users.addressId],
    references: [addresses.id],
    }),

  memberships: many(memberships),
}));