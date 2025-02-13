export type WorkParAlgoName = "null" | "algo1627" | "pow5";
export const WORK_PAR_ALGO_NAME: { [key: number]: WorkParAlgoName } = {
  0: "null",
  1: "algo1627",
  2: "pow5",
} as const;

export const WORK_PAR_ALGO_NUM: Record<WorkParAlgoName, number> = {
  null: 0,
  algo1627: 1,
  pow5: 2,
} as const;
