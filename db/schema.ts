import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Platform-authenticated identities. No password or API key is stored in D1.
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  role: text("role").notNull().default("member"),
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

export const countries = sqliteTable("countries", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  scopeNote: text("scope_note").notNull(),
});

export const evidenceSources = sqliteTable("evidence_sources", {
  id: text("id").primaryKey(),
  publisher: text("publisher").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  publishedAt: text("published_at"),
  retrievedAt: text("retrieved_at").notNull(),
});

export const indicators = sqliteTable("indicators", {
  id: text("id").primaryKey(),
  countryCode: text("country_code").notNull().references(() => countries.code),
  label: text("label").notNull(),
  value: text("value"),
  unit: text("unit"),
  evidenceType: text("evidence_type").notNull(),
  reportingPeriod: text("reporting_period").notNull(),
  retrievedAt: text("retrieved_at"),
  sourceId: text("source_id").references(() => evidenceSources.id),
  methodNote: text("method_note").notNull(),
  refreshStatus: text("refresh_status").notNull().default("static"),
  lastSuccessAt: text("last_success_at"),
  lastErrorAt: text("last_error_at"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_indicators_country").on(table.countryCode)]);

export const designAssumptions = sqliteTable("design_assumptions", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  value: text("value").notNull(),
  unit: text("unit"),
  evidenceType: text("evidence_type").notNull(),
  status: text("status").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const researchClaims = sqliteTable("research_claims", {
  id: text("id").primaryKey(),
  statement: text("statement").notNull(),
  evidenceType: text("evidence_type").notNull(),
  sourceId: text("source_id").references(() => evidenceSources.id),
  indicatorId: text("indicator_id").references(() => indicators.id),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const chatRateLimits = sqliteTable("chat_rate_limits", {
  userId: text("user_id").notNull().references(() => users.id),
  windowStart: text("window_start").notNull(),
  count: integer("count").notNull().default(0),
}, (table) => [primaryKey({ columns: [table.userId, table.windowStart] })]);
