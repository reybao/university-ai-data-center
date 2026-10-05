import { requireResearchAdmin } from "@/lib/research-admin";

const evidenceTypes = new Set(["fact", "estimate", "calculation", "assumption", "design decision", "unknown"]);

export async function PATCH(request: Request) {
  const access = await requireResearchAdmin();
  if (access.error) return access.error;
  let body: { table?: unknown; id?: unknown; value?: unknown; evidenceType?: unknown; reportingPeriod?: unknown; methodNote?: unknown; status?: unknown };
  try { body = await request.json(); }
  catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const table = body.table;
  const id = typeof body.id === "string" && /^[a-z0-9_:-]{1,80}$/i.test(body.id) ? body.id : "";
  if (!id || !["indicator", "assumption"].includes(String(table))) return Response.json({ error: "Select a supported record and valid ID." }, { status: 400 });

  if (table === "indicator") {
    const value = body.value === null || typeof body.value === "string" ? body.value : undefined;
    const evidenceType = typeof body.evidenceType === "string" && evidenceTypes.has(body.evidenceType) ? body.evidenceType : "";
    const reportingPeriod = typeof body.reportingPeriod === "string" ? body.reportingPeriod.trim() : "";
    const methodNote = typeof body.methodNote === "string" ? body.methodNote.trim() : "";
    if (value === undefined || (typeof value === "string" && value.length > 500) || !evidenceType || !reportingPeriod || reportingPeriod.length > 120 || !methodNote || methodNote.length > 1000) return Response.json({ error: "Provide a bounded value, evidence type, reporting period and method note." }, { status: 400 });
    const now = new Date().toISOString();
    const result = await access.db!.prepare("UPDATE indicators SET value=?,evidence_type=?,reporting_period=?,method_note=?,refresh_status='manual',updated_at=? WHERE id=?")
      .bind(value, evidenceType, reportingPeriod, methodNote, now, id).run();
    if (!result.meta.changes) return Response.json({ error: "Indicator not found." }, { status: 404 });
    return Response.json({ updated: { table, id, updatedAt: now } });
  }

  const value = typeof body.value === "string" ? body.value.trim() : "";
  const status = typeof body.status === "string" ? body.status.trim() : "";
  if (!value || value.length > 500 || !status || status.length > 500) return Response.json({ error: "Provide a bounded assumption value and status." }, { status: 400 });
  const now = new Date().toISOString();
  const result = await access.db!.prepare("UPDATE design_assumptions SET value=?,status=?,updated_at=? WHERE id=?")
    .bind(value, status, now, id).run();
  if (!result.meta.changes) return Response.json({ error: "Assumption not found." }, { status: 404 });
  return Response.json({ updated: { table, id, updatedAt: now } });
}
