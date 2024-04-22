export function intu8(n) {
	if (n > 255) {
		n -= 256;
	}
	return n.toString(2).padStart(8, "0");
}

export function intu32(n) {
	if (n > 4294967295) {
		n -= 4294967296;
	}
	return n.toString(2).padStart(32, "0");
}

export function intu64(n) {
	return n.toString(2).padStart(64, "0");
}

export function bitwiseShift(a, n, total = 64) {
	let result = a.substring(0, total - n);
	for (let i = 0; i < n; i++) {
		result = "0" + result;
	}
	return result;
}

export function u64u32(a) {
	return a.substring(32, 64);
}

export function wrappingAdd(a, b) {
	let result = u32int(a) + u32int(b);
	if (result > 4294967295) {
		result -= 4294967296;
	}
	return intu32(result);
}

export function u32hex(a) {
	return parseInt(a, 2)
		.toString(16)
		.padStart(2, "0");
}

export function u64int(a) {
	return parseInt(a, 2);
}

export function u32int(a) {
	return parseInt(a, 2);
}

export function u8hex(a) {
	return a.toString(16).padStart(2, "0");
}

export function rotateRight(a, n) {
	return a.substring(32 - n) + a.substring(0, 32 - n);
}

export function xor(a, b) {
	let result = [];
	for (let i = 0; i < 32; i++) {
		result += a[i] == b[i] ? "0" : "1";
	}
	return result;
}

export function or(a, b) {
	let result = [];
	for (let i = 0; i < 32; i++) {
		result += a[i] === "1" || b[i] === "1" ? "1" : "0";
	}
	return result;
}

export function and(a, b) {
	let result = [];
	for (let i = 0; i < 32; i++) {
		result += a[i] === "1" && b[i] === "1" ? "1" : "0";
	}
	return result;
}

export function or64(a, b) {
	let result = [];
	for (let i = 0; i < 64; i++) {
		result += a[i] === "1" || b[i] === "1" ? "1" : "0";
	}
	return result;
}

export function and64(a, b) {
	let result = [];
	for (let i = 0; i < 64; i++) {
		result += a[i] === "1" && b[i] === "1" ? "1" : "0";
	}
	return result;
}

export function first_8_words(output) {
	return output.slice(0, 8);
}

//this goes from array of u8 to array of u32
export function words_from_little_endian_bytes(leBytes) {
	const result = [];
	for (let i = 0; i < leBytes.length; i += 4) {
		if (
			typeof leBytes[i] === "undefined" ||
			typeof leBytes[i + 1] === "undefined" ||
			typeof leBytes[i + 2] === "undefined" ||
			typeof leBytes[i + 3] === "undefined"
		) {
			return result;
		}
		result.push(
			leBytes[i + 3].toString(2).padStart(8, "0") +
				leBytes[i + 2].toString(2).padStart(8, "0") +
				leBytes[i + 1].toString(2).padStart(8, "0") +
				leBytes[i].toString(2).padStart(8, "0")
		);
	}
	return result;
}

//this goes from an array of u32 -> array of u8
export function little_endian_bytes_from_words(words) {
	let result = new Uint8Array(words.length * 4);
	for (let i = 0; i < result.length; i += 4) {
		result[i] = parseInt(words[i].substring(24, 32), 2);
		result[i + 1] = parseInt(words[i].substring(16, 24), 2);
		result[i + 2] = parseInt(words[i].substring(8, 16), 2);
		result[i + 3] = parseInt(words[i].substring(0, 8), 2);
	}
	return result;
}

export function chunkArray(input, chunks) {
	let temparray = [];
	for (let i = 0; i < input.length; i += chunk) {
		temparray.push(array.slice(i, i + chunk));
	}
	return temparray;
}
