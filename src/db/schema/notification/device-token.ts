import { pgEnum, pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

import { users } from "../core/user";

export const deviceTypeEnum = pgEnum("device_type", [
  "ios",
  "android",
  "web",
]);

export const deviceTokens = pgTable("device_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  deviceType: deviceTypeEnum("device_type").notNull(),
  token: varchar("token", { length: 500 }).notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }).defaultNow().notNull(),
});
