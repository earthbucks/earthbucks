import {
	or,
	intu8,
	u8hex,
	intu32,
	intu64,
	u64int,
	words_from_little_endian_bytes,
	bitwiseShift
} from "../util";
import ChunkState from "./ChunkState";
import Output from "./Output";

const BLOCK_LEN = intu32(64);
const KEY_LEN = 32;
const PARENT = intu32(1 << 2);
const IV = [
	intu32(0x6a09e667),
	intu32(0xbb67ae85),
	intu32(0x3c6ef372),
	intu32(0xa54ff53a),
	intu32(0x510e527f),
	intu32(0x9b05688c),
	intu32(0x1f83d9ab),
	intu32(0x5be0cd19)
];
const KEYED_HASH = intu32(1 << 4);
const DERIVE_KEY_CONTEXT = intu32(1 << 5);
const DERIVE_KEY_MATERIAL = intu32(1 << 6);
const CHUNK_LEN = 1024;

/*
    left_child_cv: [u32; 8],
    right_child_cv: [u32; 8],
    key: [u32; 8],
    flags: u32
	returns u32, length 8
*/
function parent_cv(left_child_cv, right_child_cv, key, flags) {
	const parentOutput = parent_output(left_child_cv, right_child_cv, key, flags);
	return parentOutput.chaining_value();
}

/* left_child_cv: [u32; 8],
right_child_cv: [u32; 8],
key: [u32; 8],
flags: u32,*/
function parent_output(left_child_cv, right_child_cv, key, flags) {
	let block_words = [...left_child_cv.slice(0, 8), ...right_child_cv.slice(0, 8)];

	return new Output(
		key,
		block_words,
		intu64(0), // Always 0 for parent nodes.
		BLOCK_LEN, // Always BLOCK_LEN (64) for parent nodes.
		or(PARENT, flags)
	);
}

function keyFromString(input) {
	let output = new Uint8Array(input.length);
	for (var i = 0; i < input.length; ++i) {
		output[i] = input.charCodeAt(i);
	}
	return output;
}

export default class Hasher {
	constructor(key, flags) {
		this.chunk_state = new ChunkState(key, 0, flags);
		this.key = key;
		this.cv_stack = [];
		this.cv_stack_len = 0;
		this.flags = flags;
	}

	static newRegular() {
		return new Hasher(IV, intu32(0));
	}

	static newKeyed(key) {
		if (typeof key == "string") {
			key = keyFromString(key);
		} else {
			input = new Uint8Array(key);
		}

		const keyWords = words_from_little_endian_bytes(key);
		return new Hasher(keyWords, KEYED_HASH);
	}

	//context: &str
	static newDeriveKey(context) {
		const contextHasher = new Hasher(IV, DERIVE_KEY_CONTEXT);
		contextHasher.update(context);
		const key = contextHasher.finalize(KEY_LEN, "bytes");
		const keyWords = words_from_little_endian_bytes(key);
		return new Hasher(keyWords, DERIVE_KEY_MATERIAL);
	}

	//cv: [u32; 8]
	pushStack(cv) {
		this.cv_stack[this.cv_stack_len] = cv;
		this.cv_stack_len += 1;
	}

	popStack() {
		this.cv_stack_len -= 1;
		return this.cv_stack[this.cv_stack_len];
	}

	/*
		new_cv: [u32; 8] 
		total_chunks: u64
	*/
	addChunkChainingValue(newCV, totalChunks) {
		while (u64int(totalChunks) % 2 == 0) {
			newCV = parent_cv(this.popStack(), newCV, this.key, this.flags);
			totalChunks = bitwiseShift(totalChunks, 1);
		}
		this.pushStack(newCV);
		return totalChunks;
	}

	/*
		input &[u8]
	*/
	update(input) {
		if (typeof input == "string") {
			input = keyFromString(input);
		} else {
			input = new Uint8Array(input);
		}

		while (input.length) {
			// If the current chunk is complete, finalize it and reset the
			// chunk state. More input is coming, so this chunk is not ROOT.
			if (this.chunk_state.len() == CHUNK_LEN) {
				let chunkCV = this.chunk_state.output().chaining_value();
				let totalChunks = intu64(this.chunk_state.chunk_counter + 1);
				this.addChunkChainingValue(chunkCV, totalChunks);
				this.chunk_state = new ChunkState(this.key, u64int(totalChunks), this.flags);
			}

			let want = CHUNK_LEN - this.chunk_state.len();
			let take = Math.min(want, input.length);
			this.chunk_state.update(input.slice(0, take));

			if (take === input.length) {
				input = [];
			} else {
				input = input.slice(take);
			}
		}
		return this;
	}

	finalize(outputLength = 32, outputFormat = "hex") {
		// Starting with the Output from the current chunk, compute all the
		// parent chaining values along the right edge of the tree, until we
		// have the root Output.
		let output = this.chunk_state.output();

		let parent_nodes_remaining = this.cv_stack_len;
		while (parent_nodes_remaining > 0) {
			parent_nodes_remaining -= 1;
			output = parent_output(
				this.cv_stack[parent_nodes_remaining],
				output.chaining_value(),
				this.key,
				this.flags
			);
		}

		const bytes = output.root_output_bytes(outputLength);
		if (outputFormat == "hex") {
			return bytes.map(u8hex).join("");
		} else {
			return bytes;
		}
	}
}
