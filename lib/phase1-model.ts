import inputs from "@/data/model_inputs.json";

export type Phase1Inputs = { institutions: number; demandMultiplier: number; b200Utilization: number; h200Utilization: number; pue: number };

// Port of research-source-of-truth/model.py for interactive, illustrative scenarios.
export function calculatePhase1(values: Phase1Inputs) {
  const p = inputs.population_mit_2025;
  const pools: Record<string, number> = {
    research_pool: p.doctoral_students + p.faculty + p.research_staff + p.postdoctoral_scholars,
    all_students: p.undergraduate_students + p.graduate_students,
    employees: p.employees_including_lincoln_lab,
  };
  const classHours: Record<string, number> = { B200: 0, H200: 0 };
  for (const workload of inputs.workloads_per_mit_equivalent_2027) {
    const hours = pools[workload.population] * workload.active_fraction * workload.hours_per_active_year * (1 - workload.local_fraction) * values.institutions * values.demandMultiplier;
    classHours[workload.device] += hours;
  }
  const bNodes = Math.ceil(classHours.B200 / (8760 * values.b200Utilization * inputs.hardware_reference.B200.gpus_per_node));
  const hNodes = Math.ceil(classHours.H200 / (8760 * values.h200Utilization * inputs.hardware_reference.H200.gpus_per_node));
  const cpuHours = inputs.cpu_workloads_per_mit_equivalent_2027.reduce((sum, w) => sum + pools[w.population] * w.active_fraction * w.core_hours_per_active_year, 0) * values.institutions * values.demandMultiplier;
  const cpuCores = Math.ceil(cpuHours / (8760 * inputs.cpu_only.schedulable_utilization));
  const gpuPowerKw = bNodes * inputs.hardware_reference.B200.node_max_kw + hNodes * inputs.hardware_reference.H200.node_max_kw;
  const cpuPowerKw = cpuCores * inputs.cpu_only.design_w_per_core / 1000;
  const itMw = (gpuPowerKw + cpuPowerKw) * (1 + inputs.infrastructure.network_storage_power_fraction_of_compute) / 1000;
  const facilityMw = itMw * values.pue;
  return { b200Hours: classHours.B200, h200Hours: classHours.H200, cpuHours, b200Count: bNodes * 8, h200Count: hNodes * 8, cpuCores, itMw, facilityMw, headroomMw: 25 - facilityMw };
}
