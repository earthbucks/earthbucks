import { OPCODE_TO_NAME, OP } from "./opcode";
import Script from "./script";
import Tx, { HashCache } from "./tx";
import ScriptNum from "./script-num";
import { blake3Hash, doubleBlake3Hash } from "./blake3";
import TxSignature from "./tx-signature";
import { Buffer } from "buffer";

export default class ScriptInterpreter {
  public script: Script;
  public tx: Tx;
  public nIn: number;
  public stack: Buffer[];
  public altStack: Buffer[];
  public pc: number;
  public nOpCount: number;
  public ifStack: boolean[];
  public returnValue?: Buffer;
  public returnSuccess?: boolean;
  public errStr: string;
  public value: bigint;
  public hashCache: HashCache;

  constructor(
    script: Script,
    tx: Tx,
    nIn: number,
    stack: Buffer[],
    altStack: Buffer[],
    pc: number,
    nOpCount: number,
    ifStack: boolean[],
    returnValue: Buffer | undefined,
    returnSuccess: boolean | undefined,
    errStr: string,
    value: bigint,
    hashCache: HashCache,
  ) {
    this.script = script;
    this.tx = tx;
    this.nIn = nIn;
    this.stack = stack;
    this.altStack = altStack;
    this.pc = pc;
    this.nOpCount = nOpCount;
    this.ifStack = ifStack;
    this.returnValue = returnValue;
    this.returnSuccess = returnSuccess;
    this.errStr = errStr;
    this.value = value;
    this.hashCache = hashCache;
  }

  static fromScriptTx(
    script: Script,
    tx: Tx,
    nIn: number,
    hashCache: HashCache,
  ): ScriptInterpreter {
    return new ScriptInterpreter(
      script,
      tx,
      nIn,
      [],
      [],
      0,
      0,
      [],
      undefined,
      undefined,
      "",
      BigInt(0),
      hashCache,
    );
  }

  static fromOutputScriptTx(
    script: Script,
    tx: Tx,
    nIn: number,
    stack: Buffer[],
    value: bigint,
    hashCache: HashCache,
  ): ScriptInterpreter {
    return new ScriptInterpreter(
      script,
      tx,
      nIn,
      stack,
      [],
      0,
      0,
      [],
      undefined,
      undefined,
      "",
      value,
      hashCache,
    );
  }

  static castToBool(buf: Buffer): boolean {
    return Buffer.compare(buf, Buffer.alloc(buf.length)) !== 0;
  }

  evalScript(): boolean {
    while (this.pc < this.script.chunks.length) {
      const chunk = this.script.chunks[this.pc];
      const opcode = chunk.opcode;
      let ifExec = !this.ifStack.includes(false);

      if (
        ifExec ||
        opcode == OP.IF ||
        opcode == OP.NOTIF ||
        opcode == OP.ELSE ||
        opcode == OP.ENDIF
      ) {
        if (opcode === OP.IF) {
          let ifValue = false;
          if (ifExec) {
            if (this.stack.length < 1) {
              this.errStr = "unbalanced conditional";
              break;
            }
            let buf = this.stack.pop() as Buffer;
            ifValue = ScriptInterpreter.castToBool(buf);
          }
          this.ifStack.push(ifValue);
        } else if (opcode === OP.NOTIF) {
          let ifValue = false;
          if (ifExec) {
            if (this.stack.length < 1) {
              this.errStr = "unbalanced conditional";
              break;
            }
            let buf = this.stack.pop() as Buffer;
            ifValue = ScriptInterpreter.castToBool(buf);
            ifValue = !ifValue;
          }
          this.ifStack.push(ifValue);
        } else if (opcode === OP.ELSE) {
          if (this.ifStack.length === 0) {
            this.errStr = "unbalanced conditional";
            this.returnSuccess = false;
            this.returnValue =
              this.stack[this.stack.length - 1] || Buffer.alloc(0);
            return false;
          }
          this.ifStack[this.ifStack.length - 1] =
            !this.ifStack[this.ifStack.length - 1];
        } else if (opcode === OP.ENDIF) {
          if (this.ifStack.length === 0) {
            this.errStr = "unbalanced conditional";
            break;
          }
          this.ifStack.pop();
        } else if (opcode === OP["0"]) {
          this.stack.push(Buffer.from([0]));
        } else if (
          opcode === OP.PUSHDATA1 ||
          opcode === OP.PUSHDATA2 ||
          opcode === OP.PUSHDATA4
        ) {
          if (chunk.buf) {
            this.stack.push(chunk.buf);
          } else {
            this.errStr = "unbalanced conditional";
            break;
          }
        } else if (opcode === OP["1NEGATE"]) {
          const scriptNum = new ScriptNum(BigInt(-1));
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP["1"]) {
          const scriptNum = new ScriptNum(BigInt(1));
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP["2"]) {
          const scriptNum = new ScriptNum(BigInt(2));
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP["3"]) {
          const scriptNum = new ScriptNum(BigInt(3));
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP["4"]) {
          const scriptNum = new ScriptNum(BigInt(4));
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP["5"]) {
          const scriptNum = new ScriptNum(BigInt(5));
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP["6"]) {
          const scriptNum = new ScriptNum(BigInt(6));
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP["7"]) {
          const scriptNum = new ScriptNum(BigInt(7));
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP["8"]) {
          const scriptNum = new ScriptNum(BigInt(8));
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP["9"]) {
          const scriptNum = new ScriptNum(BigInt(9));
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP["10"]) {
          const scriptNum = new ScriptNum(BigInt(10));
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP["11"]) {
          const scriptNum = new ScriptNum(BigInt(11));
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP["12"]) {
          const scriptNum = new ScriptNum(BigInt(12));
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP["13"]) {
          const scriptNum = new ScriptNum(BigInt(13));
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP["14"]) {
          const scriptNum = new ScriptNum(BigInt(14));
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP["15"]) {
          const scriptNum = new ScriptNum(BigInt(15));
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP["16"]) {
          const scriptNum = new ScriptNum(BigInt(16));
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP.VERIFY) {
          if (this.stack.length < 1) {
            this.errStr = "invalid stack operation";
            break;
          }
          let buf = this.stack.pop();
          if (!ScriptInterpreter.castToBool(buf as Buffer)) {
            this.errStr = "VERIFY failed";
            break;
          }
        } else if (opcode === OP["RETURN"]) {
          break;
        } else if (opcode === OP.TOALTSTACK) {
          if (this.stack.length < 1) {
            this.errStr = "invalid stack operation";
            break;
          }
          this.altStack.push(this.stack.pop() as Buffer);
        } else if (opcode === OP.FROMALTSTACK) {
          if (this.altStack.length < 1) {
            this.errStr = "invalid stack operation";
            break;
          }
          this.stack.push(this.altStack.pop() as Buffer);
        } else if (opcode === OP["2DROP"]) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          this.stack.pop();
          this.stack.pop();
        } else if (opcode === OP["2DUP"]) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          this.stack.push(this.stack[this.stack.length - 2]);
          this.stack.push(this.stack[this.stack.length - 2]);
        } else if (opcode === OP["3DUP"]) {
          if (this.stack.length < 3) {
            this.errStr = "invalid stack operation";
            break;
          }
          this.stack.push(this.stack[this.stack.length - 3]);
          this.stack.push(this.stack[this.stack.length - 3]);
          this.stack.push(this.stack[this.stack.length - 3]);
        } else if (opcode === OP["2OVER"]) {
          if (this.stack.length < 4) {
            this.errStr = "invalid stack operation";
            break;
          }
          this.stack.push(this.stack[this.stack.length - 4]);
          this.stack.push(this.stack[this.stack.length - 4]);
        } else if (opcode === OP["2ROT"]) {
          // (x1 x2 x3 x4 x5 x6 -- x3 x4 x5 x6 x1 x2)
          if (this.stack.length < 6) {
            this.errStr = "invalid stack operation";
            break;
          }
          let spliced = this.stack.splice(this.stack.length - 6, 2);
          this.stack.push(spliced[0]);
          this.stack.push(spliced[1]);
        } else if (opcode === OP["2SWAP"]) {
          // (x1 x2 x3 x4 -- x3 x4 x1 x2)
          if (this.stack.length < 4) {
            this.errStr = "invalid stack operation";
            break;
          }
          let spliced = this.stack.splice(this.stack.length - 4, 2);
          this.stack.push(spliced[0]);
          this.stack.push(spliced[1]);
        } else if (opcode === OP.IFDUP) {
          if (this.stack.length < 1) {
            this.errStr = "invalid stack operation";
            break;
          }
          let buf = this.stack[this.stack.length - 1];
          if (ScriptInterpreter.castToBool(buf)) {
            this.stack.push(buf);
          }
        } else if (opcode === OP.DEPTH) {
          let scriptNum = new ScriptNum(BigInt(this.stack.length));
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP.DROP) {
          if (this.stack.length < 1) {
            this.errStr = "invalid stack operation";
            break;
          }
          this.stack.pop();
        } else if (opcode === OP.DUP) {
          if (this.stack.length < 1) {
            this.errStr = "invalid stack operation";
            break;
          }
          this.stack.push(this.stack[this.stack.length - 1]);
        } else if (opcode === OP.NIP) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let buf = this.stack.pop();
          this.stack.pop();
          this.stack.push(buf as Buffer);
        } else if (opcode === OP.OVER) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          this.stack.push(this.stack[this.stack.length - 2]);
        } else if (opcode === OP.PICK) {
          if (this.stack.length < 1) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer).num;
          if (scriptNum < 0 || scriptNum >= this.stack.length) {
            this.errStr = "invalid stack operation";
            break;
          }
          const num = Number(scriptNum);
          this.stack.push(this.stack[this.stack.length - num - 1]);
        } else if (opcode === OP.ROLL) {
          if (this.stack.length < 1) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer).num;
          if (scriptNum < 0 || scriptNum >= this.stack.length) {
            this.errStr = "invalid stack operation";
            break;
          }
          const num = Number(scriptNum);
          let spliced = this.stack.splice(this.stack.length - num - 1, 1);
          this.stack.push(spliced[0]);
        } else if (opcode === OP.ROT) {
          // (x1 x2 x3 -- x2 x3 x1)
          if (this.stack.length < 3) {
            this.errStr = "invalid stack operation";
            break;
          }
          let spliced = this.stack.splice(this.stack.length - 3, 1);
          this.stack.push(spliced[0]);
        } else if (opcode === OP.SWAP) {
          // (x1 x2 -- x2 x1)
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let spliced = this.stack.splice(this.stack.length - 2, 1);
          this.stack.push(spliced[0]);
        } else if (opcode === OP.TUCK) {
          // (x1 x2 -- x2 x1 x2)
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          this.stack.splice(
            this.stack.length - 2,
            0,
            this.stack[this.stack.length - 1],
          );
        } else if (opcode === OP.CAT) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let buf1 = this.stack.pop() as Buffer;
          let buf2 = this.stack.pop() as Buffer;
          this.stack.push(Buffer.concat([buf2, buf1]));
        } else if (opcode === OP.SUBSTR) {
          if (this.stack.length < 3) {
            this.errStr = "invalid stack operation";
            break;
          }
          let len = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer).num;
          let offset = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer).num;
          let buf = this.stack.pop() as Buffer;
          if (offset < 0 || len < 0 || offset + len > buf.length) {
            this.errStr = "invalid stack operation";
            break;
          }
          this.stack.push(buf.subarray(Number(offset), Number(offset + len)));
        } else if (opcode === OP.LEFT) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let len = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer).num;
          let buf = this.stack.pop() as Buffer;
          if (len < 0 || len > buf.length) {
            this.errStr = "invalid stack operation";
            break;
          }
          this.stack.push(buf.subarray(0, Number(len)));
        } else if (opcode === OP.RIGHT) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let len = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer).num;
          let buf = this.stack.pop() as Buffer;
          if (len < 0 || len > buf.length) {
            this.errStr = "invalid stack operation";
            break;
          }
          this.stack.push(buf.subarray(buf.length - Number(len)));
        } else if (opcode === OP.SIZE) {
          if (this.stack.length < 1) {
            this.errStr = "invalid stack operation";
            break;
          }
          let buf = this.stack[this.stack.length - 1];
          let scriptNum = new ScriptNum(BigInt(buf.length));
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP.INVERT) {
          if (this.stack.length < 1) {
            this.errStr = "invalid stack operation";
            break;
          }
          let buf = this.stack.pop() as Buffer;
          for (let i = 0; i < buf.length; i++) {
            buf[i] = ~buf[i];
          }
          this.stack.push(buf);
        } else if (opcode === OP.AND) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let buf1 = this.stack.pop() as Buffer;
          let buf2 = this.stack.pop() as Buffer;
          if (buf1.length !== buf2.length) {
            this.errStr = "invalid stack operation";
            break;
          }
          let buf = Buffer.alloc(buf1.length);
          for (let i = 0; i < buf.length; i++) {
            buf[i] = buf1[i] & buf2[i];
          }
          this.stack.push(buf);
        } else if (opcode === OP.OR) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let buf1 = this.stack.pop() as Buffer;
          let buf2 = this.stack.pop() as Buffer;
          if (buf1.length !== buf2.length) {
            this.errStr = "invalid stack operation";
            break;
          }
          let buf = Buffer.alloc(buf1.length);
          for (let i = 0; i < buf.length; i++) {
            buf[i] = buf1[i] | buf2[i];
          }
          this.stack.push(buf);
        } else if (opcode === OP.XOR) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let buf1 = this.stack.pop() as Buffer;
          let buf2 = this.stack.pop() as Buffer;
          if (buf1.length !== buf2.length) {
            this.errStr = "invalid stack operation";
            break;
          }
          let buf = Buffer.alloc(buf1.length);
          for (let i = 0; i < buf.length; i++) {
            buf[i] = buf1[i] ^ buf2[i];
          }
          this.stack.push(buf);
        } else if (opcode === OP.EQUAL) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let buf1 = this.stack.pop() as Buffer;
          let buf2 = this.stack.pop() as Buffer;
          let equal = Buffer.compare(buf1, buf2) === 0;
          this.stack.push(Buffer.from([equal ? 1 : 0]));
        } else if (opcode === OP.EQUALVERIFY) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let buf1 = this.stack.pop() as Buffer;
          let buf2 = this.stack.pop() as Buffer;
          if (Buffer.compare(buf1, buf2) !== 0) {
            this.errStr = "EQUALVERIFY failed";
            break;
          }
        } else if (opcode === OP["1ADD"]) {
          if (this.stack.length < 1) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          scriptNum.num++;
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP["1SUB"]) {
          if (this.stack.length < 1) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          scriptNum.num--;
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP["2MUL"]) {
          if (this.stack.length < 1) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          scriptNum.num *= BigInt(2);
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP["2DIV"]) {
          if (this.stack.length < 1) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          scriptNum.num /= BigInt(2);
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP.NEGATE) {
          if (this.stack.length < 1) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          scriptNum.num = -scriptNum.num;
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP.ABS) {
          if (this.stack.length < 1) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          scriptNum.num = scriptNum.num < 0 ? -scriptNum.num : scriptNum.num;
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP.NOT) {
          if (this.stack.length < 1) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          scriptNum.num = scriptNum.num === 0n ? 1n : 0n;
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP["0NOTEQUAL"]) {
          if (this.stack.length < 1) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          scriptNum.num = scriptNum.num === 0n ? 0n : 1n;
          this.stack.push(scriptNum.toIsoBuf());
        } else if (opcode === OP.ADD) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          scriptNum1.num += scriptNum2.num;
          this.stack.push(scriptNum1.toIsoBuf());
        } else if (opcode === OP.SUB) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          scriptNum1.num -= scriptNum2.num;
          this.stack.push(scriptNum1.toIsoBuf());
        } else if (opcode === OP.MUL) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          scriptNum1.num *= scriptNum2.num;
          this.stack.push(scriptNum1.toIsoBuf());
        } else if (opcode === OP.DIV) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          if (scriptNum2.num === 0n) {
            this.errStr = "division by zero";
            break;
          }
          scriptNum1.num /= scriptNum2.num;
          this.stack.push(scriptNum1.toIsoBuf());
        } else if (opcode === OP.MOD) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          if (scriptNum2.num === 0n) {
            this.errStr = "division by zero";
            break;
          }
          scriptNum1.num %= scriptNum2.num;
          this.stack.push(scriptNum1.toIsoBuf());
        } else if (opcode === OP.LSHIFT) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          if (scriptNum2.num < 0n) {
            this.errStr = "invalid shift";
            break;
          }
          scriptNum1.num <<= scriptNum2.num;
          this.stack.push(scriptNum1.toIsoBuf());
        } else if (opcode === OP.RSHIFT) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          if (scriptNum2.num < 0n) {
            this.errStr = "invalid shift";
            break;
          }
          scriptNum1.num >>= scriptNum2.num;
          this.stack.push(scriptNum1.toIsoBuf());
        } else if (opcode === OP.BOOLAND) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          scriptNum1.num =
            scriptNum1.num !== 0n && scriptNum2.num !== 0n ? 1n : 0n;
          this.stack.push(scriptNum1.toIsoBuf());
        } else if (opcode === OP.BOOLOR) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          scriptNum1.num =
            scriptNum1.num !== 0n || scriptNum2.num !== 0n ? 1n : 0n;
          this.stack.push(scriptNum1.toIsoBuf());
        } else if (opcode === OP.NUMEQUAL) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          scriptNum1.num = scriptNum1.num === scriptNum2.num ? 1n : 0n;
          this.stack.push(scriptNum1.toIsoBuf());
        } else if (opcode === OP.NUMEQUALVERIFY) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          if (scriptNum1.num !== scriptNum2.num) {
            this.errStr = "NUMEQUALVERIFY failed";
            break;
          }
        } else if (opcode === OP.NUMNOTEQUAL) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          scriptNum1.num = scriptNum1.num !== scriptNum2.num ? 1n : 0n;
          this.stack.push(scriptNum1.toIsoBuf());
        } else if (opcode === OP.LESSTHAN) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          scriptNum1.num = scriptNum1.num < scriptNum2.num ? 1n : 0n;
          this.stack.push(scriptNum1.toIsoBuf());
        } else if (opcode === OP.GREATERTHAN) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          scriptNum1.num = scriptNum1.num > scriptNum2.num ? 1n : 0n;
          this.stack.push(scriptNum1.toIsoBuf());
        } else if (opcode === OP.LESSTHANOREQUAL) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          scriptNum1.num = scriptNum1.num <= scriptNum2.num ? 1n : 0n;
          this.stack.push(scriptNum1.toIsoBuf());
        } else if (opcode === OP.GREATERTHANOREQUAL) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          scriptNum1.num = scriptNum1.num >= scriptNum2.num ? 1n : 0n;
          this.stack.push(scriptNum1.toIsoBuf());
        } else if (opcode === OP.MIN) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          scriptNum1.num =
            scriptNum1.num < scriptNum2.num ? scriptNum1.num : scriptNum2.num;
          this.stack.push(scriptNum1.toIsoBuf());
        } else if (opcode === OP.MAX) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          scriptNum1.num =
            scriptNum1.num > scriptNum2.num ? scriptNum1.num : scriptNum2.num;
          this.stack.push(scriptNum1.toIsoBuf());
        } else if (opcode === OP.WITHIN) {
          // (x min max -- out)
          if (this.stack.length < 3) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNumMax = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          let scriptNumMin = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          let scriptNumX = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          let within =
            scriptNumX.num >= scriptNumMin.num &&
            scriptNumX.num < scriptNumMax.num;
          this.stack.push(Buffer.from([within ? 1 : 0]));
        } else if (opcode === OP.BLAKE3) {
          if (this.stack.length < 1) {
            this.errStr = "invalid stack operation";
            break;
          }
          let buf = this.stack.pop() as Buffer;
          this.stack.push(blake3Hash(buf));
        } else if (opcode === OP.DOUBLEBLAKE3) {
          if (this.stack.length < 1) {
            this.errStr = "invalid stack operation";
            break;
          }
          let buf = this.stack.pop() as Buffer;
          this.stack.push(doubleBlake3Hash(buf));
        } else if (opcode === OP.CHECKSIG || opcode === OP.CHECKSIGVERIFY) {
          if (this.stack.length < 2) {
            this.errStr = "invalid stack operation";
            break;
          }
          let pubKeyBuf = this.stack.pop() as Buffer;
          if (pubKeyBuf.length !== 33) {
            this.errStr = "invalid public key length";
            break;
          }
          let sigBuf = this.stack.pop() as Buffer;
          if (sigBuf.length !== 65) {
            this.errStr = "invalid signature length";
            break;
          }
          const signature = TxSignature.fromIsoBuf(sigBuf);

          let execScriptBuf = this.script.toIsoBuf();

          const success = this.tx.verifyWithCache(
            this.nIn,
            pubKeyBuf,
            signature,
            execScriptBuf,
            this.value,
            this.hashCache,
          );

          this.stack.push(Buffer.from([success ? 1 : 0]));
          if (opcode === OP.CHECKSIGVERIFY && !success) {
            this.errStr = "CHECKSIGVERIFY failed";
            break;
          }
        } else if (
          opcode === OP.CHECKMULTISIG ||
          opcode === OP.CHECKMULTISIGVERIFY
        ) {
          if (this.stack.length < 1) {
            this.errStr = "invalid stack operation";
            break;
          }
          let nKeys = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer).num;
          if (nKeys < 0 || nKeys > 16) {
            this.errStr = "invalid number of keys";
            break;
          }
          if (this.stack.length < nKeys + 1n) {
            this.errStr = "invalid stack operation";
            break;
          }
          let pubKeys: Buffer[] = [];
          for (let i = 0; i < nKeys; i++) {
            let pubKeyBuf = this.stack.pop() as Buffer;
            if (pubKeyBuf.length !== 33) {
              this.errStr = "invalid public key length";
              break;
            }
            pubKeys.push(pubKeyBuf);
          }
          let nSigs = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer).num;
          if (nSigs < 0 || nSigs > nKeys) {
            this.errStr = "invalid number of signatures";
            break;
          }
          if (this.stack.length < nSigs) {
            this.errStr = "invalid stack operation";
            break;
          }
          let sigs: Buffer[] = [];
          for (let i = 0; i < nSigs; i++) {
            let sigBuf = this.stack.pop() as Buffer;
            if (sigBuf.length !== 65) {
              this.errStr = "invalid signature length";
              break;
            }
            sigs.push(sigBuf);
          }
          let execScriptBuf = this.script.toIsoBuf();

          let matchedSigs = 0n;
          for (let i = 0; i < nSigs; i++) {
            for (let j = 0; j < pubKeys.length; j++) {
              const success = this.tx.verifyWithCache(
                this.nIn,
                pubKeys[j],
                TxSignature.fromIsoBuf(sigs[i]),
                execScriptBuf,
                this.value,
                this.hashCache,
              );
              if (success) {
                matchedSigs += 1n;
                pubKeys.splice(j, 1); // Remove the matched public key
                break;
              }
            }
          }
          const success = matchedSigs === nSigs;

          this.stack.push(Buffer.from([success ? 1 : 0]));
          if (opcode === OP.CHECKMULTISIGVERIFY && !success) {
            this.errStr = "CHECKMULTISIGVERIFY failed";
            break;
          }
        } else if (opcode === OP.CHECKLOCKABSVERIFY) {
          if (this.stack.length < 1) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          if (scriptNum.num < 0n) {
            this.errStr = "negative lockabs";
            break;
          }
          if (this.tx.lockAbs < scriptNum.num) {
            this.errStr = "lockabs requirement not met";
            break;
          }
        } else if (opcode === OP.CHECKLOCKRELVERIFY) {
          if (this.stack.length < 1) {
            this.errStr = "invalid stack operation";
            break;
          }
          let scriptNum = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
          if (scriptNum.num < 0n) {
            this.errStr = "negative lockrel";
            break;
          }
          const txInput = this.tx.inputs[this.nIn];
          if (txInput.lockRel < scriptNum.num) {
            this.errStr = "lockrel requirement not met";
            break;
          }
        } else {
          this.errStr = "invalid opcode";
          break;
        }
      }

      this.pc++;
    }
    if (this.errStr) {
      this.returnValue = this.stack[this.stack.length - 1] || Buffer.alloc(0);
      this.returnSuccess = false;
      return this.returnSuccess;
    }
    this.returnValue = this.stack[this.stack.length - 1] || Buffer.alloc(0);
    this.returnSuccess = ScriptInterpreter.castToBool(this.returnValue);
    return this.returnSuccess;
  }
}
