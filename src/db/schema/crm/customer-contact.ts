import {
  boolean,
  pgTable,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { activeColumn, idColumn, timestamps } from "../common/base-columns";
import { customers } from "./customer";

export const customerContacts = pgTable("customer_contacts", {
  ...idColumn,

  customerId: uuid("customer_id")
    .references(() => customers.id, { onDelete: "cascade" })
    .notNull(),

  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  designation: varchar("designation", { length: 100 }),
  department: varchar("department", { length: 100 }),
  isPrimary: boolean("is_primary").default(false).notNull(),

  ...timestamps,
  ...activeColumn,
});
