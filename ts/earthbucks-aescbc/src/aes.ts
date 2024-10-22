import { WebBuf } from "webbuf";

export function encrypt(messageBuf: WebBuf, keyBuf: WebBuf) {
  const key = buf2Words(keyBuf);
  const message = buf2Words(messageBuf);
  const a = new AES(key);
  const enc = a.encrypt(message);
  const encBuf = words2Buf(enc);
  return encBuf;
}

export function decrypt(encBuf: WebBuf, keyBuf: WebBuf) {
  const enc = buf2Words(encBuf);
  const key = buf2Words(keyBuf);
  const a = new AES(key);
  const message = a.decrypt(enc);
  const messageBuf = words2Buf(message);
  return messageBuf;
}

const buf2Words = (buf: WebBuf) => {
  if (buf.length % 4) {
    throw new Error("buf length must be a multiple of 4");
  }

  const words = [];

  for (let i = 0; i < buf.length / 4; i++) {
    words.push(buf.readUInt32BE(i * 4));
  }

  return new Uint32Array(words);
};

const words2Buf = (words: Uint32Array) => {
  const buf = WebBuf.alloc(words.length * 4);

  for (let i = 0; i < words.length; i++) {
    buf.writeUInt32BE(words[i] as number, i * 4);
  }

  return buf;
};

export class AES {
  _tables = [
    [
      new Uint32Array(256),
      new Uint32Array(256),
      new Uint32Array(256),
      new Uint32Array(256),
      new Uint32Array(256),
    ],
    [
      new Uint32Array(256),
      new Uint32Array(256),
      new Uint32Array(256),
      new Uint32Array(256),
      new Uint32Array(256),
    ],
  ] as const;
  _key: [Uint32Array, Uint32Array];

  constructor(key: Uint32Array) {
    if (!this._tables[0][0][0]) {
      this._precompute();
    }
    let tmp: number;
    let encKey: Uint32Array;
    let decKey: Uint32Array;
    const sbox = this._tables[0][4];
    const decTable = this._tables[1];
    const keyLen = key.length;
    let rcon = 1;

    if (keyLen !== 4 && keyLen !== 6 && keyLen !== 8) {
      throw new Error("invalid aes key size");
    }

    const expandedKeyLen = 4 * (keyLen + 7); // Total words required for key schedule
    encKey = new Uint32Array(expandedKeyLen); // Preallocate space for encKey
    encKey.set(key); // Copy key to encKey
    decKey = new Uint32Array(expandedKeyLen); // Preallocate space for decKey

    // schedule encryption keys
    let i = keyLen;
    for (; i < 4 * keyLen + 28; i++) {
      tmp = encKey[i - 1] as number;

      // apply sbox
      if (i % keyLen === 0 || (keyLen === 8 && i % keyLen === 4)) {
        tmp =
          ((sbox[tmp >>> 24] as number) << 24) ^
          ((sbox[(tmp >> 16) & 255] as number) << 16) ^
          ((sbox[(tmp >> 8) & 255] as number) << 8) ^
          (sbox[tmp & 255] as number);

        // shift rows and add rcon
        if (i % keyLen === 0) {
          tmp = (tmp << 8) ^ (tmp >>> 24) ^ (rcon << 24);
          rcon = (rcon << 1) ^ ((rcon >> 7) * 283);
        }
      }

      encKey[i] = (encKey[i - keyLen] as number) ^ tmp;
    }

    // schedule decryption keys
    for (let j = 0; i; j++, i--) {
      tmp = encKey[j & 3 ? i : i - 4] as number;
      if (i <= 4 || j < 4) {
        decKey[j] = tmp;
      } else {
        decKey[j] =
          ((decTable[0] as Uint32Array)[sbox[tmp >>> 24] as number] as number) ^
          ((decTable[1] as Uint32Array)[
            sbox[(tmp >> 16) & 255] as number
          ] as number) ^
          ((decTable[2] as Uint32Array)[
            sbox[(tmp >> 8) & 255] as number
          ] as number) ^
          ((decTable[3] as Uint32Array)[sbox[tmp & 255] as number] as number);
      }
    }
    this._key = [encKey, decKey];
  }

  encrypt(data: Uint32Array) {
    return this._crypt(data, 0);
  }
  decrypt(data: Uint32Array) {
    return this._crypt(data, 1);
  }

  _precompute() {
    const encTable = this._tables[0];
    const decTable = this._tables[1];
    const sbox = encTable[4];
    const sboxInv = decTable[4];
    let i: number;
    let x: number;
    let xInv: number;
    const d = new Uint8Array(256);
    const th = new Uint8Array(256);
    let x2: number;
    let x4: number;
    let x8: number;
    let s: number;
    let tEnc: number;
    let tDec: number;

    // Compute double and third tables
    for (i = 0; i < 256; i++) {
      d[i] = (i << 1) ^ ((i >> 7) * 283);
      th[(d[i] as number) ^ i] = i;
    }

    for (x = xInv = 0; !sbox[x]; x ^= x2 || 1, xInv = th[xInv] || 1) {
      // Compute sbox
      s = xInv ^ (xInv << 1) ^ (xInv << 2) ^ (xInv << 3) ^ (xInv << 4);
      s = (s >> 8) ^ (s & 255) ^ 99;
      sbox[x] = s;
      sboxInv[s] = x;

      // Compute MixColumns
      x2 = d[x] as number;
      x4 = d[x2 as number] as number;
      x8 = d[x4 as number] as number;
      tDec = (x8 * 0x1010101) ^ (x4 * 0x10001) ^ (x2 * 0x101) ^ (x * 0x1010100);
      tEnc = ((d[s] as number) * 0x101) ^ (s * 0x1010100);

      for (i = 0; i < 4; i++) {
        (encTable[i] as Uint32Array)[x] = tEnc = (tEnc << 24) ^ (tEnc >>> 8);
        (decTable[i] as Uint32Array)[s] = tDec = (tDec << 24) ^ (tDec >>> 8);
      }
    }
  }

  _crypt(input: Uint32Array, dir: number) {
    if (input.length !== 4) {
      throw new Error("invalid aes block size");
    }

    const key = this._key[dir] as Uint32Array;
    // state variables a,b,c,d are loaded with pre-whitened data
    let a = (input[0] as number) ^ (key[0] as number);
    let b = (input[dir ? 3 : 1] as number) ^ (key[1] as number);
    let c = (input[2] as number) ^ (key[2] as number);
    let d = (input[dir ? 1 : 3] as number) ^ (key[3] as number);
    let a2: number;
    let b2: number;
    let c2: number;

    const nInnerRounds = key.length / 4 - 2;
    let i: number;
    let kIndex = 4;
    const out = new Uint32Array(4); // <--- this is slower in Node.js, about the same in Chrome */
    const table = this._tables[dir] as [
      Uint32Array,
      Uint32Array,
      Uint32Array,
      Uint32Array,
      Uint32Array,
    ];

    // load up the tables
    const t0 = table[0];
    const t1 = table[1];
    const t2 = table[2];
    const t3 = table[3];
    const sbox = table[4];

    // Inner rounds.  Cribbed from OpenSSL.
    for (i = 0; i < nInnerRounds; i++) {
      a2 =
        (t0[a >>> 24] as number) ^
        (t1[(b >> 16) & 255] as number) ^
        (t2[(c >> 8) & 255] as number) ^
        (t3[d & 255] as number) ^
        (key[kIndex] as number);
      b2 =
        (t0[b >>> 24] as number) ^
        (t1[(c >> 16) & 255] as number) ^
        (t2[(d >> 8) & 255] as number) ^
        (t3[a & 255] as number) ^
        (key[kIndex + 1] as number);
      c2 =
        (t0[c >>> 24] as number) ^
        (t1[(d >> 16) & 255] as number) ^
        (t2[(a >> 8) & 255] as number) ^
        (t3[b & 255] as number) ^
        (key[kIndex + 2] as number);
      d =
        (t0[d >>> 24] as number) ^
        (t1[(a >> 16) & 255] as number) ^
        (t2[(b >> 8) & 255] as number) ^
        (t3[c & 255] as number) ^
        (key[kIndex + 3] as number);
      kIndex += 4;
      a = a2;
      b = b2;
      c = c2;
    }

    // Last round.
    for (i = 0; i < 4; i++) {
      out[dir ? 3 & -i : i] =
        ((sbox[a >>> 24] as number) << 24) ^
        ((sbox[(b >> 16) & 255] as number) << 16) ^
        ((sbox[(c >> 8) & 255] as number) << 8) ^
        (sbox[d & 255] as number) ^
        (key[kIndex++] as number);
      a2 = a;
      a = b;
      b = c;
      c = d;
      d = a2;
    }

    return out;
  }
}
