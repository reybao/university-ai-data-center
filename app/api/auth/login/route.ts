import { authenticatedStore } from "@/lib/scenario-store";

// The platform owns sign-in. This endpoint reports the signed-in identity; it never accepts passwords.
export async function GET() {
  const access = await authenticatedStore();
  if (access.error) return access.error;
  return Response.json({ user: { id: access.user!.userId, email: access.user!.email }, auth: "ChatGPT" });
}
