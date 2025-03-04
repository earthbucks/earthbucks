export default `
@group(0) @binding(0)
var<storage,read_write> input_row: array<u32, 96>;

fn swap(value: u32) -> u32 {
  let byte0 = (value & 0x000000FF) << 24;
  let byte1 = (value & 0x0000FF00) << 8;
  let byte2 = (value & 0x00FF0000) >> 8;
  let byte3 = (value & 0xFF000000) >> 24;
  return byte0 | byte1 | byte2 | byte3;
}

@compute @workgroup_size(1)
fn main(
  @builtin(global_invocation_id) global_id: vec3<u32>,
) {
  input_row[global_id.x] = swap(input_row[global_id.x]);
}
`;
