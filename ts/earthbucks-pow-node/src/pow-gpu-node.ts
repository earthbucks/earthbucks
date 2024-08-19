import * as tf from "@tensorflow/tfjs-node";
import { PowGpu } from "@earthbucks/pow-browser";

type TF = typeof tf;

export class PowGpuNode extends PowGpu {
  tf: TF = tf;
}
