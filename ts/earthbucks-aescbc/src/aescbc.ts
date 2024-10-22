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
import { WebBuf } from "webbuf";
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
  plaintext: WebBuf,
  aesKey: WebBuf,
  iv?: WebBuf,
  concatIv = true,
): WebBuf {
  if (!iv) {
    iv = WebBuf.from(crypto.getRandomValues(new Uint8Array(128 / 8)));
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
  const ciphertext = encryptRaw(plaintext, iv, aesKey);
  if (concatIv) {
    return WebBuf.concat([iv, ciphertext]);
  }
  return ciphertext;
}

/**
 * Decrypt data with AES + CBC mode.
 * @param ciphertext The data to decrypt. Can be any size.
 * @param aesKey The key to decrypt with. Must be 128, 192, or 256 bits.
 * @param iv The initialization vector to use. Must be 128 bits.
 * @returns The decrypted data.
 */
export function decrypt(
  ciphertext: WebBuf,
  aesKey: WebBuf,
  iv?: WebBuf,
): WebBuf {
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

export function buf2BlocksBuf(buf: WebBuf, blockSize: number) {
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

export function blockBufs2Buf(blockBufs: WebBuf[]) {
  let last = blockBufs[blockBufs.length - 1] as WebBuf;
  last = pkcs7Unpad(last);
  blockBufs[blockBufs.length - 1] = last as WebBuf;

  const buf = WebBuf.concat(blockBufs);

  return buf;
}

export function encryptRaw(plaintext: WebBuf, iv: WebBuf, aesKey: WebBuf) {
  const blockSize = iv.length * 8;
  const blockBufs = buf2BlocksBuf(plaintext, blockSize);
  const ciphertexts = encryptBlocks(blockBufs, iv, aesKey);
  const ciphertext = WebBuf.concat(ciphertexts);
  return ciphertext;
}

export function decryptRaw(ciphertext: WebBuf, iv: WebBuf, aesKey: WebBuf) {
  const bytesize = iv.length;
  const ciphertexts = [];
  for (let i = 0; i < ciphertext.length / bytesize; i++) {
    ciphertexts.push(ciphertext.slice(i * bytesize, i * bytesize + bytesize));
  }
  const blockBufs = decryptBlocks(ciphertexts, iv, aesKey);
  const buf = blockBufs2Buf(blockBufs);
  return buf;
}

export function encryptBlock(blockBuf: WebBuf, iv: WebBuf, aesKey: WebBuf) {
  const xorbuf = xorBufs(blockBuf, iv);
  const ciphertext = aesEncrypt(xorbuf, aesKey);
  return ciphertext;
}

export function decryptBlock(ciphertext: WebBuf, iv: WebBuf, aesKey: WebBuf) {
  const xorbuf = aesDecrypt(ciphertext, aesKey);
  const blockBuf = xorBufs(xorbuf, iv);
  return blockBuf;
}

export function encryptBlocks(blockBufs: WebBuf[], iv: WebBuf, aesKey: WebBuf) {
  const ciphertexts = [];

  for (let i = 0; i < blockBufs.length; i++) {
    const blockBuf = blockBufs[i] as WebBuf;
    const ciphertext = encryptBlock(blockBuf, iv, aesKey);

    ciphertexts.push(ciphertext);

    iv = ciphertext;
  }

  return ciphertexts;
}

export function decryptBlocks(
  ciphertexts: WebBuf[],
  iv: WebBuf,
  aesKey: WebBuf,
) {
  const blockBufs = [];

  for (let i = 0; i < ciphertexts.length; i++) {
    const ciphertext = ciphertexts[i] as WebBuf;
    const blockBuf = decryptBlock(ciphertext, iv, aesKey);

    blockBufs.push(blockBuf);

    iv = ciphertext as WebBuf;
  }

  return blockBufs;
}

export function pkcs7Pad(buf: WebBuf, blockSize: number) {
  const bytesize = blockSize / 8;
  const padbytesize = bytesize - buf.length;
  const pad = WebBuf.alloc(padbytesize);
  pad.fill(padbytesize);
  const paddedbuf = WebBuf.concat([buf, pad]);
  return paddedbuf;
}

export function pkcs7Unpad(paddedbuf: WebBuf) {
  const padlength = paddedbuf[paddedbuf.length - 1] as number;
  const padbuf = paddedbuf.slice(
    (paddedbuf.length as number) - padlength,
    paddedbuf.length as number,
  );
  const padbuf2 = WebBuf.alloc(padlength);
  padbuf2.fill(padlength);
  if (!padbuf.equals(padbuf2)) {
    throw new Error("invalid padding");
  }
  return paddedbuf.slice(0, paddedbuf.length - padlength);
}

export function xorBufs(buf1: WebBuf, buf2: WebBuf) {
  if (buf1.length !== buf2.length) {
    throw new Error("bufs must have the same length");
  }

  const buf = WebBuf.alloc(buf1.length);

  for (let i = 0; i < buf1.length; i++) {
    buf[i] = (buf1[i] as number) ^ (buf2[i] as number);
  }

  return buf;
}
