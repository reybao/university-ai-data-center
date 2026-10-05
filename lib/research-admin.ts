import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";

export async function requireResearchAdmin() {
  const user = await getChatGPTUser();
  if (!user) return { error: Response.json({ error: "Sign in with ChatGPT to update research data." }, { status: 401 }) };
  if (!env.DB) return { error: Response.json({ error: "Research evidence storage is unavailable." }, { status: 503 }) };
  const registered = await env.DB.prepare("SELECT role FROM users WHERE id=?").bind(user.userId).first<{ role: string }>();
  if (!registered) return { error: Response.json({ error: "Register before requesting research updates." }, { status: 403 }) };
  if (registered.role !== "admin") return { error: Response.json({ error: "Research updates require an authorized administrator." }, { status: 403 }) };
  return { user, db: env.DB };
}
