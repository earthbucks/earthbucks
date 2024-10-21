/**
 * Cbc
 * ===
 *
 * Cipher Block Chaining (Cbc). This is a low-level tool for chaining multiple
 * encrypted blocks together (in this case with Aes) This is a low-level tool
 * that does not include authentication. You should only be using this if you
 * have authentication at another step. It is best combined with Hmac.
 *
 * http://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Cipher-block_chaining_.2829
 */
import { Buffer as SysBuf } from "buffer";
import { encrypt as aesEncrypt, decrypt as aesDecrypt } from "./aes.js";

/**
 * Encrypt data with AES + CBC mode.
 *
 * @param plaintext The data to encrypt. Can be any size.
 * @param aesKey The key to encrypt with. Must be 128, 192, or 256 bits.
 * @param iv The initialization vector to use. Must be 128 bits.
 * @param concatIv If true, the iv will be concatenated with the encrypted data.
 * @returns The encrypted data.
 */
export function encrypt(
  plaintext: SysBuf,
  aesKey: SysBuf,
  iv?: SysBuf,
  concatIv = true,
): SysBuf {
  //iv = iv || Random.getRandomBuffer(128 / 8)
  if (!iv) {
    iv = SysBuf.from(crypto.getRandomValues(new Uint8Array(128 / 8)));
  }
  if (iv.length !== 128 / 8) {
    throw new Error("iv must be 128 bits");
  }
  if (
    aesKey.length !== 128 / 8 &&
    aesKey.length !== 192 / 8 &&
    aesKey.length !== 256 / 8
  ) {
    throw new Error("aesKey must be 128, 192, or 256 bits");
  }
  const ctBuf = encryptRaw(plaintext, iv, aesKey);
  if (concatIv) {
    return SysBuf.concat([iv, ctBuf]);
  }
  return ctBuf;
}

/**
 * Decrypt data with AES + CBC mode.
 * @param ciphertext The data to decrypt. Can be any size.
 * @param aesKey The key to decrypt with. Must be 128, 192, or 256 bits.
 * @param iv The initialization vector to use. Must be 128 bits.
 * @returns The decrypted data.
 */
export function decrypt(
  ciphertext: SysBuf,
  aesKey: SysBuf,
  iv?: SysBuf,
): SysBuf {
  if (iv && iv.length !== 128 / 8) {
    throw new Error("iv must be 128 bits");
  }
  if (
    aesKey.length !== 128 / 8 &&
    aesKey.length !== 192 / 8 &&
    aesKey.length !== 256 / 8
  ) {
    throw new Error("aesKey must be 128, 192, or 256 bits");
  }
  if (!iv) {
    const iv = ciphertext.slice(0, 128 / 8);
    const ctBuf = ciphertext.slice(128 / 8);
    return decryptRaw(ctBuf, iv, aesKey);
  }
  const ctBuf = ciphertext;
  return decryptRaw(ctBuf, iv, aesKey);
}

export function buf2BlocksBuf(buf: SysBuf, blockSize: number) {
  const bytesize = blockSize / 8;
  const blockBufs = [];

  for (let i = 0; i <= buf.length / bytesize; i++) {
    let blockBuf = buf.slice(i * bytesize, i * bytesize + bytesize);

    if (blockBuf.length < blockSize) {
      blockBuf = pkcs7Pad(blockBuf, blockSize);
    }

    blockBufs.push(blockBuf);
  }

  return blockBufs;
}

export function blockBufs2Buf(blockBufs: SysBuf[]) {
  let last = blockBufs[blockBufs.length - 1] as SysBuf;
  last = pkcs7Unpad(last);
  blockBufs[blockBufs.length - 1] = last as SysBuf;

  const buf = SysBuf.concat(blockBufs);

  return buf;
}

export function encryptRaw(plaintext: SysBuf, iv: SysBuf, aesKey: SysBuf) {
  const blockSize = iv.length * 8;
  const blockBufs = buf2BlocksBuf(plaintext, blockSize);
  const ciphertexts = encryptBlocks(blockBufs, iv, aesKey);
  const ciphertext = SysBuf.concat(ciphertexts);
  return ciphertext;
}

export function decryptRaw(ciphertext: SysBuf, iv: SysBuf, aesKey: SysBuf) {
  const bytesize = iv.length;
  const ciphertexts = [];
  for (let i = 0; i < ciphertext.length / bytesize; i++) {
    ciphertexts.push(ciphertext.slice(i * bytesize, i * bytesize + bytesize));
  }
  const blockBufs = decryptBlocks(ciphertexts, iv, aesKey);
  const buf = blockBufs2Buf(blockBufs);
  return buf;
}

export function encryptBlock(blockBuf: SysBuf, iv: SysBuf, aesKey: SysBuf) {
  const xorbuf = xorBufs(blockBuf, iv);
  const ciphertext = aesEncrypt(xorbuf, aesKey);
  return ciphertext;
}

export function decryptBlock(ciphertext: SysBuf, iv: SysBuf, aesKey: SysBuf) {
  const xorbuf = aesDecrypt(ciphertext, aesKey);
  const blockBuf = xorBufs(xorbuf, iv);
  return blockBuf;
}

export function encryptBlocks(blockBufs: SysBuf[], iv: SysBuf, aesKey: SysBuf) {
  const ciphertexts = [];

  for (let i = 0; i < blockBufs.length; i++) {
    const blockBuf = blockBufs[i] as SysBuf;
    const ciphertext = encryptBlock(blockBuf, iv, aesKey);

    ciphertexts.push(ciphertext);

    iv = ciphertext;
  }

  return ciphertexts;
}

export function decryptBlocks(
  ciphertexts: SysBuf[],
  iv: SysBuf,
  aesKey: SysBuf,
) {
  const blockBufs = [];

  for (let i = 0; i < ciphertexts.length; i++) {
    const ciphertext = ciphertexts[i] as SysBuf;
    const blockBuf = decryptBlock(ciphertext, iv, aesKey);

    blockBufs.push(blockBuf);

    iv = ciphertext as SysBuf;
  }

  return blockBufs;
}

export function pkcs7Pad(buf: SysBuf, blockSize: number) {
  const bytesize = blockSize / 8;
  const padbytesize = bytesize - buf.length;
  const pad = SysBuf.alloc(padbytesize);
  pad.fill(padbytesize);
  const paddedbuf = SysBuf.concat([buf, pad]);
  return paddedbuf;
}

export function pkcs7Unpad(paddedbuf: SysBuf) {
  const padlength = paddedbuf[paddedbuf.length - 1] as number;
  const padbuf = paddedbuf.slice(
    (paddedbuf.length as number) - padlength,
    paddedbuf.length as number,
  );
  const padbuf2 = SysBuf.alloc(padlength);
  padbuf2.fill(padlength);
  if (!padbuf.equals(padbuf2)) {
    throw new Error("invalid padding");
  }
  return paddedbuf.slice(0, paddedbuf.length - padlength);
}

export function xorBufs(buf1: SysBuf, buf2: SysBuf) {
  if (buf1.length !== buf2.length) {
    throw new Error("bufs must have the same length");
  }

  const buf = SysBuf.alloc(buf1.length);

  for (let i = 0; i < buf1.length; i++) {
    buf[i] = (buf1[i] as number) ^ (buf2[i] as number);
  }

  return buf;
}
