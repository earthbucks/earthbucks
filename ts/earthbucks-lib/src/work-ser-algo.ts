export type WorkSerAlgoName = "null" | "blake3" | "blake3_2" | "blake3_3";
export const WORK_SER_ALGO_NAME: { [key: number]: WorkSerAlgoName } = {
  0: "null",
  1: "blake3",
  2: "blake3_2",
  3: "blake3_3",
} as const;

export const WORK_SER_ALGO_NUM: Record<WorkSerAlgoName, number> = {
  null: 0,
  blake3: 1,
  blake3_2: 2,
  blake3_3: 3,
} as const;
