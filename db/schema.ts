import { sql } from "drizzle-orm";
import { index, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Platform-authenticated identities. No password or API key is stored in D1.
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const scenarios = sqliteTable("scenarios", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_scenarios_user_id").on(table.userId)]);

export const scenarioInputs = sqliteTable("scenario_inputs", {
  scenarioId: text("scenario_id").notNull().references(() => scenarios.id),
  inputKey: text("input_key").notNull(),
  inputValue: text("input_value").notNull(),
}, (table) => [primaryKey({ columns: [table.scenarioId, table.inputKey] })]);
