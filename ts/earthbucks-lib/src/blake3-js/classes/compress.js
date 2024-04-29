import {
  u64u32,
  bitwiseShift,
  xor,
  intu32,
  wrappingAdd,
  rotateRight,
} from "../util";

export function g(state, a, b, c, d, mx, my) {
  state[a] = wrappingAdd(wrappingAdd(state[a], state[b]), mx);
  state[d] = rotateRight(xor(state[d], state[a]), 16);
  state[c] = wrappingAdd(state[c], state[d]);
  state[b] = rotateRight(xor(state[b], state[c]), 12);
  state[a] = wrappingAdd(wrappingAdd(state[a], state[b]), my);
  state[d] = rotateRight(xor(state[d], state[a]), 8);
  state[c] = wrappingAdd(state[c], state[d]);
  state[b] = rotateRight(xor(state[b], state[c]), 7);
  return state;
}

export function round(input, m) {
  //clone the array to prevent mutating the source
  let state = input.slice(0);

  // Mix the columns.
  state = g(state, 0, 4, 8, 12, m[0], m[1]);
  state = g(state, 1, 5, 9, 13, m[2], m[3]);
  state = g(state, 2, 6, 10, 14, m[4], m[5]);
  state = g(state, 3, 7, 11, 15, m[6], m[7]);
  // Mix the diagonals.
  state = g(state, 0, 5, 10, 15, m[8], m[9]);
  state = g(state, 1, 6, 11, 12, m[10], m[11]);
  state = g(state, 2, 7, 8, 13, m[12], m[13]);
  state = g(state, 3, 4, 9, 14, m[14], m[15]);
  return state;
}

export function permute(block, MSG_PERMUTATION) {
  let result = [];
  for (let i = 0; i < 16; i++) {
    result[i] = block[MSG_PERMUTATION[i]];
  }
  return result;
}

const IV = [
  intu32(0x6a09e667),
  intu32(0xbb67ae85),
  intu32(0x3c6ef372),
  intu32(0xa54ff53a),
  intu32(0x510e527f),
  intu32(0x9b05688c),
  intu32(0x1f83d9ab),
  intu32(0x5be0cd19),
];

const MSG_PERMUTATION = [2, 6, 3, 10, 7, 0, 4, 13, 1, 11, 12, 5, 9, 14, 15, 8];

/*
	chainingValues 
	block is an array of u32 ints in string binary form.
*/
export default function compress(
  chainingValues,
  block,
  counter,
  blockLen,
  flags,
) {
  let state = [
    chainingValues[0],
    chainingValues[1],
    chainingValues[2],
    chainingValues[3],
    chainingValues[4],
    chainingValues[5],
    chainingValues[6],
    chainingValues[7],
    IV[0],
    IV[1],
    IV[2],
    IV[3],
    u64u32(counter),
    u64u32(bitwiseShift(counter, 32)),
    blockLen,
    flags,
  ];
  state = round(state, block); // round 1
  block = permute(block, MSG_PERMUTATION);
  state = round(state, block); // round 2
  block = permute(block, MSG_PERMUTATION);
  state = round(state, block); // round 3
  block = permute(block, MSG_PERMUTATION);
  state = round(state, block); // round 4
  block = permute(block, MSG_PERMUTATION);
  state = round(state, block); // round 5
  block = permute(block, MSG_PERMUTATION);
  state = round(state, block); // round 6
  block = permute(block, MSG_PERMUTATION);
  state = round(state, block); // round 7

  for (let i = 0; i < 8; i++) {
    state[i] = xor(state[i], state[i + 8]);
    state[i + 8] = xor(state[i + 8], chainingValues[i]);
  }

  return state;
}
