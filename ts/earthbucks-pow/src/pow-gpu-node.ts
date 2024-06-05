import * as tf from "@tensorflow/tfjs-node";
import GpuPow from "./pow-gpu";

type TF = typeof tf;

export class GpuPowNode extends GpuPow {
  tf: TF = tf;
}
