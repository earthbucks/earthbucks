import { Buffer } from "buffer";

type BufferFunction = (input: Buffer) => Buffer;

function lt(a: Buffer, b: Buffer): boolean {
  for (let i = 0; i < a.length; i++) {
    if ((a[i] as number) < (b[i] as number)) return true;
    if ((a[i] as number) > (b[i] as number)) return false;
  }
  return false;
}

const MIN_TARGET = Buffer.from(
  "00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  "hex",
);

export default function SimplePow(
  nonce: Buffer, // 32 bytes
  target: Buffer,
  blake3Hash: BufferFunction,
): Buffer {
  if (lt(target, MIN_TARGET)) {
    throw new Error("Target is too low");
  }
  nonce = Buffer.from(nonce);
  target = Buffer.from(target);
  nonce.writeUInt32BE(0, 0);
  let num = nonce.readUInt32BE(0);
  let currentHash = blake3Hash(nonce);

  while (!lt(currentHash, target)) {
    num++;
    nonce.writeUInt32BE(num, 0);
    currentHash = blake3Hash(nonce);
  }
  console.log(currentHash.toString("hex"));
  console.log(target.toString("hex"));
  console.log("Nonce found: " + num);

  return nonce;
}
