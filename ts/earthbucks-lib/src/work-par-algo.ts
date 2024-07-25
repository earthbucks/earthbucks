export type WorkParAlgoName = "null" | "algo1627";
export const WORK_PAR_ALGO_NAME: { [key: number]: WorkParAlgoName } = {
  0: "null",
  1: "algo1627",
} as const;

export const WORK_PAR_ALGO_NUM: Record<WorkParAlgoName, number> = {
  null: 0,
  algo1627: 1,
} as const;
