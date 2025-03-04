export default `
@group(0) @binding(0)
var<storage,read_write> input_row: array<u32, 96>;

@group(0) @binding(1)
var<storage,read_write> output_col: array<u32, 96>;

const MATRIX_SIZE: u32 = 1627u;
const INPUT_LENGTH: u32 = 2816u;

var<workgroup> slice: array<u32, 32>;

@compute @workgroup_size(32)
fn main(
  @builtin(global_invocation_id) global_id: vec3<u32>,
  @builtin(local_invocation_id) local_id: vec3<u32>,
  @builtin(workgroup_id) workgroup_id: vec3<u32>
) {
  let row_index = (MATRIX_SIZE * global_id.x) % INPUT_LENGTH;
  let row_int = row_index / 32u;
  let row_bit = row_index % 32u;

  let bit: u32 = (input_row[row_int] >> (31u - row_bit)) & 1u;
  slice[local_id.x] = bit << (31u - local_id.x);

  workgroupBarrier();

  if (local_id.x == 0u) {
    output_col[workgroup_id.x] = 
      (
        slice[0] |
        slice[1] |
        slice[2] |
        slice[3] |
        slice[4] |
        slice[5] |
        slice[6] |
        slice[7] |
        slice[8] |
        slice[9] |
        slice[10] |
        slice[11] |
        slice[12] |
        slice[13] |
        slice[14] |
        slice[15] |
        slice[16] |
        slice[17] |
        slice[18] |
        slice[19] |
        slice[20] |
        slice[21] |
        slice[22] |
        slice[23] |
        slice[24] |
        slice[25] |
        slice[26] |
        slice[27] |
        slice[28] |
        slice[29] |
        slice[30] |
        slice[31]
      );
  }
}
`;
