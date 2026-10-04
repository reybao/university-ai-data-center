import { authenticatedStore, inputKeys, registerUser } from "@/lib/scenario-store";

export async function GET() {
  const access = await authenticatedStore(); if (access.error) return access.error;
  try {
    const rows = await access.db!.prepare("SELECT id, name, created_at AS createdAt, updated_at AS updatedAt FROM scenarios WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50").bind(access.user!.userId).all();
    return Response.json({ scenarios: rows.results });
  } catch { return Response.json({ error: "Saved scenarios are unavailable." }, { status: 503 }); }
}

export async function POST(request: Request) {
  const access = await authenticatedStore(); if (access.error) return access.error;
  let payload: { name?: unknown; inputs?: Record<string, unknown> };
  try { payload = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  if (!name || name.length > 100) return Response.json({ error: "Name must be 1–100 characters." }, { status: 400 });
  const inputs = payload.inputs || {};
  for (const key of inputKeys) if (inputs[key] != null && (typeof inputs[key] !== "string" || String(inputs[key]).length > 40)) return Response.json({ error: `Invalid ${key} input.` }, { status: 400 });
  const id = crypto.randomUUID();
  try {
    await registerUser(access.db!, access.user!);
    const statements = [access.db!.prepare("INSERT INTO scenarios (id, user_id, name) VALUES (?, ?, ?)").bind(id, access.user!.userId, name), ...inputKeys.map(key => access.db!.prepare("INSERT INTO scenario_inputs (scenario_id, input_key, input_value) VALUES (?, ?, ?)").bind(id, key, String(inputs[key] || "")))];
    await access.db!.batch(statements);
    return Response.json({ scenario: { id, name } }, { status: 201 });
  } catch { return Response.json({ error: "Scenario could not be saved." }, { status: 503 }); }
}
