export const dateTypes = ["Dinner", "A little adventure", "Something creative"] as const;
export type DateType = typeof dateTypes[number] | "Coffee"; // Preserve an already-selected preview card during hot refresh.
export type DatePlan = { type: DateType; day?: string; time?: string; area?: string; waiting: boolean; notify: boolean; demoMatched: boolean };
export type PlanAction = { type: "add"; dateType: DateType } | { type: "patch"; dateType: DateType; patch: Partial<Omit<DatePlan, "type">> } | { type: "remove"; dateType: DateType } | { type: "reset" };
export function plansReducer(plans: DatePlan[], action: PlanAction): DatePlan[] {
  if (action.type === "reset") return [];
  if (action.type === "add") return plans.some(p => p.type === action.dateType) ? plans : [...plans, { type: action.dateType, waiting: false, notify: true, demoMatched: false }];
  if (action.type === "remove") return plans.filter(p => p.type !== action.dateType);
  return plans.map(p => {
    if (p.type !== action.dateType) return p;
    const changed = ["day", "time", "area"].some(key => key in action.patch && action.patch[key as keyof typeof action.patch] !== p[key as keyof DatePlan]);
    return { ...p, ...action.patch, ...(changed ? { waiting: false, demoMatched: false } : {}) };
  });
}
