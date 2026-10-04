import { authenticatedStore } from "@/lib/scenario-store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await authenticatedStore(); if (access.error) return access.error;
  const { id } = await params;
  try {
    const scenario = await access.db!.prepare("SELECT id, name, created_at AS createdAt, updated_at AS updatedAt FROM scenarios WHERE id = ? AND user_id = ?").bind(id, access.user!.userId).first();
    if (!scenario) return Response.json({ error: "Scenario not found." }, { status: 404 });
    const rows = await access.db!.prepare("SELECT input_key AS inputKey, input_value AS inputValue FROM scenario_inputs WHERE scenario_id = ?").bind(id).all();
    return Response.json({ scenario: { ...scenario, inputs: Object.fromEntries((rows.results || []).map(row => [String(row.inputKey), String(row.inputValue)])) } });
  } catch { return Response.json({ error: "Scenario could not be loaded." }, { status: 503 }); }
}
