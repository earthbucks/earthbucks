/*
https://gist.github.com/cf/a161f29bbb0a8ef43745bd0d516a3e5c

MIT License

Copyright (c) 2024 QED Protocol (Zero Knowledge Labs Limited)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

alias Blake3BlockWords = array<u32,16>;
alias Blake3HashOut = array<u32,8>;

// precomputed permutation indicies
const MSG_PERMUTATION_2D = array<array<i32,16>,7>(
  array<i32,16>(0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15),
  array<i32,16>(2,6,3,10,7,0,4,13,1,11,12,5,9,14,15,8),
  array<i32,16>(3,4,10,12,13,2,7,14,6,5,9,0,11,15,8,1),
  array<i32,16>(10,7,12,9,14,3,13,15,4,0,11,2,5,8,1,6),
  array<i32,16>(12,13,9,11,15,10,14,8,7,2,5,3,0,1,6,4),
  array<i32,16>(9,14,11,5,8,12,15,1,13,3,0,10,2,6,4,7),
  array<i32,16>(11,15,5,0,1,9,8,6,14,10,2,12,3,4,7,13)
);

// using private varaible so we don't have to keep copying around the permutation state
var<private> state: Blake3BlockWords;
var<private> blockWords: Blake3BlockWords;

fn rot_right_16(x: u32) -> u32{
  return (x>>16)|(x<<16);
}

fn rot_right_12(x: u32) -> u32{
  return (x>>12)|(x<<20);
}

fn rot_right_8(x: u32) -> u32{
  return (x>>8)|(x<<24);
}

fn rot_right_7(x: u32) -> u32{
  return (x>>7)|(x<<25);
}

fn blake3_g(a: i32, b: i32, c: i32, d: i32, mx: u32, my: u32){
  state[a] = state[a] + state[b] + mx;

  state[d] = rot_right_16(state[d] ^ state[a]);
  state[c] = state[c] + state[d];
  state[b] = rot_right_12(state[b] ^ state[c]);
  state[a] = state[a] + state[b] + my;
  state[d] = rot_right_8(state[d] ^ state[a]);
  state[c] = state[c] + state[d];
  state[b] = rot_right_7(state[b] ^ state[c]);

}

fn blake3_round_fn(round: i32){
  blake3_g(0, 4, 8, 12, blockWords[MSG_PERMUTATION_2D[round][0]], blockWords[MSG_PERMUTATION_2D[round][1]]);
  blake3_g(1, 5, 9, 13, blockWords[MSG_PERMUTATION_2D[round][2]], blockWords[MSG_PERMUTATION_2D[round][3]]);
  blake3_g(2, 6, 10, 14, blockWords[MSG_PERMUTATION_2D[round][4]], blockWords[MSG_PERMUTATION_2D[round][5]]);
  blake3_g(3, 7, 11, 15, blockWords[MSG_PERMUTATION_2D[round][6]], blockWords[MSG_PERMUTATION_2D[round][7]]);

  // Mix diagonals
  blake3_g(0, 5, 10, 15, blockWords[MSG_PERMUTATION_2D[round][8]], blockWords[MSG_PERMUTATION_2D[round][9]]);
  blake3_g(1, 6, 11, 12, blockWords[MSG_PERMUTATION_2D[round][10]], blockWords[MSG_PERMUTATION_2D[round][11]]);
  blake3_g(2, 7, 8, 13, blockWords[MSG_PERMUTATION_2D[round][12]], blockWords[MSG_PERMUTATION_2D[round][13]]);
  blake3_g(3, 4, 9, 14, blockWords[MSG_PERMUTATION_2D[round][14]], blockWords[MSG_PERMUTATION_2D[round][15]]);
}

fn blake3_two_to_one() {
  blake3_round_fn(0);
  blake3_round_fn(1);
  blake3_round_fn(2);
  blake3_round_fn(3);
  blake3_round_fn(4);
  blake3_round_fn(5);
  blake3_round_fn(6);

  state[0] ^= state[8];
  state[8] ^= 1779033703;
  state[1] ^= state[9];
  state[9] ^= 3144134277;
  state[2] ^= state[10];
  state[10] ^= 1013904242;
  state[3] ^= state[11];
  state[11] ^= 2773480762;
  state[4] ^= state[12];
  state[12] ^= 1359893119;
  state[5] ^= state[13];
  state[13] ^= 2600822924;
  state[6] ^= state[14];
  state[14] ^= 528734635;
  state[7] ^= state[15];
  state[15] ^= 1541459225;
}

fn copyToBlockWordsFromArrayTwoToOne(a: Blake3HashOut, b: Blake3HashOut) {
  blockWords[0] = a[0];
  blockWords[1] = a[1];
  blockWords[2] = a[2];
  blockWords[3] = a[3];

  blockWords[4] = a[4];
  blockWords[5] = a[5];
  blockWords[6] = a[6];
  blockWords[7] = a[7];

  blockWords[8] = b[0];
  blockWords[9] = b[1];
  blockWords[10] = b[2];
  blockWords[11] = b[3];

  blockWords[12] = b[4];
  blockWords[13] = b[5];
  blockWords[14] = b[6];
  blockWords[15] = b[7];
}

fn getFinalizedHashOut() -> Blake3HashOut {
  return array<u32,8>(
    state[0],
    state[1],
    state[2],
    state[3],
    state[4],
    state[5],
    state[6],
    state[7],
  );
}

@group(0) @binding(0) var<storage, read_write>data: array<Blake3HashOut>;

@compute @workgroup_size(1) fn computeParentMerkleHash(
  @builtin(global_invocation_id) id: vec3<u32>
) {
  let i = id.x+id.y*32768u; // parent node index
  let base = i * 2u;
  state[0] = 1779033703u;
  state[1] = 3144134277u;
  state[2] = 1013904242u;
  state[3] = 2773480762u;
  state[4] = 1359893119u;
  state[5] = 2600822924u;
  state[6] = 528734635u;
  state[7] = 1541459225u;
  state[8] = 1779033703u;
  state[9] = 3144134277u;
  state[10] = 1013904242u;
  state[11] = 2773480762u;
  state[12] = 0u;
  state[13] = 0u;
  state[14] = 64u;
  state[15] = 11u;
  copyToBlockWordsFromArrayTwoToOne(data[base], data[base + 1]);
  blake3_two_to_one();
  data[i] = getFinalizedHashOut();
}