import Output from "./Output?test=1";
import { intu64, or, intu32 } from "../util?test=1";

const BLOCK_LEN = intu32(64);
const PARENT = intu32(1 << 2);

/* left_child_cv: [u32; 8],
right_child_cv: [u32; 8],
key: [u32; 8],
flags: u32,*/
export default function parent_output(
  left_child_cv,
  right_child_cv,
  key,
  flags,
) {
  let block_words = [
    ...left_child_cv.slice(0, 8),
    ...right_child_cv.slice(0, 8),
  ];

  return new Output(
    key,
    block_words,
    intu64(0), // Always 0 for parent nodes.
    BLOCK_LEN, // Always BLOCK_LEN (64) for parent nodes.
    or(PARENT, flags),
  );
}
