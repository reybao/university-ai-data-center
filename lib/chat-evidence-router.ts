export type ResearchIntent =
  | "data_inventory"
  | "recommendation"
  | "framework"
  | "demand"
  | "strategy"
  | "architecture"
  | "countries"
  | "location"
  | "economics"
  | "scenario"
  | "evidence";

type EvidenceScope = {
  indicators: string[];
  claims: string[];
  assumptions: string[];
};

const sectionIntent: Record<string, ResearchIntent> = {
  "ic-memo": "framework",
  demand: "demand",
  strategy: "strategy",
  architecture: "architecture",
  countries: "countries",
  location: "location",
  economics: "economics",
  "risk-delivery": "architecture",
  "scenario-lab": "scenario",
  evidence: "evidence",
  assurance: "evidence",
};

const rules: Array<[ResearchIntent, RegExp]> = [
  ["data_inventory", /(?:使用|用了|依据|依赖|包含|罗列|列出|哪些|所有).{0,12}(?:数据|资料|指标|来源|数据框架)|(?:数据|资料|指标|来源|数据框架).{0,12}(?:使用|用了|依据|依赖|包含|罗列|列出|哪些|所有)|\b(?:what|which|list|all)\b.{0,35}\b(?:data|datasets|inputs|sources|metrics)\b|\b(?:data|datasets|inputs|sources|metrics)\b.{0,35}\b(?:used|underlying|included)\b/i],
  ["recommendation", /\b(?:final|overall|investment|committee|ic)\s+(?:recommendation|decision|verdict|conclusion)\b|\bwhat\s+should\s+(?:the\s+)?(?:committee|ic|we)\s+(?:approve|do)\b|最终建议|总体建议|投资建议|最终结论|建议是什么|应该批准|是否批准/i],
  ["framework", /\b(decision|analysis|research)\s+(logic|framework|tree|process|steps?)\b|\bhow\s+(?:should|do|would)\s+(?:we|you)\s+(?:analyse|analyze|decide)\b|决策逻辑|分析逻辑|分析框架|决策框架|分析步骤|研究逻辑|如何分析|如何决策/i],
  ["countries", /\b(?:compare|comparison|rank|ranking)\b.{0,40}\b(?:countries|country|us|usa|united states|china|uk|united kingdom)\b|\b(?:electricity prices?|construction costs?|colocation (?:rent|rates?|prices?))\b.{0,35}\b(?:country|countries|china|uk|united states)\b|国家比较|国家对比|美国.{0,12}中国|中国.{0,12}英国|中美英.{0,12}(?:电价|成本|托管)|三国.{0,12}(?:电价|成本|托管)|(?:托管|机柜租赁).{0,12}(?:价格|成本|参考)/i],
  ["location", /\b(?:texas|ercot|parcel|site selection|regional? screen|location|utility commitment|power delivery)\b|德州|得州|选址|地块|地区筛选|电网接入地点/i],
  ["demand", /\b(?:demand|workload|gpu.hours?|utili[sz]ation|users?|member institutions?|capacity need|right.?si[sz]e)\b|需求|工作负载|GPU\s*小时|利用率|用户|成员机构|规模是否/i],
  ["strategy", /\b(?:build|buy|rent|lease|colo|colocation|hybrid|ownership|own versus|alternative)\b|自建|租用|混合方案|持有|所有权|方案比较|替代方案/i],
  ["architecture", /\b(?:architecture|power system|ups|generator|cooling|network|storage|outage|failure path|resilien|physical design)\b|架构|供电|备用电源|冷却|网络|存储|停电|故障路径|物理系统/i],
  ["economics", /\b(?:economics?|cash flow|npv|capex|opex|cost per|financ|investment cost|annual cost)\b|经济|现金流|净现值|资本开支|运营成本|融资|成本/i],
  ["scenario", /\b(?:scenario|sensitivity|grid delay|half utili[sz]ation|stress test|what if)\b|情景|敏感性|延迟一年|利用率.{0,8}一半|压力测试/i],
  ["evidence", /\b(?:evidence|source|citation|assumption|unknown|verified|data quality|last updated)\b|证据|来源|引用|假设|未知|核实|更新时间/i],
];

export function classifyResearchIntent(message: string, section: string): ResearchIntent {
  for (const [intent, pattern] of rules) {
    if (pattern.test(message)) return intent;
  }
  return sectionIntent[section] || "framework";
}

export function classifyResearchIntents(message: string, section: string): ResearchIntent[] {
  const matched = rules.filter(([, pattern]) => pattern.test(message)).map(([intent]) => intent);
  // A compound question needs evidence for each part, not a single page-default label.
  const focused = matched.includes("data_inventory") ? matched.filter(intent => intent !== "evidence") : matched;
  return focused.length ? [...new Set(focused)].slice(0, 3) : [sectionIntent[section] || "framework"];
}

export function evidenceScopeForIntents(intents: ResearchIntent[]): EvidenceScope {
  const scopes = intents.map(evidenceScopeForIntent);
  return {
    indicators: [...new Set(scopes.flatMap(scope => scope.indicators))],
    claims: [...new Set(scopes.flatMap(scope => scope.claims))],
    assumptions: [...new Set(scopes.flatMap(scope => scope.assumptions))],
  };
}

export function evidenceScopeForIntent(intent: ResearchIntent): EvidenceScope {
  switch (intent) {
    case "data_inventory":
      return {
        indicators: ["us_dc_2024", "us_mix", "us_carbon", "us_cooling", "cn_dc_2024", "cn_mix", "cn_carbon", "cn_cooling", "uk_dc_2024", "uk_dc_count", "uk_mix", "uk_carbon", "uk_cooling", "us_tx_price", "gb_live_carbon", "course_us_business_power", "course_cn_business_power", "course_uk_business_power", "us_sv_construction", "uk_london_construction", "us_phoenix_colo", "cn_post_colo", "uk_london_colo"],
        claims: ["model_demand", "model_demand_mix", "country_price_screen", "model_power", "model_staging", "model_cost", "model_stress", "carbon_basis", "cooling_gate"],
        assumptions: ["member_units", "pue", "first_module", "later_module", "envelope", "colo_share", "discount_rate", "research_region"],
      };
    case "recommendation":
      return {
        indicators: [],
        claims: ["decision_recommendation", "model_demand", "model_staging", "model_cost", "model_stress"],
        assumptions: ["first_module", "later_module", "envelope"],
      };
    case "framework":
      return {
        indicators: ["us_dc_2024", "cn_dc_2024", "uk_dc_2024", "us_tx_price"],
        claims: ["analysis_framework", "decision_recommendation", "model_demand", "model_power", "model_staging", "model_cost", "model_stress", "research_location"],
        assumptions: ["member_units", "pue", "first_module", "later_module", "envelope", "discount_rate"],
      };
    case "demand":
      return {
        indicators: [],
        claims: ["model_demand", "model_demand_mix", "model_power", "model_staging"],
        assumptions: ["member_units", "pue", "first_module", "later_module", "envelope"],
      };
    case "strategy":
      return {
        indicators: [],
        claims: ["decision_recommendation", "analysis_framework", "model_demand", "model_staging", "model_cost", "model_stress"],
        assumptions: ["colo_share", "first_module", "later_module", "envelope", "discount_rate"],
      };
    case "architecture":
      return {
        indicators: [],
        claims: ["model_power", "model_staging", "cooling_gate"],
        assumptions: ["pue", "first_module", "later_module", "envelope"],
      };
    case "countries":
      return {
        indicators: ["us_dc_2024", "us_dc_2023", "us_mix", "us_carbon", "us_cooling", "cn_dc_2024", "cn_mix", "cn_carbon", "cn_cooling", "uk_dc_2024", "uk_dc_count", "uk_mix", "uk_carbon", "uk_cooling", "gb_live_carbon", "course_us_business_power", "course_cn_business_power", "course_uk_business_power", "us_sv_construction", "uk_london_construction", "us_phoenix_colo", "cn_post_colo", "uk_london_colo"],
        claims: ["iea_scope", "uk_scope", "carbon_basis", "cooling_gate", "country_price_screen"],
        assumptions: [],
      };
    case "location":
      return {
        indicators: ["us_tx_price"],
        claims: ["research_location", "cooling_gate"],
        assumptions: ["research_region", "envelope"],
      };
    case "economics":
      return {
        indicators: [],
        claims: ["model_cost", "model_staging", "model_stress"],
        assumptions: ["discount_rate", "colo_share", "first_module", "later_module", "envelope"],
      };
    case "scenario":
      return {
        indicators: [],
        claims: ["model_stress", "model_demand", "model_staging", "model_cost"],
        assumptions: ["member_units", "colo_share", "first_module", "later_module", "pue"],
      };
    case "evidence":
      return {
        indicators: ["gb_live_carbon", "us_tx_price"],
        claims: ["analysis_framework", "model_demand", "model_power", "model_cost", "model_stress", "research_location", "carbon_basis", "cooling_gate"],
        assumptions: ["member_units", "research_region", "first_module", "later_module", "envelope", "pue", "discount_rate"],
      };
  }
}
