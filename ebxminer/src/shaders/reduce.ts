export default `
@group(0) @binding(0)
var<storage,read_write> reduced: array<u32, 6508>;

@group(0) @binding(1)
var<storage,read_write> matrix: array<u32, 2647129>;

const MATRIX_SIZE: u32 = 1627u;

var<workgroup> sums: array<u32, 256>;
var<workgroup> maxs: array<u32, 256>;
var<workgroup> mins: array<u32, 256>;

@compute @workgroup_size(256)
fn main(
  @builtin(global_invocation_id) global_id: vec3<u32>,
  @builtin(local_invocation_id) local_id: vec3<u32>,
  @builtin(workgroup_id) workgroup_id: vec3<u32>
) {
  let first = matrix[0];
  let selected_row = min(max(first, 0), 1626);
  let row_output_offset = MATRIX_SIZE + MATRIX_SIZE + MATRIX_SIZE;

  var row_sum: u32 = 0u;
  var row_max: u32 = 0x00000000;
  var row_min: u32 = 0xFFFFFFFF;
  var do_row = global_id.y == selected_row;
  let start = global_id.x * 7u;
  let finish = min(start + 7u, MATRIX_SIZE);
  for(var k: u32 = start; k < finish; k = k + 1u) {
    var val: u32 = matrix[global_id.y * MATRIX_SIZE + k];
    row_sum = row_sum + val;
    row_max = max(row_max, val);
    row_min = min(row_min, val);
    if (do_row) {
      reduced[k + row_output_offset] = val;
    }
  }

  sums[local_id.x] = row_sum;
  maxs[local_id.x] = row_max;
  mins[local_id.x] = row_min;

  workgroupBarrier();

  var i = local_id.x + 128u;

  if (local_id.x < 128u) {
    sums[local_id.x] = sums[local_id.x] + sums[i];
    maxs[local_id.x] = max(maxs[local_id.x], maxs[i]);
    mins[local_id.x] = min(mins[local_id.x], mins[i]);
  }

  workgroupBarrier();

  i = local_id.x + 64u;

  if (local_id.x < 64u) {
    sums[local_id.x] = sums[local_id.x] + sums[i];
    maxs[local_id.x] = max(maxs[local_id.x], maxs[i]);
    mins[local_id.x] = min(mins[local_id.x], mins[i]);
  }

  workgroupBarrier();

  i = local_id.x + 32u;

  if (local_id.x < 32u) {
    sums[local_id.x] = sums[local_id.x] + sums[i];
    maxs[local_id.x] = max(maxs[local_id.x], maxs[i]);
    mins[local_id.x] = min(mins[local_id.x], mins[i]);
  }

  workgroupBarrier();

  i = local_id.x + 16u;

  if (local_id.x < 16u) {
    sums[local_id.x] = sums[local_id.x] + sums[i];
    maxs[local_id.x] = max(maxs[local_id.x], maxs[i]);
    mins[local_id.x] = min(mins[local_id.x], mins[i]);
  }

  workgroupBarrier();

  i = local_id.x + 8u;

  if (local_id.x < 8u) {
    sums[local_id.x] = sums[local_id.x] + sums[i];
    maxs[local_id.x] = max(maxs[local_id.x], maxs[i]);
    mins[local_id.x] = min(mins[local_id.x], mins[i]);
  }

  workgroupBarrier();

  i = local_id.x + 4u;

  if (local_id.x < 4u) {
    sums[local_id.x] = sums[local_id.x] + sums[i];
    maxs[local_id.x] = max(maxs[local_id.x], maxs[i]);
    mins[local_id.x] = min(mins[local_id.x], mins[i]);
  }

  workgroupBarrier();

  i = local_id.x + 2u;

  if (local_id.x < 2u) {
    sums[local_id.x] = sums[local_id.x] + sums[i];
    maxs[local_id.x] = max(maxs[local_id.x], maxs[i]);
    mins[local_id.x] = min(mins[local_id.x], mins[i]);
  }

  workgroupBarrier();

  if (local_id.x == 0u) {
    reduced[global_id.y] = sums[local_id.x] + sums[local_id.x + 1u];
    reduced[global_id.y + MATRIX_SIZE] = max(maxs[local_id.x], maxs[local_id.x + 1u]);
    reduced[global_id.y + MATRIX_SIZE + MATRIX_SIZE] = min(mins[local_id.x], mins[local_id.x + 1u]);
  }
}
`;