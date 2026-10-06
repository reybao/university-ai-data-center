import { env } from "cloudflare:workers";
import { ensureEvidenceSeeded, readIndicators } from "@/lib/research-evidence";
import { requireResearchAdmin } from "@/lib/research-admin";

type EiaRow = {
  period?: unknown;
  respondent?: unknown;
  type?: unknown;
  value?: unknown;
  "value-units"?: unknown;
};

type EiaResponse = {
  response?: { data?: EiaRow[] };
  error?: { code?: unknown; message?: unknown };
};

const indicatorIds = ["us_tx_grid_demand", "us_tx_grid_forecast"] as const;

function eiaUrl(apiKey: string, type: "D" | "DF", period?: string) {
  const url = new URL("https://api.eia.gov/v2/electricity/rto/region-data/data/");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("frequency", "hourly");
  url.searchParams.append("data[0]", "value");
  url.searchParams.append("facets[respondent][]", "ERCO");
  url.searchParams.append("facets[type][]", type);
  url.searchParams.set("sort[0][column]", "period");
  url.searchParams.set("sort[0][direction]", "desc");
  url.searchParams.set("length", "1");
  if (period) {
    url.searchParams.set("start", period);
    url.searchParams.set("end", period);
  }
  return url;
}

async function fetchEiaRow(apiKey: string, type: "D" | "DF", period?: string) {
  const upstream = await fetch(eiaUrl(apiKey, type, period), {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10000),
    cache: "no-store",
  });
  const body = await upstream.json() as EiaResponse;
  if (!upstream.ok || body.error) throw new Error(`EIA API rejected ${type} request (${upstream.status})`);
  const row = body.response?.data?.[0];
  const value = typeof row?.value === "string" ? Number(row.value) : row?.value;
  if (
    row?.respondent !== "ERCO" || row?.type !== type || row?.["value-units"] !== "megawatthours" ||
    typeof row?.period !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}$/.test(row.period) ||
    typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 200000
  ) throw new Error(`EIA API returned invalid ${type} data`);
  return { period: row.period, value };
}

export async function POST() {
  const access = await requireResearchAdmin();
  if (access.error) return access.error;
  const db = access.db!;
  try {
    await ensureEvidenceSeeded(db);
  } catch (error) {
    console.error("EIA refresh registration check failed", error);
    return Response.json({ error: "Research evidence is temporarily unavailable." }, { status: 503 });
  }

  const apiKey = (env as unknown as { EIA_API_KEY?: string }).EIA_API_KEY?.trim();
  if (!apiKey) return Response.json({ error: "EIA refresh is ready, but the free EIA_API_KEY Secret has not been configured for this Site." }, { status: 503 });

  try {
    const actual = await fetchEiaRow(apiKey, "D");
    const periodMs = Date.parse(`${actual.period}:00:00Z`);
    if (!Number.isFinite(periodMs) || periodMs > Date.now() + 60 * 60 * 1000 || Date.now() - periodMs > 24 * 60 * 60 * 1000) {
      throw new Error("EIA API returned stale or future actual demand");
    }
    const forecast = await fetchEiaRow(apiKey, "DF", actual.period);
    if (forecast.period !== actual.period) throw new Error("EIA forecast period did not match actual demand");

    const now = new Date().toISOString();
    const reportingPeriod = `${actual.period}:00 UTC`;
    await db.batch([
      db.prepare("UPDATE indicators SET value=?,evidence_type='fact',reporting_period=?,retrieved_at=?,method_note=?,refresh_status='ok',last_success_at=?,last_error_at=NULL,updated_at=? WHERE id='us_tx_grid_demand'")
        .bind(String(actual.value), reportingPeriod, now, "Preliminary ERCOT hourly demand reported in EIA Form EIA-930. Regional operating context only; not site-level available capacity or a service commitment.", now, now),
      db.prepare("UPDATE indicators SET value=?,evidence_type='estimate',reporting_period=?,retrieved_at=?,method_note=?,refresh_status='ok',last_success_at=?,last_error_at=NULL,updated_at=? WHERE id='us_tx_grid_forecast'")
        .bind(String(forecast.value), reportingPeriod, now, "ERCOT day-ahead demand forecast for the same hour as the actual value. Forecast error is operational context, not evidence of site-level power availability.", now, now),
    ]);
    const indicators = (await readIndicators(db)).filter(row => indicatorIds.includes(row.id as typeof indicatorIds[number]));
    return Response.json({ indicators }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("EIA ERCOT refresh failed; preserving last valid indicators", error);
    const now = new Date().toISOString();
    try {
      await db.batch(indicatorIds.map(id => db.prepare("UPDATE indicators SET refresh_status='failed',last_error_at=?,updated_at=? WHERE id=?").bind(now, now, id)));
    } catch (storageError) { console.error("Failed to record EIA refresh status", storageError); }
    const indicators = (await readIndicators(db)).filter(row => indicatorIds.includes(row.id as typeof indicatorIds[number]));
    return Response.json({ error: "EIA update failed. The last valid ERCOT values, if available, are preserved.", indicators }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
