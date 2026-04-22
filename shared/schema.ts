import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Aggregate analysis sessions
export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

// Individual aggregate samples within a session
export const aggregates = sqliteTable("aggregates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id"),
  name: text("name").notNull(),
  aggregateType: text("aggregate_type").notNull(), // basalt | granite | limestone | other
  porosity: real("porosity"),       // %
  waterAbsorption: real("water_absorption"), // %
  moistureContent: real("moisture_content"), // %
  sio2: real("sio2"),              // %
  cao: real("cao"),                // %
  fe2o3: real("fe2o3"),            // %
  al2o3: real("al2o3"),            // %
  projectType: text("project_type"), // highway | urban | rural | coastal
  notes: text("notes"),
});

export const insertAggregateSchema = createInsertSchema(aggregates).omit({ id: true });
export type InsertAggregate = z.infer<typeof insertAggregateSchema>;
export type Aggregate = typeof aggregates.$inferSelect;
