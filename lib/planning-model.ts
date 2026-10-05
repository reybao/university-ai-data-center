import websiteData from "@/data/website_data.json";
import modelInputs from "@/data/model_inputs.json";
import planningInputs from "@/data/planning_inputs.json";

export type PlanningValues = {
  memberWeights: number[];
  demandMultiplier: number;
  b200Utilization: number;
  h200Utilization: number;
  l40sUtilization: number;
  pue: number;
  tierMix: "mid_tier_heavy" | "planning_base" | "high_end_heavy";
};

const taskFractions = planningInputs.tier_split_fraction_of_original_reference_work as Record<string, Record<string, Record<string, number>>>;
const hourFactors = planningInputs.hours_per_original_reference_hour as Record<string, Record<string, number>>;
const baseTasks = websiteData.primary_task_mix_outputs.filter(row => row.year === 2027 && row.case === "base");
const baseCpuHours = websiteData.scenario_outputs.find(row => row.year === 2027 && row.case === "base")!.cpu_core_hours;

// Interactive port of the current three-tier planning case. Prices are modeled separately.
export function calculatePlanning(values: PlanningValues) {
  const effectiveDemandUnits = values.memberWeights.reduce((sum, weight) => sum + weight, 0);
  const scale = effectiveDemandUnits / modelInputs.consortium_mit_equivalents * values.demandMultiplier;
  const gpuHours: Record<string, number> = { B200: 0, H200: 0, L40S: 0 };
  let highEndOriginalHours = 0;
  let allOriginalHours = 0;
  for (const row of baseTasks) {
    const originalHours = row.shared_reference_gpu_hours * scale;
    const fractions = taskFractions[values.tierMix][row.primary_compute_task];
    const factors = hourFactors[row.primary_compute_task];
    allOriginalHours += originalHours;
    for (const [tier, share] of Object.entries(fractions)) {
      gpuHours[tier] += originalHours * share * factors[tier];
      if (tier !== "L40S") highEndOriginalHours += originalHours * share;
    }
  }
  const specs = {
    B200: { ...modelInputs.hardware_reference.B200, utilization: values.b200Utilization, nodeKw: modelInputs.hardware_reference.B200.node_max_kw },
    H200: { ...modelInputs.hardware_reference.H200, utilization: values.h200Utilization, nodeKw: modelInputs.hardware_reference.H200.node_max_kw },
    L40S: { gpus_per_node: planningInputs.l40s_reference.gpus_per_node, utilization: values.l40sUtilization, nodeKw: planningInputs.l40s_reference.node_design_kw },
  };
  const b200Count = Math.ceil(gpuHours.B200 / (8760 * specs.B200.utilization * specs.B200.gpus_per_node)) * specs.B200.gpus_per_node;
  const h200Count = Math.ceil(gpuHours.H200 / (8760 * specs.H200.utilization * specs.H200.gpus_per_node)) * specs.H200.gpus_per_node;
  const l40sCount = Math.ceil(gpuHours.L40S / (8760 * specs.L40S.utilization * specs.L40S.gpus_per_node)) * specs.L40S.gpus_per_node;
  const cpuHours = baseCpuHours * scale;
  const cpuCores = Math.ceil(cpuHours / (8760 * modelInputs.cpu_only.schedulable_utilization));
  const gpuKw = b200Count / specs.B200.gpus_per_node * specs.B200.nodeKw + h200Count / specs.H200.gpus_per_node * specs.H200.nodeKw + l40sCount / specs.L40S.gpus_per_node * specs.L40S.nodeKw;
  const cpuKw = cpuCores * modelInputs.cpu_only.design_w_per_core / 1000;
  const itMw = (gpuKw + cpuKw) * (1 + modelInputs.infrastructure.network_storage_power_fraction_of_compute) / 1000;
  const facilityMw = itMw * values.pue;
  const itCapacityMw = modelInputs.facility_target_mw / values.pue;
  return { effectiveDemandUnits, highEndOriginalShare: highEndOriginalHours / allOriginalHours, gpuHours, cpuHours, b200Count, h200Count, l40sCount, cpuCores, itMw, facilityMw, itCapacityMw, itHeadroomMw: itCapacityMw - itMw, headroomMw: modelInputs.facility_target_mw - facilityMw };
}
