import { wasm } from "./webbuf_blake3_bg.wasm.js";
export * from "./webbuf_blake3_bg.js";
import { __wbg_set_wasm } from "./webbuf_blake3_bg.js";
__wbg_set_wasm(wasm);
