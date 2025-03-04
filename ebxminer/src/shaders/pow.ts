export default `
@group(0) @binding(0)
var<storage,read_write> input_row: array<u32, 96>;

@group(0) @binding(1)
var<storage,read_write> input_col: array<u32, 96>;

@group(1) @binding(0)
var<storage,read_write> reduced: array<u32, 6508>;

@group(1) @binding(1)
var<storage,read_write> matrix: array<u32, 2647129>;

const MATRIX_SIZE: u32 = 1627u;
const INPUT_LENGTH: u32 = 2816u;
const LAST_ELEMENT_MASK: u32 = 0xffffffe0;
const MAGIC_NUMBER: u32 = 2771u;

var<workgroup> wg_input_row: array<u32, 96>;
var<workgroup> wg_input_col: array<u32, 96>;
var<workgroup> rows: array<u32, 416>;
var<workgroup> cols: array<u32, 416>;
var<workgroup> sub_matrix: array<array<u32, 4>, 64>;

fn extract_row_u32(bit_offset: u32) -> u32 {
  var start_index = bit_offset / 32;
  let start_bit = bit_offset % 32;

  let inta = wg_input_row[start_index];

  if (start_bit == 0u) {
      return inta;
  }

  let intb = wg_input_row[start_index + 1u];

  let first_part = (inta << start_bit);

  let remaining_bits = 32u - start_bit;

  var second_part = (intb & ((1u >> start_bit) - 1u)) >> remaining_bits;

  // Combine both parts to form the final 32-bit output
  return (first_part | second_part);
}

fn extract_col_u32(bit_offset: u32) -> u32 {
  var start_index = bit_offset / 32;
  let start_bit = bit_offset % 32;

  let inta = wg_input_col[start_index];

  if (start_bit == 0u) {
      return inta;
  }

  let intb = wg_input_col[start_index + 1u];

  let first_part = (inta << start_bit);

  let remaining_bits = 32u - start_bit;

  var second_part = (intb & ((1u >> start_bit) - 1u)) >> remaining_bits;

  // Combine both parts to form the final 32-bit output
  return (first_part | second_part);
}

@compute @workgroup_size(8, 8, 4)
fn main(
  @builtin(global_invocation_id) global_id: vec3<u32>,
  @builtin(local_invocation_id) local_id: vec3<u32>,
  @builtin(workgroup_id) workgroup_id: vec3<u32>
) {
  let linear_id = local_id.x + local_id.y * 8u + local_id.z * 64u;
  if (linear_id < 96u) {
    wg_input_row[linear_id] = input_row[linear_id];
  } else if (linear_id  < 192u) {
    wg_input_col[linear_id - 96u] = input_col[linear_id - 96u];
  }

  workgroupBarrier();

  let row = local_id.y;
  let col = local_id.x;
  var row_id = local_id.x + local_id.z * 8u;
  var col_id = local_id.y + local_id.z * 8u;
  var rows_index = row * 52u + row_id;
  var cols_index = col * 52u + col_id;
  var start_bit = (global_id.y * MATRIX_SIZE + row_id * 32u) % INPUT_LENGTH;

  if (global_id.y < 1627) {
    rows[rows_index] = extract_row_u32(start_bit);
  }

  workgroupBarrier();

  start_bit = (global_id.x * MAGIC_NUMBER + col_id * 32u) % INPUT_LENGTH;

  if (global_id.x < 1627) {
    cols[cols_index] = extract_col_u32(start_bit);
  }

  workgroupBarrier();

  row_id = row_id + 32u;
  col_id = col_id + 32u;
  rows_index = rows_index + 32u;
  cols_index = cols_index + 32u;
  start_bit = (global_id.y * MATRIX_SIZE + row_id * 32u) % INPUT_LENGTH;

  if (global_id.y < 1627 && row_id < 51) {
    if (row_id == 50) {
      rows[rows_index] = extract_row_u32(start_bit) & LAST_ELEMENT_MASK;
    } else {
      rows[rows_index] = extract_row_u32(start_bit);
    }
  }

  workgroupBarrier();

  start_bit = (global_id.x * MAGIC_NUMBER + col_id * 32u) % INPUT_LENGTH;

  if (global_id.x < 1627 && col_id < 51) {
    if (col_id == 50) {
      cols[cols_index] = extract_col_u32(start_bit) & LAST_ELEMENT_MASK;
    } else {
      cols[cols_index] = extract_col_u32(start_bit);
    }
  }

  workgroupBarrier();

  var x: u32 = local_id.x;
  var y: u32 = local_id.y;
  var z: u32 = local_id.z;
  var out_x: u32 = global_id.x;
  var out_y: u32 = global_id.y;
  if (out_x < MATRIX_SIZE && out_y < MATRIX_SIZE) {
    var sum: u32 = 0u;
    let start = local_id.z * 16u;
    let finish = start + 16u;
    for(var k: u32 = start; k < finish && k < 52u; k = k + 4u) {
      let c = vec4(
        cols[x * 52 + k],
        cols[x * 52 + k + 1u],
        cols[x * 52 + k + 2u],
        cols[x * 52 + k + 3u]
      );
      let r = vec4(
        rows[y * 52 + k],
        rows[y * 52 + k + 1u],
        rows[y * 52 + k + 2u],
        rows[y * 52 + k + 3u]
      );
      let one_bits = countOneBits(c & r);
      sum = sum + one_bits.x + one_bits.y + one_bits.z + one_bits.w;
    }

    sub_matrix[x + y * 8u][z] = sum;
  }

  workgroupBarrier();

  if (local_id.z == 0 && out_x < MATRIX_SIZE && out_y < MATRIX_SIZE) {
    let offset = x + y * 8u;
    matrix[out_x + out_y * MATRIX_SIZE] = sub_matrix[offset][0] + sub_matrix[offset][1] + sub_matrix[offset][2] + sub_matrix[offset][3];
  }
}
`;