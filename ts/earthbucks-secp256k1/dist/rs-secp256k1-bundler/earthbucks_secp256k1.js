import { wasm } from "./earthbucks_secp256k1_bg.wasm.js";
export * from "./earthbucks_secp256k1_bg.js";
import { __wbg_set_wasm } from "./earthbucks_secp256k1_bg.js";
__wbg_set_wasm(wasm);