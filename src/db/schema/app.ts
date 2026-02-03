import { Many, relations } from "drizzle-orm";
import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};
export const department = pgTable("department", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }),
  ...timestamps,
});
export const subjects = pgTable("subjects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  departmentId: integer("department_id")
    .notNull()
    .references(() => department.id, { onDelete: "restrict" }),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  ...timestamps,
});

// Define the relationship: one department can have many subjects
export const departmentRelations = relations(department, ({ many }) => ({
  subjects: many(subjects),
}));

// Define the reverse relationship: each subject belongs to one department
// Links subjects.departmentId to department.id
export const subjectRelation = relations(subjects, ({ one, many }) => ({
  department: one(department, {
    fields: [subjects.departmentId],
    references: [department.id],
  }),
}));

// Automatically infer the TypeScript type for inserting a new department record
export type Department = typeof department.$inferInsert;
// Type for creating a new department (inferred from the department table schema)
export type NewDepartment = typeof department.$inferInsert;
// Type for creating a new subject (inferred from the subjects table schema)
export type Subject = typeof subjects.$inferInsert;
// Type for creating a new subject (inferred from the subjects table schema)
export type NewSubject = typeof subjects.$inferInsert;
