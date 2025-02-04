import { WebBuf } from "@webbuf/webbuf";

export type OpcodeName =
  | "0"
  | "PUSHDATA1"
  | "PUSHDATA2"
  | "PUSHDATA4"
  | "1NEGATE"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16"
  | "IF"
  | "NOTIF"
  | "ELSE"
  | "ENDIF"
  | "VERIFY"
  | "RETURN"
  | "TOALTSTACK"
  | "FROMALTSTACK"
  | "2DROP"
  | "2DUP"
  | "3DUP"
  | "2OVER"
  | "2ROT"
  | "2SWAP"
  | "IFDUP"
  | "DEPTH"
  | "DROP"
  | "DUP"
  | "NIP"
  | "OVER"
  | "PICK"
  | "ROLL"
  | "ROT"
  | "SWAP"
  | "TUCK"
  | "CAT"
  | "SUBSTR"
  | "LEFT"
  | "RIGHT"
  | "SIZE"
  | "INVERT"
  | "AND"
  | "OR"
  | "XOR"
  | "EQUAL"
  | "EQUALVERIFY"
  | "1ADD"
  | "1SUB"
  | "2MUL"
  | "2DIV"
  | "NEGATE"
  | "ABS"
  | "NOT"
  | "0NOTEQUAL"
  | "ADD"
  | "SUB"
  | "MUL"
  | "DIV"
  | "MOD"
  | "LSHIFT"
  | "RSHIFT"
  | "BOOLAND"
  | "BOOLOR"
  | "NUMEQUAL"
  | "NUMEQUALVERIFY"
  | "NUMNOTEQUAL"
  | "LESSTHAN"
  | "GREATERTHAN"
  | "LESSTHANOREQUAL"
  | "GREATERTHANOREQUAL"
  | "MIN"
  | "MAX"
  | "WITHIN"
  | "BLAKE3"
  | "DOUBLEBLAKE3"
  | "CHECKSIG"
  | "CHECKSIGVERIFY"
  | "CHECKMULTISIG"
  | "CHECKMULTISIGVERIFY"
  | "CHECKLOCKABSVERIFY"
  | "CHECKLOCKRELVERIFY";

export const OP: { [key in OpcodeName]: number } = {
  "0": 0x00,
  PUSHDATA1: 0x4c,
  PUSHDATA2: 0x4d,
  PUSHDATA4: 0x4e,
  "1NEGATE": 0x4f,
  "1": 0x51,
  "2": 0x52,
  "3": 0x53,
  "4": 0x54,
  "5": 0x55,
  "6": 0x56,
  "7": 0x57,
  "8": 0x58,
  "9": 0x59,
  "10": 0x5a,
  "11": 0x5b,
  "12": 0x5c,
  "13": 0x5d,
  "14": 0x5e,
  "15": 0x5f,
  "16": 0x60,
  IF: 0x63,
  NOTIF: 0x64,
  ELSE: 0x67,
  ENDIF: 0x68,
  VERIFY: 0x69,
  RETURN: 0x6a,
  TOALTSTACK: 0x6b,
  FROMALTSTACK: 0x6c,
  "2DROP": 0x6d,
  "2DUP": 0x6e,
  "3DUP": 0x6f,
  "2OVER": 0x70,
  "2ROT": 0x71,
  "2SWAP": 0x72,
  IFDUP: 0x73,
  DEPTH: 0x74,
  DROP: 0x75,
  DUP: 0x76,
  NIP: 0x77,
  OVER: 0x78,
  PICK: 0x79,
  ROLL: 0x7a,
  ROT: 0x7b,
  SWAP: 0x7c,
  TUCK: 0x7d,
  CAT: 0x7e,
  SUBSTR: 0x7f,
  LEFT: 0x80,
  RIGHT: 0x81,
  SIZE: 0x82,
  INVERT: 0x83,
  AND: 0x84,
  OR: 0x85,
  XOR: 0x86,
  EQUAL: 0x87,
  EQUALVERIFY: 0x88,
  "1ADD": 0x8b,
  "1SUB": 0x8c,
  "2MUL": 0x8d,
  "2DIV": 0x8e,
  NEGATE: 0x8f,
  ABS: 0x90,
  NOT: 0x91,
  "0NOTEQUAL": 0x92,
  ADD: 0x93,
  SUB: 0x94,
  MUL: 0x95,
  DIV: 0x96,
  MOD: 0x97,
  LSHIFT: 0x98,
  RSHIFT: 0x99,
  BOOLAND: 0x9a,
  BOOLOR: 0x9b,
  NUMEQUAL: 0x9c,
  NUMEQUALVERIFY: 0x9d,
  NUMNOTEQUAL: 0x9e,
  LESSTHAN: 0x9f,
  GREATERTHAN: 0xa0,
  LESSTHANOREQUAL: 0xa1,
  GREATERTHANOREQUAL: 0xa2,
  MIN: 0xa3,
  MAX: 0xa4,
  WITHIN: 0xa5,
  BLAKE3: 0xa6,
  DOUBLEBLAKE3: 0xa7,
  CHECKSIG: 0xac,
  CHECKSIGVERIFY: 0xad,
  CHECKMULTISIG: 0xae,
  CHECKMULTISIGVERIFY: 0xaf,
  CHECKLOCKABSVERIFY: 0xb1,
  CHECKLOCKRELVERIFY: 0xb2,
};

export type OP_CodeName =
  | "OP_0"
  | "OP_PUSHDATA1"
  | "OP_PUSHDATA2"
  | "OP_PUSHDATA4"
  | "OP_1NEGATE"
  | "OP_1"
  | "OP_2"
  | "OP_3"
  | "OP_4"
  | "OP_5"
  | "OP_6"
  | "OP_7"
  | "OP_8"
  | "OP_9"
  | "OP_10"
  | "OP_11"
  | "OP_12"
  | "OP_13"
  | "OP_14"
  | "OP_15"
  | "OP_16"
  | "OP_IF"
  | "OP_NOTIF"
  | "OP_ELSE"
  | "OP_ENDIF"
  | "OP_VERIFY"
  | "OP_RETURN"
  | "OP_TOALTSTACK"
  | "OP_FROMALTSTACK"
  | "OP_2DROP"
  | "OP_2DUP"
  | "OP_3DUP"
  | "OP_2OVER"
  | "OP_2ROT"
  | "OP_2SWAP"
  | "OP_IFDUP"
  | "OP_DEPTH"
  | "OP_DROP"
  | "OP_DUP"
  | "OP_NIP"
  | "OP_OVER"
  | "OP_PICK"
  | "OP_ROLL"
  | "OP_ROT"
  | "OP_SWAP"
  | "OP_TUCK"
  | "OP_CAT"
  | "OP_SUBSTR"
  | "OP_LEFT"
  | "OP_RIGHT"
  | "OP_SIZE"
  | "OP_INVERT"
  | "OP_AND"
  | "OP_OR"
  | "OP_XOR"
  | "OP_EQUAL"
  | "OP_EQUALVERIFY"
  | "OP_1ADD"
  | "OP_1SUB"
  | "OP_2MUL"
  | "OP_2DIV"
  | "OP_NEGATE"
  | "OP_ABS"
  | "OP_NOT"
  | "OP_0NOTEQUAL"
  | "OP_ADD"
  | "OP_SUB"
  | "OP_MUL"
  | "OP_DIV"
  | "OP_MOD"
  | "OP_LSHIFT"
  | "OP_RSHIFT"
  | "OP_BOOLAND"
  | "OP_BOOLOR"
  | "OP_NUMEQUAL"
  | "OP_NUMEQUALVERIFY"
  | "OP_NUMNOTEQUAL"
  | "OP_LESSTHAN"
  | "OP_GREATERTHAN"
  | "OP_LESSTHANOREQUAL"
  | "OP_GREATERTHANOREQUAL"
  | "OP_MIN"
  | "OP_MAX"
  | "OP_WITHIN"
  | "OP_BLAKE3"
  | "OP_DOUBLEBLAKE3"
  | "OP_CHECKSIG"
  | "OP_CHECKSIGVERIFY"
  | "OP_CHECKMULTISIG"
  | "OP_CHECKMULTISIGVERIFY"
  | "OP_CHECKLOCKABSVERIFY"
  | "OP_CHECKLOCKRELVERIFY";

export const Opcode: { [key in OP_CodeName]: number } = {
  OP_0: 0x00,
  OP_PUSHDATA1: 0x4c,
  OP_PUSHDATA2: 0x4d,
  OP_PUSHDATA4: 0x4e,
  OP_1NEGATE: 0x4f,
  OP_1: 0x51,
  OP_2: 0x52,
  OP_3: 0x53,
  OP_4: 0x54,
  OP_5: 0x55,
  OP_6: 0x56,
  OP_7: 0x57,
  OP_8: 0x58,
  OP_9: 0x59,
  OP_10: 0x5a,
  OP_11: 0x5b,
  OP_12: 0x5c,
  OP_13: 0x5d,
  OP_14: 0x5e,
  OP_15: 0x5f,
  OP_16: 0x60,
  OP_IF: 0x63,
  OP_NOTIF: 0x64,
  OP_ELSE: 0x67,
  OP_ENDIF: 0x68,
  OP_VERIFY: 0x69,
  OP_RETURN: 0x6a,
  OP_TOALTSTACK: 0x6b,
  OP_FROMALTSTACK: 0x6c,
  OP_2DROP: 0x6d,
  OP_2DUP: 0x6e,
  OP_3DUP: 0x6f,
  OP_2OVER: 0x70,
  OP_2ROT: 0x71,
  OP_2SWAP: 0x72,
  OP_IFDUP: 0x73,
  OP_DEPTH: 0x74,
  OP_DROP: 0x75,
  OP_DUP: 0x76,
  OP_NIP: 0x77,
  OP_OVER: 0x78,
  OP_PICK: 0x79,
  OP_ROLL: 0x7a,
  OP_ROT: 0x7b,
  OP_SWAP: 0x7c,
  OP_TUCK: 0x7d,
  OP_CAT: 0x7e,
  OP_SUBSTR: 0x7f,
  OP_LEFT: 0x80,
  OP_RIGHT: 0x81,
  OP_SIZE: 0x82,
  OP_INVERT: 0x83,
  OP_AND: 0x84,
  OP_OR: 0x85,
  OP_XOR: 0x86,
  OP_EQUAL: 0x87,
  OP_EQUALVERIFY: 0x88,
  OP_1ADD: 0x8b,
  OP_1SUB: 0x8c,
  OP_2MUL: 0x8d,
  OP_2DIV: 0x8e,
  OP_NEGATE: 0x8f,
  OP_ABS: 0x90,
  OP_NOT: 0x91,
  OP_0NOTEQUAL: 0x92,
  OP_ADD: 0x93,
  OP_SUB: 0x94,
  OP_MUL: 0x95,
  OP_DIV: 0x96,
  OP_MOD: 0x97,
  OP_LSHIFT: 0x98,
  OP_RSHIFT: 0x99,
  OP_BOOLAND: 0x9a,
  OP_BOOLOR: 0x9b,
  OP_NUMEQUAL: 0x9c,
  OP_NUMEQUALVERIFY: 0x9d,
  OP_NUMNOTEQUAL: 0x9e,
  OP_LESSTHAN: 0x9f,
  OP_GREATERTHAN: 0xa0,
  OP_LESSTHANOREQUAL: 0xa1,
  OP_GREATERTHANOREQUAL: 0xa2,
  OP_MIN: 0xa3,
  OP_MAX: 0xa4,
  OP_WITHIN: 0xa5,
  OP_BLAKE3: 0xa6,
  OP_DOUBLEBLAKE3: 0xa7,
  OP_CHECKSIG: 0xac,
  OP_CHECKSIGVERIFY: 0xad,
  OP_CHECKMULTISIG: 0xae,
  OP_CHECKMULTISIGVERIFY: 0xaf,
  OP_CHECKLOCKABSVERIFY: 0xb1,
  OP_CHECKLOCKRELVERIFY: 0xb2,
};

export const OPCODE_TO_NAME: { [key: number]: OpcodeName } = {
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x00: "0",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x4c: "PUSHDATA1",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x4d: "PUSHDATA2",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x4e: "PUSHDATA4",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x4f: "1NEGATE",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x51: "1",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x52: "2",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x53: "3",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x54: "4",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x55: "5",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x56: "6",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x57: "7",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x58: "8",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x59: "9",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x5a: "10",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x5b: "11",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x5c: "12",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x5d: "13",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x5e: "14",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x5f: "15",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x60: "16",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x63: "IF",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x64: "NOTIF",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x67: "ELSE",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x68: "ENDIF",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x69: "VERIFY",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x6a: "RETURN",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x6b: "TOALTSTACK",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x6c: "FROMALTSTACK",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x6d: "2DROP",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x6e: "2DUP",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x6f: "3DUP",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x70: "2OVER",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x71: "2ROT",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x72: "2SWAP",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x73: "IFDUP",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x74: "DEPTH",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x75: "DROP",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x76: "DUP",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x77: "NIP",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x78: "OVER",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x79: "PICK",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x7a: "ROLL",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x7b: "ROT",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x7c: "SWAP",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x7d: "TUCK",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x7e: "CAT",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x7f: "SUBSTR",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x80: "LEFT",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x81: "RIGHT",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x82: "SIZE",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x83: "INVERT",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x84: "AND",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x85: "OR",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x86: "XOR",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x87: "EQUAL",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x88: "EQUALVERIFY",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x8b: "1ADD",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x8c: "1SUB",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x8d: "2MUL",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x8e: "2DIV",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x8f: "NEGATE",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x90: "ABS",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x91: "NOT",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x92: "0NOTEQUAL",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x93: "ADD",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x94: "SUB",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x95: "MUL",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x96: "DIV",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x97: "MOD",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x98: "LSHIFT",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x99: "RSHIFT",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x9a: "BOOLAND",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x9b: "BOOLOR",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x9c: "NUMEQUAL",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x9d: "NUMEQUALVERIFY",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x9e: "NUMNOTEQUAL",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0x9f: "LESSTHAN",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0xa0: "GREATERTHAN",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0xa1: "LESSTHANOREQUAL",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0xa2: "GREATERTHANOREQUAL",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0xa3: "MIN",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0xa4: "MAX",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0xa5: "WITHIN",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0xa6: "BLAKE3",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0xa7: "DOUBLEBLAKE3",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0xac: "CHECKSIG",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0xad: "CHECKSIGVERIFY",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0xae: "CHECKMULTISIG",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0xaf: "CHECKMULTISIGVERIFY",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0xb1: "CHECKLOCKABSVERIFY",
  // biome-ignore lint/complexity/useSimpleNumberKeys:
  0xb2: "CHECKLOCKRELVERIFY",
};
