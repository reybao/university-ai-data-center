import { authenticatedStore, registerUser } from "@/lib/scenario-store";

// Registration means enrolling the platform-authenticated user for saved scenarios.
export async function POST() {
  const access = await authenticatedStore();
  if (access.error) return access.error;
  try { await registerUser(access.db!, access.user!); return Response.json({ user: { id: access.user!.userId, email: access.user!.email } }); }
  catch { return Response.json({ error: "Account storage is unavailable." }, { status: 503 }); }
}
