// src/db/schema/index.ts
import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Common timestamps
const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
};

// Department table
export const department = pgTable("department", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }),
  ...timestamps,
});

// Subjects table
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

// Users table for demo CRUD
export const demoUsers = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  ...timestamps,
});

// Relations
export const departmentRelations = relations(department, ({ many }) => ({
  subjects: many(subjects),
}));

export const subjectRelations = relations(subjects, ({ one }) => ({
  department: one(department, {
    fields: [subjects.departmentId],
    references: [department.id],
  }),
}));

// TypeScript types
export type Department = typeof department.$inferInsert;
export type NewDepartment = typeof department.$inferInsert;
export type Subject = typeof subjects.$inferInsert;
export type NewSubject = typeof subjects.$inferInsert;
export type User = typeof demoUsers.$inferInsert;
