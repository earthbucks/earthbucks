import { Buffer } from "buffer";
import * as tf from "@tensorflow/tfjs";
import GpuPow from "./pow-gpu";

type TF = typeof tf;

export default class GpuPowBrowser extends GpuPow {
  tf: TF = tf;
}
