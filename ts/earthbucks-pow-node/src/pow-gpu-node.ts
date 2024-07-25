import * as tf from "@tensorflow/tfjs-node";
import { PowGpu } from "@earthbucks/earthbucks-pow-browser/src/lib.js";

type TF = typeof tf;

export class PowGpuNode extends PowGpu {
  tf: TF = tf;
}
