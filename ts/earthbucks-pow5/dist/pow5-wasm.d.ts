import { FixedBuf } from "@earthbucks/lib";
export declare function insertNonce(header: FixedBuf<217>, nonce: number): FixedBuf<217>;
export declare function getWorkPar(header: FixedBuf<217>): FixedBuf<32>;
export declare function elementaryIteration(header: FixedBuf<217>): FixedBuf<32>;
