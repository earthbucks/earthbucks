import { WebBuf, FixedBuf } from "@earthbucks/lib";
type HEADER_SIZE = 217;
export declare class Pow2 {
    private pow2;
    constructor(header: FixedBuf<HEADER_SIZE>);
    init(): Promise<void>;
    debugGetHeaderHash(): Promise<FixedBuf<32>>;
    debugGetFinalMatrixDataHash(): Promise<FixedBuf<32>>;
    debugGetM1First32(): Promise<Uint32Array>;
    debugGetM2First32(): Promise<Uint32Array>;
    debugGetM3First32(): Promise<Uint32Array>;
    debugGetM4Hash(): Promise<FixedBuf<32>>;
}
export declare function sha256(data: WebBuf): Promise<FixedBuf<32>>;
export {};
