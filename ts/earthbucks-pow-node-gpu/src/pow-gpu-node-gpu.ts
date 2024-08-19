import * as tf from "@tensorflow/tfjs-node-gpu";
import { PowGpu } from "@earthbucks/pow-browser";

type TF = typeof tf;

export class PowGpuNodeGpu extends PowGpu {
  tf: TF = tf;
}
