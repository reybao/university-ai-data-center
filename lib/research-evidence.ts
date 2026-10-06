// Curated seed records. Every value is labelled by evidence type and reporting period.
// The D1 copy is authoritative for the research page and assistant; this file only seeds new databases.
const retrievedAt = "2026-10-04";

const countries = [
  ["US", "United States", "National data-centre estimate and electricity statistics; no site-level inference."],
  ["CN", "China", "National IEA data-centre estimate and Chinese official generation statistics."],
  ["UK", "United Kingdom", "Data-centre count and electricity are for Great Britain only; power mix is UK-wide."],
] as const;

const sources = [
  ["iea_energy_ai", "International Energy Agency", "Energy and AI: Executive summary", "https://www.iea.org/reports/energy-and-ai/executive-summary", "2025-04"],
  ["doe_dc", "U.S. Department of Energy / LBNL", "DOE releases data-center energy usage report", "https://www.energy.gov/articles/doe-releases-new-report-evaluating-increase-electricity-demand-data-centers", "2024-12"],
  ["eia_mix", "U.S. Energy Information Administration", "U.S. energy facts: 2024 electricity generation by source", "https://www.eia.gov/energyexplained/us-energy-facts/data-and-statistics.php", "2025-04"],
  ["eia_emissions", "U.S. Energy Information Administration", "United States Electricity Profile 2024", "https://www.eia.gov/electricity/state/unitedstates/", "2025-11"],
  ["china_stats", "National Bureau of Statistics of China", "2024 National Economic and Social Development Statistical Communiqué", "https://www.stats.gov.cn/sj/zxfb/202502/t20250228_1958817.html", "2025-02"],
  ["china_carbon", "Ministry of Ecology and Environment of China", "2024 national electricity carbon-footprint factors", "https://www.mee.gov.cn/xxgk2018/xxgk/xxgk01/202510/W020251024569470952545.pdf", "2025-10"],
  ["cn_green_policy", "National Development and Reform Commission of China et al.", "Special Action Plan for Green and Low-Carbon Development of Data Centers", "https://www.ndrc.gov.cn/xxgk/zcfb/tz/202407/P020240723625582947550.pdf", "2024-07"],
  ["uk_dc", "UK Department for Energy Security and Net Zero", "Data centre electricity consumption in Great Britain, 2020 to 2024", "https://www.gov.uk/government/publications/energy-trends-june-2026-special-feature-article-data-centre-electricity-consumption-in-great-britain-2020-to-2024", "2026-06"],
  ["uk_scope", "UK Office for National Statistics", "Data centres and the UK National Accounts", "https://www.ons.gov.uk/economy/nationalaccounts/uksectoraccounts/methodologies/datacentresandtheuknationalaccounts", "2026-09"],
  ["uk_mix", "UK Department for Energy Security and Net Zero", "Digest of UK Energy Statistics 2025, chapter 5", "https://assets.publishing.service.gov.uk/media/68dbe477ef1c2f72bc1e4c4d/DUKES_2025_Chapters_1-7.pdf", "2025-07"],
  ["uk_carbon_table", "UK Department for Energy Security and Net Zero", "DUKES 5.14: estimated carbon dioxide intensity of electricity supplied", "https://www.gov.uk/government/statistics/electricity-chapter-5-digest-of-united-kingdom-energy-statistics-dukes", "2026-07"],
  ["gb_carbon_annual_2024", "UK Department for Energy Security and Net Zero", "DESNZ annual report 2025–26: Clean Power 2030 Metrics, Table 3", "https://www.gov.uk/government/publications/desnz-annual-report-and-accounts-2025-to-2026/performance-report", "2026"],
  ["uk_water", "UK Environment Agency", "National Framework for Water Resources 2025: data centres and AI", "https://www.gov.uk/government/publications/national-framework-for-water-resources-2025-water-for-growth-nature-and-a-resilient-future/9-taking-action-on-other-significant-water-using-sectors-and-emerging-demands-national-framework-for-water-resources-2025", "2025"],
  ["us_cooling", "U.S. Department of Energy", "Cooling Water Efficiency Opportunities for Federal Data Centers", "https://www.energy.gov/cmei/femp/cooling-water-efficiency-opportunities-federal-data-centers", null],
  ["gb_carbon_api", "National Energy System Operator", "Great Britain Carbon Intensity API", "https://api.carbonintensity.org.uk/", null],
  ["eia_price", "U.S. Energy Information Administration", "2024 industrial average electricity price by state", "https://www.eia.gov/electricity/sales_revenue_price/pdf/table_4.pdf", "2025"],
  ["course_power_us", "GlobalPetrolPrices / prior course dataset", "U.S. business retail electricity price · archived course snapshot", "https://www.globalpetrolprices.com/USA/electricity_prices/", "2025-12"],
  ["course_power_cn", "GlobalPetrolPrices / prior course dataset", "China business retail electricity price · archived course snapshot", "https://www.globalpetrolprices.com/China/electricity_prices/", "2025-12"],
  ["course_power_uk", "GlobalPetrolPrices / prior course dataset", "UK business retail electricity price · archived course snapshot", "https://www.globalpetrolprices.com/United-Kingdom/electricity_prices/", "2025-12"],
  ["tt_dc_cost_2025", "Turner & Townsend", "Data Centre Construction Cost Index 2025–26 · city benchmarks", "https://www.turnerandtownsend.com/news-old/ai-data-centre-rush-raises-alarm-over-construction-supply-chain/", "2025-11"],
  ["cbre_colo_q1_2025", "CBRE", "Global Data Center Trends 2025 · Phoenix and London asking rents", "https://www.cbre.com/insights/reports/global-data-center-trends-2025", "2025-Q1"],
  ["china_post_colo_2025", "China Post", "2025 remote IDC colocation procurement ceiling", "https://www.chinapost.com.cn/cn/report/2507/1151-1.html", "2025-07"],
  ["model_demand", "University Consortium planning model", "Demand and workload model · illustrative 2026-10-04 snapshot", "/demand", "2026-10-04"],
  ["model_architecture", "University Consortium planning model", "Architecture and power model · illustrative 2026-10-04 snapshot", "/architecture", "2026-10-04"],
  ["model_economics", "University Consortium planning model", "Economics model · illustrative 2026-10-04 snapshot", "/economics", "2026-10-04"],
] as const;

// id, country, label, value, unit, type, period, source, method / comparability note
const indicators = [
  ["us_dc_2024", "US", "Data-centre electricity", "~187", "TWh", "estimate", "2024", "iea_energy_ai", "IEA model: 45% of 415 TWh global total. Approximate; not a meter census."],
  ["us_dc_2023", "US", "Data-centre electricity, DOE benchmark", "176", "TWh", "fact", "2023", "doe_dc", "LBNL estimate published by DOE; earlier year than IEA 2024 comparison."],
  ["us_mix", "US", "Electricity generation mix", "43% gas · 23% renewables · 18% nuclear · 15% coal", null, "fact", "2024", "eia_mix", "National generation shares, rounded; this is not a site power-purchase mix."],
  ["us_carbon", "US", "Power-sector CO₂ intensity", "785", "lb CO₂/MWh", "fact", "2024", "eia_emissions", "EIA generator emissions per net generation. Operational CO₂, not lifecycle or a purchased-power factor."],
  ["us_cooling", "US", "Cooling constraint", "Water demand depends on site heat load and cooling system", null, "fact", "Guidance; site TBD", "us_cooling", "No local water-rights or engineering study has been completed."],
  ["cn_dc_2024", "CN", "Data-centre electricity", "~104", "TWh", "estimate", "2024", "iea_energy_ai", "IEA model: 25% of 415 TWh global total. Approximate; not a national meter census."],
  ["cn_mix", "CN", "Electricity generation mix", "63.2% thermal · 14.1% hydro · 9.9% wind · 8.3% solar · 4.5% nuclear", null, "calculation", "2024", "china_stats", "Calculated from official 2024 generation volumes; thermal is broader than coal."],
  ["cn_carbon", "CN", "National electricity carbon footprint", "0.5777", "kg CO₂e/kWh", "fact", "2024", "china_carbon", "Official lifecycle electricity footprint; not directly comparable with US generator CO₂."],
  ["cn_cooling", "CN", "Cooling and efficiency policy", "Water-conservation review; large-centre PUE ≤1.25, hub PUE ≤1.20", null, "fact", "2024 policy; end-2025 target", "cn_green_policy", "Official policy calls for water-conservation review of new or expanded projects and sets PUE targets for large/very large and national-hub data centres. Policy targets are not observed performance or a site water allocation."],
  ["uk_dc_2024", "UK", "Operational data-centre electricity · Great Britain", "4.5", "TWh", "fact", "2024", "uk_dc", "DESNZ narrow GB operational-centre scope; excludes some enterprise facilities and Northern Ireland."],
  ["uk_dc_count", "UK", "Operational data-centre count · Great Britain", "239", "sites", "fact", "2024", "uk_scope", "ONS cites the DESNZ narrow operational-centre series; not total UK estate."],
  ["uk_mix", "UK", "Electricity generation mix · UK", "50.4% renewables · 14.2% nuclear · 31.8% fossil", null, "fact", "2024", "uk_mix", "DUKES UK generation shares, not the GB data-centre supply mix."],
  ["uk_carbon", "UK", "GB electricity-supplied emissions intensity", "107", "g CO₂e/kWh", "fact", "2024", "gb_carbon_annual_2024", "DESNZ Clean Power 2030 Metrics Table 3. GB electricity supplied, not a UK data-centre footprint or lifecycle factor; carbon measures across countries are not directly comparable."],
  ["uk_cooling", "UK", "Cooling and water constraint", "Water availability must be checked early; some catchments restrict new abstraction", null, "fact", "2025 guidance", "uk_water", "Qualitative planning constraint, not a site-specific water allocation."],
  ["gb_live_carbon", "UK", "GB grid carbon intensity · current half-hour", null, "g CO₂/kWh", "unknown", "TBD", "gb_carbon_api", "Refresh from NESO API. Forecast is identified as forecast if actual is unavailable."],
  ["us_tx_price", "US", "Texas industrial retail-price proxy", "6.12", "¢/kWh", "fact", "2024", "eia_price", "Historical state blended average; not a 2030 data-centre tariff or a city quote."],
  ["course_us_business_power", "US", "Business retail electricity · archived course snapshot", "0.145", "USD/kWh", "estimate", "2025-12", "course_power_us", "Prior course energy-data.csv, accessed 2026-09-16. Standard 1 million kWh/year business benchmark, not a 12 MW data-center tariff; source page may now show newer data."],
  ["course_cn_business_power", "CN", "Business retail electricity · archived course snapshot", "0.117", "USD/kWh", "estimate", "2025-12", "course_power_cn", "Prior course energy-data.csv, accessed 2026-09-16. Standard 1 million kWh/year business benchmark, not a 12 MW data-center tariff; source page may now show newer data."],
  ["course_uk_business_power", "UK", "Business retail electricity · archived course snapshot", "0.451", "USD/kWh", "estimate", "2025-12", "course_power_uk", "Prior course energy-data.csv, accessed 2026-09-16. Standard 1 million kWh/year business benchmark, not a 12 MW data-center tariff; source page may now show newer data."],
  ["us_sv_construction", "US", "Traditional data-center construction · Silicon Valley", "13.3", "USD/IT W", "estimate", "2025", "tt_dc_cost_2025", "City benchmark, not a US national average or AI liquid-cooled project quote. Excludes site-specific power access, land and active IT."],
  ["uk_london_construction", "UK", "Traditional data-center construction · London", "12.0", "USD/IT W", "estimate", "2025", "tt_dc_cost_2025", "City benchmark, not a UK national average or AI liquid-cooled project quote. Excludes site-specific power access, land and active IT."],
  ["us_phoenix_colo", "US", "Phoenix colocation asking rent", "190", "USD/IT kW-month", "estimate", "2025-Q1", "cbre_colo_q1_2025", "CBRE market average for the 250–500 kW segment. Extrapolation to 10 MW IT is a model assumption, not a wholesale offer; power inclusion and contract terms require checking."],
  ["cn_post_colo", "CN", "China Post IDC cabinet rent ceiling", "641.67", "CNY/IT kW-month", "calculation", "2025-07", "china_post_colo_2025", "CNY 38,500/year per 5 kW cabinet divided by 5 kW and 12 months. Public procurement ceiling, not a China market average or 10 MW IT offer; service bundle differs from CBRE."],
  ["uk_london_colo", "UK", "London colocation asking rent midpoint", "197.5", "USD/IT kW-month", "calculation", "2025-Q1", "cbre_colo_q1_2025", "Midpoint of CBRE USD 180–215/kW-month range for the 250–500 kW market segment. Extrapolation to 10 MW IT is a model assumption, not a wholesale offer."],
] as const;

const assumptions = [
  ["research_region", "Provisional research region", "Texas / ERCOT", null, "assumption", "Price-screen candidate only; no parcel or utility commitment"],
  ["first_module", "2030 first-module facility input", "12", "MW", "assumption", "Modelled; power and contract TBD"],
  ["later_module", "2033 conditional module input", "15", "MW", "assumption", "Expansion conditional on demand and contract"],
  ["envelope", "Expandable facility envelope", "25", "MW", "assumption", "Uncommitted total facility input, not IT load"],
  ["pue", "Efficiency target", "1.20", "PUE", "assumption", "Engineering validation TBD"],
  ["member_units", "Five planning member profiles", "3.5", "MIT reference demand units", "assumption", "Not measured consortium use"],
  ["colo_share", "Controlled colo workload share", "70", "% of eligible annual task hours", "assumption", "Not an observed hourly load split"],
  ["discount_rate", "Real cost discount rate", "8", "%", "assumption", "2027–2036 cost NPV proxy"],
] as const;

const claims = [
  ["analysis_framework", "The investment analysis sequence is: validate users, workloads, effective GPU-hours, availability and data-security requirements; test whether demand supports 25 MW or a smaller staged start; define a common service boundary for build-and-own, rented compute and phased hybrid delivery without treating early benchmarks as final prices; compare at least three countries and select the project jurisdiction; screen regions and candidate sites for utility capacity, delivery date, land or colocation, water, fiber, permitting and risk; adapt and test the physical design, critical-component failures and a 48-hour outage against shortlisted sites; obtain matched cloud, colocation, GPU, network and utility offers and only then model final ten-year facility and GPU cash flows; run the required base, one-year grid-delay and half-forecast GPU-utilization scenarios; then separate verified facts, estimates, calculations, assumptions, design decisions and unknowns to decide whether to approve, reject or request more evidence. Texas/ERCOT enters only after the United States is selected, as a regional screening candidate rather than a predetermined site.", "design decision", null, null],
  ["decision_recommendation", "The current investment recommendation is to approve demand validation, engineering and commercial diligence, and matched cloud and colocation bids for a phased hybrid plan; do not authorize construction of the full 25 MW facility or the full GPU purchase now. Use 12 MW total facility input as the illustrative 2030 first module, expand to 15 MW from 2033 only if observed demand and comparable contracts support it, and keep 25 MW as an uncommitted planning envelope. The recommendation must be reconsidered if member demand commitments, matched supplier pricing, or deliverable power evidence are materially weaker than assumed.", "design decision", null, null],
  ["iea_scope", "IEA 2024 US and China data-centre electricity figures are model estimates based on shares of its global 415 TWh total.", "fact", "iea_energy_ai", "us_dc_2024"],
  ["uk_scope", "DESNZ 2024 Great Britain data-centre electricity covers a narrower operational-centre population; it is not directly comparable with the IEA national estimates.", "fact", "uk_scope", "uk_dc_2024"],
  ["research_location", "Texas / ERCOT is a provisional design research region; no parcel or power-delivery commitment has been selected.", "assumption", null, null],
  ["carbon_basis", "The US operational CO₂ measure is a generator factor, distinct from lifecycle carbon accounting; a harmonized carbon ranking is TBD.", "fact", "eia_emissions", "us_carbon"],
  ["cooling_gate", "Cooling design, water availability and annual PUE need local engineering and service-provider evidence before site underwriting.", "assumption", "uk_water", null],
  ["model_demand", "Five planning member profiles sum to 3.5 MIT-reference demand units; the weights and future utilization are model assumptions rather than measured use.", "assumption", "model_demand", null],
  ["model_demand_mix", "The illustrative four-task 2030 base workload totals 26.02 million reference-equivalent GPU-hours; a 3.0x versus 2.0x multiplier yields 39.04 million in 2035, or 50% growth. Reference hours are not additive to the mixed B200/H200/L40S device-hours.", "calculation", "model_demand", null],
  ["country_price_screen", "The archived course dataset lists 2025-12 business electricity proxies of US $0.145, China $0.117 and UK $0.451/kWh. At 12 MW facility input and 60% average use, 63.072 GWh/year gives annual screens of $9.15m, $7.38m and $28.45m respectively. Separate colocation reference points are Phoenix $190/IT kW-month, China Post public procurement ceiling CNY 641.67/IT kW-month and London range midpoint $197.5/IT kW-month. A 12 MW facility at assumed PUE 1.20 implies 10 MW IT, but the 10 MW annual rent extrapolations are not comparable market offers: sources represent different sizes and service bundles. Do not add power cost unless rent excludes power. Chinese same-method construction cost is unverified.", "calculation", null, null],
  ["model_power", "The illustrative three-tier planning base calculates 13.204 MW total facility design input for the full modeled 2030 workload and 19.795 MW for 2035; these are model outputs, not measured demand or utility capacity.", "calculation", "model_architecture", null],
  ["model_staging", "The base hybrid case models 12 MW total-facility commitment in 2030 and conditional 15 MW from 2033; the 25 MW envelope remains uncommitted.", "assumption", "model_economics", null],
  ["model_cost", "For 2027–2036, the illustrative staged 70% colo / 30% eligible-cloud hybrid cost NPV is about $1.192bn; the flexible-capacity hybrid is about $1.177bn and the all-cloud public-anchor proxy about $1.152bn. These are cost estimates, not vendor bids.", "calculation", "model_economics", null],
  ["model_stress", "With base demand and the fixed 12-to-15 MW contract, a one-year delay of all grid power to the shared center raises modeled cost NPV to $1.237bn; half forecast on-site GPU utilization raises it to $1.477bn.", "calculation", "model_economics", null],
] as const;

export async function ensureEvidenceSeeded(db: D1Database) {
  const existing = await db.prepare("SELECT code FROM countries LIMIT 1").first();
  if (existing) {
    // Correct only prior placeholder records, preserving manually edited and refreshed evidence.
    const [ukPrior, cnPrior, locationPrior] = await Promise.all([
      db.prepare("SELECT evidence_type,value,source_id FROM indicators WHERE id='uk_carbon'").first<{ evidence_type: string; value: string | null; source_id: string | null }>(),
      db.prepare("SELECT evidence_type,value,source_id FROM indicators WHERE id='cn_cooling'").first<{ evidence_type: string; value: string | null; source_id: string | null }>(),
      db.prepare("SELECT statement,source_id FROM research_claims WHERE id='research_location'").first<{ statement: string; source_id: string | null }>(),
    ]);
    const newClaims = claims.filter(row => row[0] === "analysis_framework" || row[0] === "decision_recommendation" || row[0] === "model_demand_mix" || row[0] === "country_price_screen");
    const updates: D1PreparedStatement[] = newClaims.map(row =>
      db.prepare("INSERT INTO research_claims (id,statement,evidence_type,source_id,indicator_id) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET statement=excluded.statement,evidence_type=excluded.evidence_type,source_id=excluded.source_id,indicator_id=excluded.indicator_id,updated_at=CURRENT_TIMESTAMP").bind(...row)
    );
    for (const row of sources.filter(source => source[0].startsWith("course_power_") || source[0] === "tt_dc_cost_2025" || source[0] === "cbre_colo_q1_2025" || source[0] === "china_post_colo_2025")) {
      updates.push(db.prepare("INSERT OR IGNORE INTO evidence_sources (id,publisher,title,url,published_at,retrieved_at) VALUES (?,?,?,?,?,?)").bind(...row, "2026-10-05"));
    }
    for (const row of indicators.filter(indicator => indicator[0].startsWith("course_") || indicator[0] === "us_sv_construction" || indicator[0] === "uk_london_construction" || indicator[0] === "us_phoenix_colo" || indicator[0] === "cn_post_colo" || indicator[0] === "uk_london_colo")) {
      updates.push(db.prepare("INSERT OR IGNORE INTO indicators (id,country_code,label,value,unit,evidence_type,reporting_period,retrieved_at,source_id,method_note) VALUES (?,?,?,?,?,?,?,?,?,?)").bind(row[0],row[1],row[2],row[3],row[4],row[5],row[6],"2026-10-05",row[7],row[8]));
    }
    if (ukPrior?.evidence_type === "unknown" && ukPrior.value === null && ukPrior.source_id === "uk_carbon_table") {
      const source = sources.find(row => row[0] === "gb_carbon_annual_2024")!;
      updates.push(
        db.prepare("INSERT OR IGNORE INTO evidence_sources (id,publisher,title,url,published_at,retrieved_at) VALUES (?,?,?,?,?,?)").bind(...source, retrievedAt),
        db.prepare("UPDATE indicators SET label=?,value=?,unit=?,evidence_type='fact',reporting_period='2024',retrieved_at=?,source_id=?,method_note=?,updated_at=CURRENT_TIMESTAMP WHERE id='uk_carbon' AND evidence_type='unknown' AND value IS NULL AND source_id='uk_carbon_table'")
          .bind("GB electricity-supplied emissions intensity", "107", "g CO₂e/kWh", retrievedAt, "gb_carbon_annual_2024", "DESNZ Clean Power 2030 Metrics Table 3. GB electricity supplied, not a UK data-centre footprint or lifecycle factor; carbon measures across countries are not directly comparable."),
      );
    }
    if (cnPrior?.evidence_type === "estimate" && cnPrior.value === "Climate, water and grid conditions require provincial screening" && cnPrior.source_id === "iea_energy_ai") {
      const source = sources.find(row => row[0] === "cn_green_policy")!;
      updates.push(
        db.prepare("INSERT OR IGNORE INTO evidence_sources (id,publisher,title,url,published_at,retrieved_at) VALUES (?,?,?,?,?,?)").bind(...source, retrievedAt),
        db.prepare("UPDATE indicators SET label=?,value=?,unit=NULL,evidence_type='fact',reporting_period=?,retrieved_at=?,source_id=?,method_note=?,updated_at=CURRENT_TIMESTAMP WHERE id='cn_cooling' AND evidence_type='estimate' AND value='Climate, water and grid conditions require provincial screening' AND source_id='iea_energy_ai'")
          .bind("Cooling and efficiency policy", "Water-conservation review; large-centre PUE ≤1.25, hub PUE ≤1.20", "2024 policy; end-2025 target", retrievedAt, "cn_green_policy", "Official policy calls for water-conservation review of new or expanded projects and sets PUE targets for large/very large and national-hub data centres. Policy targets are not observed performance or a site water allocation."),
      );
    }
    const oldLocationStatement = "Texas / ERCOT is the provisional US region for design research because it has the lowest historical 2024 industrial retail-price proxy in the current four-state screen; it is not a selected parcel or a power-delivery commitment.";
    if (locationPrior?.source_id === "eia_price" && locationPrior.statement === oldLocationStatement) {
      updates.push(db.prepare("UPDATE research_claims SET statement=?,source_id=NULL,updated_at=CURRENT_TIMESTAMP WHERE id='research_location' AND statement=? AND source_id='eia_price'")
        .bind("Texas / ERCOT is a provisional design research region; no parcel or power-delivery commitment has been selected.", oldLocationStatement));
    }
    if (updates.length) await db.batch(updates);
    return;
  }
  const statements: D1PreparedStatement[] = [];
  for (const row of countries) statements.push(db.prepare("INSERT OR IGNORE INTO countries (code,name,scope_note) VALUES (?,?,?)").bind(...row));
  for (const row of sources) statements.push(db.prepare("INSERT OR IGNORE INTO evidence_sources (id,publisher,title,url,published_at,retrieved_at) VALUES (?,?,?,?,?,?)").bind(...row, retrievedAt));
  for (const row of indicators) statements.push(db.prepare("INSERT OR IGNORE INTO indicators (id,country_code,label,value,unit,evidence_type,reporting_period,retrieved_at,source_id,method_note) VALUES (?,?,?,?,?,?,?,?,?,?)").bind(row[0],row[1],row[2],row[3],row[4],row[5],row[6],retrievedAt,row[7],row[8]));
  for (const row of assumptions) statements.push(db.prepare("INSERT OR IGNORE INTO design_assumptions (id,label,value,unit,evidence_type,status) VALUES (?,?,?,?,?,?)").bind(...row));
  for (const row of claims) statements.push(db.prepare("INSERT OR IGNORE INTO research_claims (id,statement,evidence_type,source_id,indicator_id) VALUES (?,?,?,?,?)").bind(...row));
  await db.batch(statements);
}

export type ResearchIndicator = {
  id: string; country_code: string; label: string; value: string | null; unit: string | null;
  evidence_type: string; reporting_period: string; retrieved_at: string | null;
  method_note: string; refresh_status: string; last_success_at: string | null;
  last_error_at: string | null; source_id: string | null; source_title: string | null;
  source_url: string | null; source_publisher: string | null;
};

export async function readIndicators(db: D1Database): Promise<ResearchIndicator[]> {
  const result = await db.prepare(`SELECT i.id,i.country_code,i.label,i.value,i.unit,i.evidence_type,i.reporting_period,i.retrieved_at,i.method_note,i.refresh_status,i.last_success_at,i.last_error_at,i.source_id,s.title AS source_title,s.url AS source_url,s.publisher AS source_publisher FROM indicators i LEFT JOIN evidence_sources s ON s.id=i.source_id ORDER BY i.country_code,i.id`).all<ResearchIndicator>();
  return result.results;
}

export async function readIndicatorsByIds(db: D1Database, ids: string[]): Promise<ResearchIndicator[]> {
  if (!ids.length) return [];
  const placeholders = ids.map(() => "?").join(",");
  const result = await db.prepare(`SELECT i.id,i.country_code,i.label,i.value,i.unit,i.evidence_type,i.reporting_period,i.retrieved_at,i.method_note,i.refresh_status,i.last_success_at,i.last_error_at,i.source_id,s.title AS source_title,s.url AS source_url,s.publisher AS source_publisher FROM indicators i LEFT JOIN evidence_sources s ON s.id=i.source_id WHERE i.id IN (${placeholders}) ORDER BY i.country_code,i.id`).bind(...ids).all<ResearchIndicator>();
  return result.results;
}
