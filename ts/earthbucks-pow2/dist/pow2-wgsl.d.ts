import { FixedBuf } from "@earthbucks/lib";
export declare class Pow2 {
    private header;
    constructor(header: FixedBuf<217>);
    debugGetFinalMatrixDataHash(): Promise<FixedBuf<32>>;
    debugGetM4Hash(): Promise<FixedBuf<32>>;
}
