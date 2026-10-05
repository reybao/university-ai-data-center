import { authenticatedStore, registerUser } from "@/lib/scenario-store";

// Registration means enrolling the platform-authenticated user for saved scenarios.
export async function GET() {
  const access = await authenticatedStore();
  if (access.error) return access.error;
  try {
    const registered = await access.db!.prepare("SELECT id FROM users WHERE id=?").bind(access.user!.userId).first();
    return Response.json({ registered: Boolean(registered) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return Response.json({ error: "Account status is unavailable." }, { status: 503 }); }
}

export async function POST() {
  const access = await authenticatedStore();
  if (access.error) return access.error;
  try { await registerUser(access.db!, access.user!); return Response.json({ user: { id: access.user!.userId, email: access.user!.email } }); }
  catch { return Response.json({ error: "Account storage is unavailable." }, { status: 503 }); }
}
