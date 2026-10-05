import { env } from "cloudflare:workers";
import { ensureEvidenceSeeded, readIndicators } from "@/lib/research-evidence";

export async function GET() {
  if (!env.DB) return Response.json({ error: "Research evidence storage is unavailable." }, { status: 503 });
  try {
    await ensureEvidenceSeeded(env.DB);
    const [indicators, countries, assumptions, claims] = await Promise.all([
      readIndicators(env.DB),
      env.DB.prepare("SELECT code,name,scope_note FROM countries ORDER BY code").all(),
      env.DB.prepare("SELECT id,label,value,unit,evidence_type,status,updated_at FROM design_assumptions ORDER BY id").all(),
      env.DB.prepare("SELECT c.id,c.statement,c.evidence_type,c.source_id,s.title AS source_title,s.url AS source_url FROM research_claims c LEFT JOIN evidence_sources s ON s.id=c.source_id ORDER BY c.id").all(),
    ]);
    return Response.json({ countries: countries.results, indicators, assumptions: assumptions.results, claims: claims.results }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Research evidence load failed", error);
    return Response.json({ error: "Research evidence is temporarily unavailable." }, { status: 503 });
  }
}
