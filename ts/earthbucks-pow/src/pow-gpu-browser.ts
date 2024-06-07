import * as tf from "@tensorflow/tfjs";
import { PowGpu } from "./pow-gpu.js";

type TF = typeof tf;

export class PowGpuBrowser extends PowGpu {
  tf: TF = tf;
}
