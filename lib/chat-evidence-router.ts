export type ResearchIntent =
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
  ["framework", /\b(decision|analysis|research)\s+(logic|framework|tree|process|steps?)\b|\bhow\s+(?:should|do|would)\s+(?:we|you)\s+(?:analyse|analyze|decide)\b|决策逻辑|分析逻辑|分析框架|决策框架|分析步骤|研究逻辑|如何分析|如何决策/i],
  ["countries", /\b(?:compare|comparison|rank|ranking)\b.{0,40}\b(?:countries|country|us|usa|united states|china|uk|united kingdom)\b|国家比较|国家对比|美国.{0,12}中国|中国.{0,12}英国/i],
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

export function evidenceScopeForIntent(intent: ResearchIntent): EvidenceScope {
  switch (intent) {
    case "framework":
      return {
        indicators: [],
        claims: ["analysis_framework", "model_demand", "model_power", "model_staging", "model_cost", "model_stress"],
        assumptions: ["member_units", "first_module", "later_module", "envelope"],
      };
    case "demand":
      return {
        indicators: [],
        claims: ["model_demand", "model_power", "model_staging"],
        assumptions: ["member_units", "pue", "first_module", "later_module", "envelope"],
      };
    case "strategy":
      return {
        indicators: [],
        claims: ["analysis_framework", "model_staging", "model_cost", "model_stress"],
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
        indicators: ["us_dc_2024", "us_dc_2023", "us_mix", "us_carbon", "us_cooling", "cn_dc_2024", "cn_mix", "cn_carbon", "cn_cooling", "uk_dc_2024", "uk_dc_count", "uk_mix", "uk_carbon", "uk_cooling", "gb_live_carbon"],
        claims: ["iea_scope", "uk_scope", "carbon_basis", "cooling_gate"],
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
