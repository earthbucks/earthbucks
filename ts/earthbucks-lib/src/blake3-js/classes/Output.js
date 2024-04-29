import compress from "./compress";
import {
  first_8_words,
  or,
  intu32,
  intu64,
  little_endian_bytes_from_words,
} from "../util";

const ROOT = intu32(1 << 3);

class Output {
  /*
	input_chaining_value: [u32; 8],
    block_words: [u32; 16],
    counter: u64,
    block_len: u32,
    flags: u32,
    */
  constructor(input_chaining_value, block_words, counter, block_len, flags) {
    this.input_chaining_value = input_chaining_value;
    this.block_words = block_words;
    this.counter = counter;
    this.block_len = block_len;
    this.flags = flags;
  }

  chaining_value() {
    return first_8_words(
      compress(
        this.input_chaining_value,
        this.block_words,
        this.counter,
        this.block_len,
        this.flags,
      ),
    );
  }

  //returns an array of bytes (u8)
  root_output_bytes(outputLength) {
    let output_block_counter = 0;
    let out_blocks = [];

    while (out_blocks.length < outputLength) {
      let words = compress(
        this.input_chaining_value,
        this.block_words,
        intu64(output_block_counter),
        this.block_len,
        or(this.flags, ROOT),
      );
      // The output length might not be a multiple of 4.
      for (const word of words) {
        out_blocks = [...out_blocks, ...little_endian_bytes_from_words([word])];
      }
      output_block_counter += 1;
    }

    return out_blocks.slice(0, outputLength);
  }
}

export default Output;
