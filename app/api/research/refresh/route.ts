import { ensureEvidenceSeeded, readIndicators } from "@/lib/research-evidence";
import { requireResearchAdmin } from "@/lib/research-admin";

type CarbonApi = { data?: Array<{ from?: unknown; to?: unknown; intensity?: { actual?: unknown; forecast?: unknown } }> };

export async function POST() {
  const access = await requireResearchAdmin();
  if (access.error) return access.error;
  const db = access.db!;
  try {
    await ensureEvidenceSeeded(db);
  } catch (error) {
    console.error("Research refresh registration check failed", error);
    return Response.json({ error: "Research evidence is temporarily unavailable." }, { status: 503 });
  }

  try {
    const upstream = await fetch("https://api.carbonintensity.org.uk/intensity", { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000), cache: "no-store" });
    if (!upstream.ok) throw new Error(`NESO API status ${upstream.status}`);
    const body = await upstream.json() as CarbonApi;
    const record = body.data?.[0];
    const actual = record?.intensity?.actual;
    const forecast = record?.intensity?.forecast;
    const value = typeof actual === "number" && Number.isInteger(actual) ? actual : forecast;
    const kind = value === actual ? "actual" : "forecast";
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 1500 || typeof record?.from !== "string" || typeof record.to !== "string" || !Number.isFinite(Date.parse(record.from)) || !Number.isFinite(Date.parse(record.to))) throw new Error("NESO API returned invalid data");
    const fromMs = Date.parse(record.from), toMs = Date.parse(record.to);
    if (toMs <= fromMs || toMs - fromMs > 60 * 60 * 1000 || Math.abs(Date.now() - toMs) > 6 * 60 * 60 * 1000) throw new Error("NESO API returned a stale or invalid reporting period");
    const now = new Date().toISOString();
    await db.prepare("UPDATE indicators SET value=?,evidence_type=?,reporting_period=?,retrieved_at=?,method_note=?,refresh_status='ok',last_success_at=?,last_error_at=NULL,updated_at=? WHERE id='gb_live_carbon'")
      .bind(String(value), kind === "actual" ? "fact" : "estimate", `${record.from} to ${record.to}`, now, `NESO ${kind} half-hour GB grid carbon intensity. Current grid intensity is not annual UK data-centre emissions.`, now, now).run();
    const indicator = (await readIndicators(db)).find(row => row.id === "gb_live_carbon");
    return Response.json({ indicator }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("NESO API refresh failed; preserving last valid indicator", error);
    const now = new Date().toISOString();
    try { await db.prepare("UPDATE indicators SET refresh_status='failed',last_error_at=?,updated_at=? WHERE id='gb_live_carbon'").bind(now, now).run(); }
    catch (storageError) { console.error("Failed to record refresh status", storageError); }
    const indicator = (await readIndicators(db)).find(row => row.id === "gb_live_carbon");
    return Response.json({ error: "Live update failed. The last valid value, if available, is preserved.", indicator }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
