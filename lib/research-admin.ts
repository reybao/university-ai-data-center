import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";

export async function requireResearchAdmin() {
  const user = await getChatGPTUser();
  if (!user) return { error: Response.json({ error: "Sign in with ChatGPT to update research data." }, { status: 401 }) };
  if (!env.DB) return { error: Response.json({ error: "Research evidence storage is unavailable." }, { status: 503 }) };
  const registered = await env.DB.prepare("SELECT role FROM users WHERE id=?").bind(user.userId).first<{ role: string }>();
  if (!registered) return { error: Response.json({ error: "Register before requesting research updates." }, { status: 403 }) };
  const configured = (env as unknown as { RESEARCH_ADMIN_EMAILS?: string }).RESEARCH_ADMIN_EMAILS || "";
  const configuredAdmins = new Set(configured.split(",").map(value => value.trim().toLowerCase()).filter(Boolean));
  if (registered.role !== "admin" && !configuredAdmins.has(user.email.toLowerCase())) return { error: Response.json({ error: "Research updates require an authorized administrator." }, { status: 403 }) };
  return { user, db: env.DB };
}
