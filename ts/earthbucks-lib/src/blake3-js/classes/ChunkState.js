import {
  words_from_little_endian_bytes,
  first_8_words,
  intu64,
  intu32,
  or,
} from "../util";
import compress from "./compress";
import Output from "./Output";

const CHUNK_START = intu32(1 << 0);
const CHUNK_END = intu32(1 << 1);
const BLOCK_LEN = 64;

export default class ChunkState {
  /*    
		chaining_value: [u32; 8],
	    chunk_counter: int,
	    block: [u8; BLOCK_LEN],
	    block_len: u8,
	    blocks_compressed: u8,
	    flags: u32,
    */
  constructor(key, chunk_counter, flags) {
    this.chaining_value = key;
    this.chunk_counter = chunk_counter;
    (this.block = []).length = BLOCK_LEN;
    this.block.fill(intu32(0));
    this.block_len = 0;
    this.blocks_compressed = 0;
    this.flags = flags;
  }

  len() {
    return BLOCK_LEN * this.blocks_compressed + this.block_len;
  }

  start_flag() {
    if (this.blocks_compressed === 0) {
      return CHUNK_START;
    } else {
      return intu32(0);
    }
  }

  //input is an array of u8
  update(input) {
    while (input.length) {
      // If the block buffer is full, compress it and clear it. More
      // input is coming, so this compression is not CHUNK_END.
      if (this.block_len == BLOCK_LEN) {
        let block_words = words_from_little_endian_bytes(this.block);
        this.chaining_value = first_8_words(
          compress(
            this.chaining_value,
            block_words,
            intu64(this.chunk_counter),
            intu32(BLOCK_LEN),
            or(this.flags, this.start_flag()),
          ),
        );
        this.blocks_compressed += 1;
        (this.block = []).length = BLOCK_LEN;
        this.block.fill(intu32(0));
        this.block_len = 0;
      }

      // Copy input bytes into the block buffer.
      let want = BLOCK_LEN - this.block_len;
      let take = Math.min(want, input.length);
      for (let i = 0; i < take; i++) {
        const j = i + this.block_len;
        this.block[j] = input[i];
      }

      this.block_len += take;
      if (take === input.length) {
        input = [];
      } else {
        input = input.slice(take);
      }
    }
  }

  output() {
    let block_words = words_from_little_endian_bytes(this.block);
    const output = new Output(
      this.chaining_value,
      block_words,
      intu64(this.chunk_counter),
      intu32(this.block_len),
      or(or(this.flags, this.start_flag()), CHUNK_END),
    );
    return output;
  }
}
