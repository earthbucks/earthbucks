import { FixedBuf } from "@earthbucks/ebx-lib";
type GridSize = 32768 | 2048 | 128;
export declare class Pow5 {
    private header;
    private gridSize;
    private state;
    constructor(header: FixedBuf<217>, gridSize?: GridSize);
    init(debug?: boolean): Promise<void>;
    setInput(header: FixedBuf<217>, gridSize: GridSize): Promise<void>;
    debugHashHeader(): Promise<{
        hash: FixedBuf<32>;
        nonce: number;
    }>;
    debugDoubleHashHeader(): Promise<{
        hash: FixedBuf<32>;
        nonce: number;
    }>;
    debugHashHeader128(): Promise<{
        hash: FixedBuf<32>;
        nonce: number;
    }>;
    debugHashHeader32(): Promise<{
        hash: FixedBuf<32>;
        nonce: number;
    }>;
    debugGetWorkPar(): Promise<{
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
export {};
