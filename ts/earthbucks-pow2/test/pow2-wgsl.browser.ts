// src/wasm.node.test.ts
import { describe, test, expect } from 'vitest';
import { sha256 } from "../src/pow2-wgsl.js";
import { WebBuf } from '@earthbucks/lib';

describe('Pow2 tests', async () => {
  test('sha256 library against crypto', async () => {
    const data = WebBuf.fromHex('1234');
    const result = await sha256(data);
    expect(result.toHex()).toBe('3a103a4e5729ad68c02a678ae39accfbc0ae208096437401b7ceab63cca0622f');

    const sha256hash = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(sha256hash);
    const hashHex = Array.from(hashArray, byte => byte.toString(16).padStart(2, '0')).join('');
    expect(result.toHex()).toBe(hashHex);
  })
});
