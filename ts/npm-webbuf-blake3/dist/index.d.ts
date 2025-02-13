import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
export declare function blake3Hash(buf: WebBuf): FixedBuf<32>;
export declare function doubleBlake3Hash(buf: WebBuf): FixedBuf<32>;
export declare function blake3Mac(key: FixedBuf<32>, message: WebBuf): FixedBuf<32>;
