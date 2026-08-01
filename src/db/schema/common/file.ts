import {
  pgTable,
  uuid,
  varchar,
  bigint,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const fileTypeEnum = pgEnum("file_type", [
  "image",
  "pdf",
  "document",
  "spreadsheet",
  "video",
  "other",
]);

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),

  fileName: varchar("file_name", { length: 255 }).notNull(),

  originalName: varchar("original_name", { length: 255 }).notNull(),

  url: varchar("url", { length: 500 }).notNull(),

  mimeType: varchar("mime_type", { length: 100 }).notNull(),

  size: bigint("size", { mode: "number" }).notNull(),

  type: fileTypeEnum("type").notNull(),

  uploadedAt: timestamp("uploaded_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});