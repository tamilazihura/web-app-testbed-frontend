import { z } from "zod";

export const InputColumnSchema = z
  .object({
    col_name: z.string().min(1, "Enter all column names."),
    data_type: z.string().min(1, "Select data types for every column."),
    is_primary_key: z.boolean(),
    is_unique: z.boolean(),
    foreign_key: z.string().optional(),
    relationship: z.string().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    example: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.data_type === "foreign_key") {
      if (!data.foreign_key?.trim()) {
        ctx.addIssue({
          path: ["foreign_key"],
          message:
            "A foreign key reference is required when the data type is 'foreign_key'.",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.relationship?.trim()) {
        ctx.addIssue({
          path: ["relationship"],
          message:
            "Specify the relationship when the data type is 'foreign_key'.",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

const TableSchema = z
  .object({
    name: z.string().min(1, "Provide all table names."),
    fields: z
      .array(InputColumnSchema)
      .min(2, "Every table must have at least two columns."),
    count: z.number().min(1, "Row count must be at least 1."),
  })
  .refine((data) => data.fields.some((field) => field.is_primary_key), {
    message: "Each table must have at least one primary key column.",
    path: ["fields"],
  });

export const TablesFormSchema = z.object({
  tables: z.array(TableSchema),
});

export type InputColumn = z.infer<typeof InputColumnSchema>;
export type Table = z.infer<typeof TableSchema>;
