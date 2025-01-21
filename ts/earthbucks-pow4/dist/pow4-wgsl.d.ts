import { FixedBuf } from "@earthbucks/lib";
export declare class Pow4 {
    private header;
    private state;
    constructor(header: FixedBuf<217>);
    init(): Promise<void>;
    debugGetHeaderHash(): Promise<{
        hash: FixedBuf<32>;
        nonce: number;
    }>;
    debugElementaryIteration(): Promise<{
        hash: FixedBuf<32>;
        nonce: number;
    }>;
    work(): Promise<{
        hash: FixedBuf<32>;
        nonce: number;
    }>;
}
