import {
  boolean,
  date,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { employees } from "./employee";
import { files } from "../common/file";
import { users } from "../core/user";

export const employeeDocuments = pgTable(
  "employee_documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),
    fileId: uuid("file_id").references(() => files.id, { onDelete: "set null" }),
    documentType: varchar("document_type", { length: 100 }).notNull(),
    documentNumber: varchar("document_number", { length: 100 }),
    expiryDate: date("expiry_date"),
    verified: boolean("verified").default(false).notNull(),
    uploadedBy: uuid("uploaded_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    employeeIdx: index("employee_documents_employee_id_idx").on(table.employeeId),
    typeIdx: index("employee_documents_type_idx").on(table.documentType),
    expiryIdx: index("employee_documents_expiry_date_idx").on(table.expiryDate),
  }),
);

export const employeeDocumentRelations = relations(employeeDocuments, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeDocuments.employeeId],
    references: [employees.id],
  }),
  file: one(files, {
    fields: [employeeDocuments.fileId],
    references: [files.id],
  }),
  uploadedByUser: one(users, {
    fields: [employeeDocuments.uploadedBy],
    references: [users.id],
  }),
}));
