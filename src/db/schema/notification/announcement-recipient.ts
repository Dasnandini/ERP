import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

import { announcements } from "./announcement";
import { users } from "../core/user";

export const announcementRecipients = pgTable("announcement_recipients", {
  id: uuid("id").defaultRandom().primaryKey(),

  announcementId: uuid("announcement_id")
    .references(() => announcements.id, { onDelete: "cascade" })
    .notNull(),

  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  readAt: timestamp("read_at", { withTimezone: true }),
});
