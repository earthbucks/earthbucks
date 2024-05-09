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
    loop: while (this.pc < this.script.chunks.length) {
      const chunk = this.script.chunks[this.pc];
      const opcode = chunk.opcode;
      let ifExec = !this.ifStack.includes(false);

      if (
        !(
          ifExec ||
          opcode == OP.IF ||
          opcode == OP.NOTIF ||
          opcode == OP.ELSE ||
          opcode == OP.ENDIF
        )
      ) {
        this.pc++;
        continue;
      }

      switch (opcode) {
        case OP.IF:
          {
            let ifValue = false;
            if (ifExec) {
              if (this.stack.length < 1) {
                this.errStr = "unbalanced conditional";
                break loop;
              }
              let buf = this.stack.pop() as Buffer;
              ifValue = ScriptInterpreter.castToBool(buf);
            }
            this.ifStack.push(ifValue);
          }
          break;
        case OP.NOTIF:
          {
            let ifValue = false;
            if (ifExec) {
              if (this.stack.length < 1) {
                this.errStr = "unbalanced conditional";
                break loop;
              }
              let buf = this.stack.pop() as Buffer;
              ifValue = ScriptInterpreter.castToBool(buf);
              ifValue = !ifValue;
            }
            this.ifStack.push(ifValue);
          }
          break;
        case OP.ELSE:
          {
            if (this.ifStack.length === 0) {
              this.errStr = "unbalanced conditional";
              break loop;
            }
            this.ifStack[this.ifStack.length - 1] =
              !this.ifStack[this.ifStack.length - 1];
          }
          break;
        case OP.ENDIF:
          {
            if (this.ifStack.length === 0) {
              this.errStr = "unbalanced conditional";
              break loop;
            }
            this.ifStack.pop();
          }
          break;
        case OP["0"]:
          {
            this.stack.push(Buffer.from([0]));
          }
          break;
        case OP.PUSHDATA1:
        case OP.PUSHDATA2:
        case OP.PUSHDATA4:
          {
            if (chunk.buf) {
              this.stack.push(chunk.buf);
            } else {
              this.errStr = "unbalanced conditional";
              break loop;
            }
          }
          break;
        case OP["1NEGATE"]:
          {
            const scriptNum = new ScriptNum(BigInt(-1));
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP["1"]:
          {
            const scriptNum = new ScriptNum(BigInt(1));
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP["2"]:
          {
            const scriptNum = new ScriptNum(BigInt(2));
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP["3"]:
          {
            const scriptNum = new ScriptNum(BigInt(3));
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP["4"]:
          {
            const scriptNum = new ScriptNum(BigInt(4));
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP["5"]:
          {
            const scriptNum = new ScriptNum(BigInt(5));
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP["6"]:
          {
            const scriptNum = new ScriptNum(BigInt(6));
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP["7"]:
          {
            const scriptNum = new ScriptNum(BigInt(7));
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP["8"]:
          {
            const scriptNum = new ScriptNum(BigInt(8));
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP["9"]:
          {
            const scriptNum = new ScriptNum(BigInt(9));
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP["10"]:
          {
            const scriptNum = new ScriptNum(BigInt(10));
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP["11"]:
          {
            const scriptNum = new ScriptNum(BigInt(11));
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP["12"]:
          {
            const scriptNum = new ScriptNum(BigInt(12));
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP["13"]:
          {
            const scriptNum = new ScriptNum(BigInt(13));
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP["14"]:
          {
            const scriptNum = new ScriptNum(BigInt(14));
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP["15"]:
          {
            const scriptNum = new ScriptNum(BigInt(15));
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP["16"]:
          {
            const scriptNum = new ScriptNum(BigInt(16));
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP.VERIFY:
          {
            if (this.stack.length < 1) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let buf = this.stack.pop();
            if (!ScriptInterpreter.castToBool(buf as Buffer)) {
              this.errStr = "VERIFY failed";
              break loop;
            }
          }
          break;
        case OP["RETURN"]:
          {
            break loop;
          }
          break;
        case OP.TOALTSTACK:
          {
            if (this.stack.length < 1) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            this.altStack.push(this.stack.pop() as Buffer);
          }
          break;
        case OP.FROMALTSTACK:
          {
            if (this.altStack.length < 1) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            this.stack.push(this.altStack.pop() as Buffer);
          }
          break;
        case OP["2DROP"]:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            this.stack.pop();
            this.stack.pop();
          }
          break;
        case OP["2DUP"]:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            this.stack.push(this.stack[this.stack.length - 2]);
            this.stack.push(this.stack[this.stack.length - 2]);
          }
          break;
        case OP["3DUP"]:
          {
            if (this.stack.length < 3) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            this.stack.push(this.stack[this.stack.length - 3]);
            this.stack.push(this.stack[this.stack.length - 3]);
            this.stack.push(this.stack[this.stack.length - 3]);
          }
          break;
        case OP["2OVER"]:
          {
            if (this.stack.length < 4) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            this.stack.push(this.stack[this.stack.length - 4]);
            this.stack.push(this.stack[this.stack.length - 4]);
          }
          break;
        case OP["2ROT"]:
          {
            // (x1 x2 x3 x4 x5 x6 -- x3 x4 x5 x6 x1 x2)
            if (this.stack.length < 6) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let spliced = this.stack.splice(this.stack.length - 6, 2);
            this.stack.push(spliced[0]);
            this.stack.push(spliced[1]);
          }
          break;
        case OP["2SWAP"]:
          {
            // (x1 x2 x3 x4 -- x3 x4 x1 x2)
            if (this.stack.length < 4) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let spliced = this.stack.splice(this.stack.length - 4, 2);
            this.stack.push(spliced[0]);
            this.stack.push(spliced[1]);
          }
          break;
        case OP.IFDUP:
          {
            if (this.stack.length < 1) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let buf = this.stack[this.stack.length - 1];
            if (ScriptInterpreter.castToBool(buf)) {
              this.stack.push(buf);
            }
          }
          break;
        case OP.DEPTH:
          {
            let scriptNum = new ScriptNum(BigInt(this.stack.length));
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP.DROP:
          {
            if (this.stack.length < 1) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            this.stack.pop();
          }
          break;
        case OP.DUP:
          {
            if (this.stack.length < 1) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            this.stack.push(this.stack[this.stack.length - 1]);
          }
          break;
        case OP.NIP:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let buf = this.stack.pop();
            this.stack.pop();
            this.stack.push(buf as Buffer);
          }
          break;
        case OP.OVER:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            this.stack.push(this.stack[this.stack.length - 2]);
          }
          break;
        case OP.PICK:
          {
            if (this.stack.length < 1) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum = ScriptNum.fromIsoBuf(
              this.stack.pop() as Buffer,
            ).num;
            if (scriptNum < 0 || scriptNum >= this.stack.length) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            const num = Number(scriptNum);
            this.stack.push(this.stack[this.stack.length - num - 1]);
          }
          break;
        case OP.ROLL:
          {
            if (this.stack.length < 1) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum = ScriptNum.fromIsoBuf(
              this.stack.pop() as Buffer,
            ).num;
            if (scriptNum < 0 || scriptNum >= this.stack.length) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            const num = Number(scriptNum);
            let spliced = this.stack.splice(this.stack.length - num - 1, 1);
            this.stack.push(spliced[0]);
          }
          break;
        case OP.ROT:
          {
            // (x1 x2 x3 -- x2 x3 x1)
            if (this.stack.length < 3) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let spliced = this.stack.splice(this.stack.length - 3, 1);
            this.stack.push(spliced[0]);
          }
          break;
        case OP.SWAP:
          {
            // (x1 x2 -- x2 x1)
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let spliced = this.stack.splice(this.stack.length - 2, 1);
            this.stack.push(spliced[0]);
          }
          break;
        case OP.TUCK:
          {
            // (x1 x2 -- x2 x1 x2)
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            this.stack.splice(
              this.stack.length - 2,
              0,
              this.stack[this.stack.length - 1],
            );
          }
          break;
        case OP.CAT:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let buf1 = this.stack.pop() as Buffer;
            let buf2 = this.stack.pop() as Buffer;
            this.stack.push(Buffer.concat([buf2, buf1]));
          }
          break;
        case OP.SUBSTR:
          {
            if (this.stack.length < 3) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let len = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer).num;
            let offset = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer).num;
            let buf = this.stack.pop() as Buffer;
            if (offset < 0 || len < 0 || offset + len > buf.length) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            this.stack.push(buf.subarray(Number(offset), Number(offset + len)));
          }
          break;
        case OP.LEFT:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let len = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer).num;
            let buf = this.stack.pop() as Buffer;
            if (len < 0 || len > buf.length) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            this.stack.push(buf.subarray(0, Number(len)));
          }
          break;
        case OP.RIGHT:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let len = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer).num;
            let buf = this.stack.pop() as Buffer;
            if (len < 0 || len > buf.length) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            this.stack.push(buf.subarray(buf.length - Number(len)));
          }
          break;
        case OP.SIZE:
          {
            if (this.stack.length < 1) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let buf = this.stack[this.stack.length - 1];
            let scriptNum = new ScriptNum(BigInt(buf.length));
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP.INVERT:
          {
            if (this.stack.length < 1) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let buf = this.stack.pop() as Buffer;
            for (let i = 0; i < buf.length; i++) {
              buf[i] = ~buf[i];
            }
            this.stack.push(buf);
          }
          break;
        case OP.AND:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let buf1 = this.stack.pop() as Buffer;
            let buf2 = this.stack.pop() as Buffer;
            if (buf1.length !== buf2.length) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let buf = Buffer.alloc(buf1.length);
            for (let i = 0; i < buf.length; i++) {
              buf[i] = buf1[i] & buf2[i];
            }
            this.stack.push(buf);
          }
          break;
        case OP.OR:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let buf1 = this.stack.pop() as Buffer;
            let buf2 = this.stack.pop() as Buffer;
            if (buf1.length !== buf2.length) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let buf = Buffer.alloc(buf1.length);
            for (let i = 0; i < buf.length; i++) {
              buf[i] = buf1[i] | buf2[i];
            }
            this.stack.push(buf);
          }
          break;
        case OP.XOR:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let buf1 = this.stack.pop() as Buffer;
            let buf2 = this.stack.pop() as Buffer;
            if (buf1.length !== buf2.length) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let buf = Buffer.alloc(buf1.length);
            for (let i = 0; i < buf.length; i++) {
              buf[i] = buf1[i] ^ buf2[i];
            }
            this.stack.push(buf);
          }
          break;
        case OP.EQUAL:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let buf1 = this.stack.pop() as Buffer;
            let buf2 = this.stack.pop() as Buffer;
            let equal = Buffer.compare(buf1, buf2) === 0;
            this.stack.push(Buffer.from([equal ? 1 : 0]));
          }
          break;
        case OP.EQUALVERIFY:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let buf1 = this.stack.pop() as Buffer;
            let buf2 = this.stack.pop() as Buffer;
            if (Buffer.compare(buf1, buf2) !== 0) {
              this.errStr = "EQUALVERIFY failed";
              break loop;
            }
          }
          break;
        case OP["1ADD"]:
          {
            if (this.stack.length < 1) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            scriptNum.num++;
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP["1SUB"]:
          {
            if (this.stack.length < 1) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            scriptNum.num--;
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP["2MUL"]:
          {
            if (this.stack.length < 1) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            scriptNum.num *= BigInt(2);
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP["2DIV"]:
          {
            if (this.stack.length < 1) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            scriptNum.num /= BigInt(2);
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP.NEGATE:
          {
            if (this.stack.length < 1) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            scriptNum.num = -scriptNum.num;
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP.ABS:
          {
            if (this.stack.length < 1) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            scriptNum.num = scriptNum.num < 0 ? -scriptNum.num : scriptNum.num;
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP.NOT:
          {
            if (this.stack.length < 1) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            scriptNum.num = scriptNum.num === 0n ? 1n : 0n;
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP["0NOTEQUAL"]:
          {
            if (this.stack.length < 1) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            scriptNum.num = scriptNum.num === 0n ? 0n : 1n;
            this.stack.push(scriptNum.toIsoBuf());
          }
          break;
        case OP.ADD:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            scriptNum1.num += scriptNum2.num;
            this.stack.push(scriptNum1.toIsoBuf());
          }
          break;
        case OP.SUB:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            scriptNum1.num -= scriptNum2.num;
            this.stack.push(scriptNum1.toIsoBuf());
          }
          break;
        case OP.MUL:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            scriptNum1.num *= scriptNum2.num;
            this.stack.push(scriptNum1.toIsoBuf());
          }
          break;
        case OP.DIV:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            if (scriptNum2.num === 0n) {
              this.errStr = "division by zero";
              break loop;
            }
            scriptNum1.num /= scriptNum2.num;
            this.stack.push(scriptNum1.toIsoBuf());
          }
          break;
        case OP.MOD:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            if (scriptNum2.num === 0n) {
              this.errStr = "division by zero";
              break loop;
            }
            scriptNum1.num %= scriptNum2.num;
            this.stack.push(scriptNum1.toIsoBuf());
          }
          break;
        case OP.LSHIFT:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            if (scriptNum2.num < 0n) {
              this.errStr = "invalid shift";
              break loop;
            }
            scriptNum1.num <<= scriptNum2.num;
            this.stack.push(scriptNum1.toIsoBuf());
          }
          break;
        case OP.RSHIFT:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            if (scriptNum2.num < 0n) {
              this.errStr = "invalid shift";
              break loop;
            }
            scriptNum1.num >>= scriptNum2.num;
            this.stack.push(scriptNum1.toIsoBuf());
          }
          break;
        case OP.BOOLAND:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            scriptNum1.num =
              scriptNum1.num !== 0n && scriptNum2.num !== 0n ? 1n : 0n;
            this.stack.push(scriptNum1.toIsoBuf());
          }
          break;
        case OP.BOOLOR:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            scriptNum1.num =
              scriptNum1.num !== 0n || scriptNum2.num !== 0n ? 1n : 0n;
            this.stack.push(scriptNum1.toIsoBuf());
          }
          break;
        case OP.NUMEQUAL:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            scriptNum1.num = scriptNum1.num === scriptNum2.num ? 1n : 0n;
            this.stack.push(scriptNum1.toIsoBuf());
          }
          break;
        case OP.NUMEQUALVERIFY:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            if (scriptNum1.num !== scriptNum2.num) {
              this.errStr = "NUMEQUALVERIFY failed";
              break loop;
            }
          }
          break;
        case OP.NUMNOTEQUAL:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            scriptNum1.num = scriptNum1.num !== scriptNum2.num ? 1n : 0n;
            this.stack.push(scriptNum1.toIsoBuf());
          }
          break;
        case OP.LESSTHAN:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            scriptNum1.num = scriptNum1.num < scriptNum2.num ? 1n : 0n;
            this.stack.push(scriptNum1.toIsoBuf());
          }
          break;
        case OP.GREATERTHAN:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            scriptNum1.num = scriptNum1.num > scriptNum2.num ? 1n : 0n;
            this.stack.push(scriptNum1.toIsoBuf());
          }
          break;
        case OP.LESSTHANOREQUAL:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            scriptNum1.num = scriptNum1.num <= scriptNum2.num ? 1n : 0n;
            this.stack.push(scriptNum1.toIsoBuf());
          }
          break;
        case OP.GREATERTHANOREQUAL:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            scriptNum1.num = scriptNum1.num >= scriptNum2.num ? 1n : 0n;
            this.stack.push(scriptNum1.toIsoBuf());
          }
          break;
        case OP.MIN:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            scriptNum1.num =
              scriptNum1.num < scriptNum2.num ? scriptNum1.num : scriptNum2.num;
            this.stack.push(scriptNum1.toIsoBuf());
          }
          break;
        case OP.MAX:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum2 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            let scriptNum1 = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            scriptNum1.num =
              scriptNum1.num > scriptNum2.num ? scriptNum1.num : scriptNum2.num;
            this.stack.push(scriptNum1.toIsoBuf());
          }
          break;
        case OP.WITHIN:
          {
            // (x min max -- out)
            if (this.stack.length < 3) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNumMax = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            let scriptNumMin = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            let scriptNumX = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            let within =
              scriptNumX.num >= scriptNumMin.num &&
              scriptNumX.num < scriptNumMax.num;
            this.stack.push(Buffer.from([within ? 1 : 0]));
          }
          break;
        case OP.BLAKE3:
          {
            if (this.stack.length < 1) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let buf = this.stack.pop() as Buffer;
            this.stack.push(blake3Hash(buf));
          }
          break;
        case OP.DOUBLEBLAKE3:
          {
            if (this.stack.length < 1) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let buf = this.stack.pop() as Buffer;
            this.stack.push(doubleBlake3Hash(buf));
          }
          break;
        case OP.CHECKSIG:
        case OP.CHECKSIGVERIFY:
          {
            if (this.stack.length < 2) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let pubKeyBuf = this.stack.pop() as Buffer;
            if (pubKeyBuf.length !== 33) {
              this.errStr = "invalid public key length";
              break loop;
            }
            let sigBuf = this.stack.pop() as Buffer;
            if (sigBuf.length !== 65) {
              this.errStr = "invalid signature length";
              break loop;
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
              break loop;
            }
          }
          break;
        case OP.CHECKMULTISIG:
        case OP.CHECKMULTISIGVERIFY:
          {
            if (this.stack.length < 1) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let nKeys = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer).num;
            if (nKeys < 0 || nKeys > 16) {
              this.errStr = "invalid number of keys";
              break loop;
            }
            if (this.stack.length < nKeys + 1n) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let pubKeys: Buffer[] = [];
            for (let i = 0; i < nKeys; i++) {
              let pubKeyBuf = this.stack.pop() as Buffer;
              if (pubKeyBuf.length !== 33) {
                this.errStr = "invalid public key length";
                break loop;
              }
              pubKeys.push(pubKeyBuf);
            }
            let nSigs = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer).num;
            if (nSigs < 0 || nSigs > nKeys) {
              this.errStr = "invalid number of signatures";
              break loop;
            }
            if (this.stack.length < nSigs) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let sigs: Buffer[] = [];
            for (let i = 0; i < nSigs; i++) {
              let sigBuf = this.stack.pop() as Buffer;
              if (sigBuf.length !== 65) {
                this.errStr = "invalid signature length";
                break loop;
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
              break loop;
            }
          }
          break;
        case OP.CHECKLOCKABSVERIFY:
          {
            if (this.stack.length < 1) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            if (scriptNum.num < 0n) {
              this.errStr = "negative lockabs";
              break loop;
            }
            if (this.tx.lockAbs < scriptNum.num) {
              this.errStr = "lockabs requirement not met";
              break loop;
            }
          }
          break;
        case OP.CHECKLOCKRELVERIFY:
          {
            if (this.stack.length < 1) {
              this.errStr = "invalid stack operation";
              break loop;
            }
            let scriptNum = ScriptNum.fromIsoBuf(this.stack.pop() as Buffer);
            if (scriptNum.num < 0n) {
              this.errStr = "negative lockrel";
              break loop;
            }
            const txInput = this.tx.inputs[this.nIn];
            if (txInput.lockRel < scriptNum.num) {
              this.errStr = "lockrel requirement not met";
              break loop;
            }
          }
          break;
        default: {
          this.errStr = "invalid opcode";
          break loop;
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
