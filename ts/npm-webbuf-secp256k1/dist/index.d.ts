import { FixedBuf } from "@webbuf/fixedbuf";
export declare function sign(digest: FixedBuf<32>, privateKey: FixedBuf<32>, k: FixedBuf<32>): FixedBuf<64>;
export declare function verify(signature: FixedBuf<64>, digest: FixedBuf<32>, publicKey: FixedBuf<33>): boolean;
export declare function sharedSecret(privateKey: FixedBuf<32>, publicKey: FixedBuf<33>): FixedBuf<33>;
export declare function publicKeyAdd(publicKey1: FixedBuf<33>, publicKey2: FixedBuf<33>): FixedBuf<33>;
export declare function publicKeyCreate(privateKey: FixedBuf<32>): FixedBuf<33>;
export declare function publicKeyVerify(publicKey: FixedBuf<33>): boolean;
export declare function privateKeyAdd(privKey1: FixedBuf<32>, privKey2: FixedBuf<32>): FixedBuf<32>;
export declare function privateKeyVerify(privateKey: FixedBuf<32>): boolean;
