import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";

export const inputKeys = ["memberAnchor", "memberResearchA", "memberResearchB", "memberMixedA", "memberMixedB", "demandMultiplier", "b200Utilization", "h200Utilization", "l40sUtilization", "pue", "tierMix"] as const;

export async function authenticatedStore() {
  const user = await getChatGPTUser();
  if (!user) return { error: Response.json({ error: "Sign in with ChatGPT to use saved scenarios." }, { status: 401 }) };
  if (!env.DB) return { error: Response.json({ error: "Scenario storage is not connected yet." }, { status: 503 }) };
  return { user, db: env.DB };
}

export async function registerUser(db: D1Database, user: { userId: string; email: string }) {
  await db.prepare("INSERT INTO users (id, email) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET email = excluded.email").bind(user.userId, user.email).run();
}
