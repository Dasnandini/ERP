import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const addresses = pgTable("addresses", {
  id: uuid("id").defaultRandom().primaryKey(),

  addressLine1: varchar("address_line1", { length: 255 }).notNull(),
  addressLine2: varchar("address_line2", { length: 255 }),

  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),

  postalCode: varchar("postal_code", { length: 20 }).notNull(),

  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),

  isDefault: boolean("is_default").default(false),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});