import * as tf from "@tensorflow/tfjs-node";
import PowGpu from "./pow-gpu";

type TF = typeof tf;

export class PowGpuNode extends PowGpu {
  tf: TF = tf;
}
