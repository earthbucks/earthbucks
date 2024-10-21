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
 * @param {SysBuf} messageBuf - The data to encrypt. Can be any size.
 * @param {SysBuf} aesKeyBuf - The key to encrypt with. Must be 128, 192, or 256 bits.
 * @param {SysBuf} ivBuf - The initialization vector to use. Must be 128 bits.
 * @param {boolean} concatIvBuf - If true, the ivBuf will be concatenated with the encrypted data.
 * @returns {SysBuf} - The encrypted data.
 */
export function encrypt(
  messageBuf: SysBuf,
  aesKeyBuf: SysBuf,
  ivBuf?: SysBuf,
  concatIvBuf = true,
): SysBuf {
  //ivBuf = ivBuf || Random.getRandomBuffer(128 / 8)
  if (!ivBuf) {
    ivBuf = SysBuf.from(crypto.getRandomValues(new Uint8Array(128 / 8)));
  }
  if (ivBuf.length !== 128 / 8) {
    throw new Error("ivBuf must be 128 bits");
  }
  if (
    aesKeyBuf.length !== 128 / 8 &&
    aesKeyBuf.length !== 192 / 8 &&
    aesKeyBuf.length !== 256 / 8
  ) {
    throw new Error("aesKeyBuf must be 128, 192, or 256 bits");
  }
  const ctBuf = encryptRaw(messageBuf, ivBuf, aesKeyBuf);
  if (concatIvBuf) {
    return SysBuf.concat([ivBuf, ctBuf]);
  }
  return ctBuf;
}

/**
 * Decrypt data with AES + CBC mode.
 * @param {SysBuf} encBuf - The data to decrypt. Can be any size.
 * @param {SysBuf} aesKeyBuf - The key to decrypt with. Must be 128, 192, or 256 bits.
 * @param {SysBuf} ivBuf - The initialization vector to use. Must be 128 bits.
 * @returns {SysBuf} - The decrypted data.
 */
export function decrypt(
  encBuf: SysBuf,
  aesKeyBuf: SysBuf,
  ivBuf?: SysBuf,
): SysBuf {
  if (ivBuf && ivBuf.length !== 128 / 8) {
    throw new Error("ivBuf must be 128 bits");
  }
  if (
    aesKeyBuf.length !== 128 / 8 &&
    aesKeyBuf.length !== 192 / 8 &&
    aesKeyBuf.length !== 256 / 8
  ) {
    throw new Error("aesKeyBuf must be 128, 192, or 256 bits");
  }
  if (!ivBuf) {
    const ivBuf = encBuf.slice(0, 128 / 8);
    const ctBuf = encBuf.slice(128 / 8);
    return decryptRaw(ctBuf, ivBuf, aesKeyBuf);
  }
  const ctBuf = encBuf;
  return decryptRaw(ctBuf, ivBuf, aesKeyBuf);
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

export function encryptRaw(
  messageBuf: SysBuf,
  ivBuf: SysBuf,
  aesKeyBuf: SysBuf,
) {
  const blockSize = ivBuf.length * 8;
  const blockBufs = buf2BlocksBuf(messageBuf, blockSize);
  const encBufs = encryptBlocks(blockBufs, ivBuf, aesKeyBuf);
  const encBuf = SysBuf.concat(encBufs);
  return encBuf;
}

export function decryptRaw(encBuf: SysBuf, ivBuf: SysBuf, aesKeyBuf: SysBuf) {
  const bytesize = ivBuf.length;
  const encBufs = [];
  for (let i = 0; i < encBuf.length / bytesize; i++) {
    encBufs.push(encBuf.slice(i * bytesize, i * bytesize + bytesize));
  }
  const blockBufs = decryptBlocks(encBufs, ivBuf, aesKeyBuf);
  const buf = blockBufs2Buf(blockBufs);
  return buf;
}

export function encryptBlock(
  blockBuf: SysBuf,
  ivBuf: SysBuf,
  aesKeyBuf: SysBuf,
) {
  const xorbuf = xorBufs(blockBuf, ivBuf);
  const encBuf = aesEncrypt(xorbuf, aesKeyBuf);
  return encBuf;
}

export function decryptBlock(encBuf: SysBuf, ivBuf: SysBuf, aesKeyBuf: SysBuf) {
  const xorbuf = aesDecrypt(encBuf, aesKeyBuf);
  const blockBuf = xorBufs(xorbuf, ivBuf);
  return blockBuf;
}

export function encryptBlocks(
  blockBufs: SysBuf[],
  ivBuf: SysBuf,
  aesKeyBuf: SysBuf,
) {
  const encBufs = [];

  for (let i = 0; i < blockBufs.length; i++) {
    const blockBuf = blockBufs[i] as SysBuf;
    const encBuf = encryptBlock(blockBuf, ivBuf, aesKeyBuf);

    encBufs.push(encBuf);

    ivBuf = encBuf;
  }

  return encBufs;
}

export function decryptBlocks(
  encBufs: SysBuf[],
  ivBuf: SysBuf,
  aesKeyBuf: SysBuf,
) {
  const blockBufs = [];

  for (let i = 0; i < encBufs.length; i++) {
    const encBuf = encBufs[i] as SysBuf;
    const blockBuf = decryptBlock(encBuf, ivBuf, aesKeyBuf);

    blockBufs.push(blockBuf);

    ivBuf = encBuf as SysBuf;
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
