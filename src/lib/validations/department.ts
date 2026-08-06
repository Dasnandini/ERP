import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z
    .string()
    .min(1, "Department name is required")
    .max(150, "Department name must be less than 150 characters")
    .trim(),
  code: z
    .string()
    .max(50, "Department code must be less than 50 characters")
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  managerId: z
    .string()
    .uuid("Invalid manager ID format")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
