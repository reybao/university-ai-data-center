"use client";

import { useCallback, useEffect, useState } from "react";

type Indicator = {
  id: string; country_code: string; label: string; value: string | null; unit: string | null;
  evidence_type: string; reporting_period: string; retrieved_at: string | null;
  method_note: string; refresh_status: string; last_success_at: string | null;
  last_error_at: string | null; source_title: string | null; source_url: string | null;
};
type Country = { code: string; name: string; scope_note: string };
type ResearchData = { countries: Country[]; indicators: Indicator[]; error?: string };

export function CountryComparison() {
  const [data, setData] = useState<ResearchData | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const load = useCallback(async () => {
    const response = await fetch("/api/research", { cache: "no-store" });
    const result = await response.json() as ResearchData;
    if (!response.ok) throw new Error(result.error || "Research evidence is unavailable.");
    setData(result);
  }, []);
  useEffect(() => { load().catch(error => setMessage(error instanceof Error ? error.message : "Research evidence is unavailable.")); }, [load]);
  async function refresh() {
    setBusy(true); setMessage(""); setNeedsRegistration(false); setNeedsSignIn(false);
    try {
      const response = await fetch("/api/research/refresh", { method: "POST" });
      const result = await response.json() as { error?: string };
      await load();
      setNeedsRegistration(response.status === 403); setNeedsSignIn(response.status === 401);
      setMessage(response.ok ? "GB carbon intensity updated from NESO." : result.error || "Update failed. Previous valid data is retained.");
    } catch { setMessage("Update failed. Previous valid data is retained."); }
    finally { setBusy(false); }
  }
  async function register() {
    try {
      const response = await fetch("/api/auth/register", { method: "POST" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Registration unavailable.");
      setNeedsRegistration(false); setMessage("Registered. You can now refresh the data.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Registration unavailable."); }
  }
  const live = data?.indicators.find(row => row.id === "gb_live_carbon");
  return <>
    <section className="panel country-lead">
      <div className="eyebrow">COUNTRY LENS · SOURCE BOUNDARIES SHOWN</div>
      <h2>United States · China · United Kingdom</h2>
      <p>These records compare published evidence, not candidate sites. IEA estimates for the US and China use a modelled 2024 global denominator. The 2024 Great Britain figure counts a narrower set of operational centres. Carbon figures also use different accounting boundaries; no cross-country score or ranking is implied.</p>
    </section>
    {!data && <section className="panel" role="status">{message || "Loading D1 research records…"}</section>}
    {data && <div className="country-grid">{data.countries.map(country => <section className="panel country-card" key={country.code}>
      <div className="country-card-head"><span>{country.code}</span><h2>{country.name}</h2></div>
      <p className="country-scope">{country.scope_note}</p>
      <div className="country-indicators">{data.indicators.filter(row => row.country_code === country.code && row.id !== "gb_live_carbon" && row.id !== "us_tx_price").map(row => <article key={row.id}>
        <div className="country-indicator-head"><strong>{row.label}</strong><span className={`evidence-type type-${row.evidence_type}`}>{row.evidence_type.toUpperCase()}</span></div>
        <div className="country-value">{row.value ?? "TBD"} {row.unit && <small>{row.unit}</small>}</div>
        <p>{row.method_note}</p>
        <div className="country-meta"><span>Reporting: {row.reporting_period}</span><span>Retrieved: {row.retrieved_at ?? "TBD"}</span></div>
        {row.source_url && <a href={row.source_url} target="_blank" rel="noreferrer">{row.source_title || "Source"} ↗</a>}
      </article>)}</div>
    </section>)}</div>}
    <section className="panel live-evidence">
      <div><div className="eyebrow">EXTERNAL DATA API · NATIONAL ENERGY SYSTEM OPERATOR</div><h2>Great Britain grid carbon intensity</h2><p>Current half-hour API reading. The service labels actual readings and forecasts separately. This is a grid indicator, not an annual UK data-centre footprint.</p></div>
      <div className="live-evidence-result"><strong>{live?.value ?? "TBD"} {live?.value ? live.unit : ""}</strong><span>{live?.evidence_type ?? "unknown"} · {live?.reporting_period ?? "not yet refreshed"}</span><span>Last successful update: {live?.last_success_at ?? "Never"}</span><span>Latest retrieval: {live?.retrieved_at ?? "TBD"}</span>{live?.refresh_status === "failed" && <span className="refresh-failed">Update failed: {live.last_error_at}. Showing last valid value.</span>}<button onClick={refresh} disabled={busy}>{busy ? "Updating…" : "Refresh from NESO API"}</button>{message && <p role="status">{message}</p>}{needsRegistration && <button onClick={register}>Register account</button>}{needsSignIn && <a href="/signin-with-chatgpt?return_to=%2Fcountries">Sign in with ChatGPT</a>}</div>
    </section>
    <section className="panel country-caveat"><strong>Evidence rule</strong><p>Facts, estimates, calculations, assumptions and unknowns are recorded separately in D1. Each indicator shows its reporting period, retrieval date, source and scope note. Comparable national carbon and cooling benchmarks remain TBD until matching definitions are verified.</p></section>
  </>;
}
