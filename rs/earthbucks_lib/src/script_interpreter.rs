use crate::hash::{blake3_hash, double_blake3_hash};
use crate::opcode::{Opcode, OP};
use crate::pub_key::PubKey;
use crate::script::Script;
use crate::script_num::ScriptNum;
use crate::tx::{HashCache, Tx};
use crate::tx_signature::TxSignature;
use num_bigint::{BigInt, ToBigInt};
use num_traits::ToPrimitive;

pub struct ScriptInterpreter<'a> {
    pub script: Script,
    pub tx: Tx,
    pub n_in: usize,
    pub stack: Vec<Vec<u8>>,
    pub alt_stack: Vec<Vec<u8>>,
    pub pc: usize,
    pub n_op_count: usize,
    pub if_stack: Vec<bool>,
    pub return_value: Option<Vec<u8>>,
    pub return_success: Option<bool>,
    pub err_str: String,
    pub value: u64,
    pub hash_cache: &'a mut HashCache,
}

impl<'a> ScriptInterpreter<'a> {
    pub fn from_script_tx(
        script: Script,
        tx: Tx,
        n_in: usize,
        hash_cache: &'a mut HashCache,
    ) -> Self {
        Self {
            script,
            tx,
            n_in,
            stack: Vec::new(),
            alt_stack: Vec::new(),
            pc: 0,
            n_op_count: 0,
            if_stack: Vec::new(),
            return_value: None,
            return_success: None,
            err_str: "".to_string(),
            value: 0,
            hash_cache,
        }
    }

    pub fn from_output_script_tx(
        script: Script,
        tx: Tx,
        n_in: usize,
        stack: Vec<Vec<u8>>,
        value: u64,
        hash_cache: &'a mut HashCache,
    ) -> Self {
        Self {
            script,
            tx,
            n_in,
            stack,
            alt_stack: Vec::new(),
            pc: 0,
            n_op_count: 0,
            if_stack: Vec::new(),
            return_value: None,
            return_success: None,
            err_str: "".to_string(),
            value,
            hash_cache,
        }
    }

    pub fn cast_to_bool(buf: &[u8]) -> bool {
        !buf.iter().all(|&x| x == 0)
    }

    pub fn eval_script(&mut self) -> bool {
        while self.pc < self.script.chunks.len() {
            let chunk = &self.script.chunks[self.pc];
            let opcode = chunk.opcode;
            let if_exec = !self.if_stack.contains(&false);

            if !(if_exec
                || opcode == Opcode::OP_IF
                || opcode == Opcode::OP_NOTIF
                || opcode == Opcode::OP_ELSE
                || opcode == Opcode::OP_ENDIF)
            {
                self.pc += 1;
                continue;
            }

            match opcode {
                Opcode::OP_IF => {
                    let mut if_value = false;
                    if if_exec {
                        if self.stack.is_empty() {
                            self.err_str = "unbalanced conditional".to_string();
                            break;
                        }
                        let buf = self.stack.pop().unwrap();
                        if_value = ScriptInterpreter::cast_to_bool(&buf);
                    }
                    self.if_stack.push(if_value);
                }
                Opcode::OP_NOTIF => {
                    let mut if_value = false;
                    if if_exec {
                        if self.stack.is_empty() {
                            self.err_str = "unbalanced conditional".to_string();
                            break;
                        }
                        let buf = self.stack.pop().unwrap();
                        if_value = !ScriptInterpreter::cast_to_bool(&buf);
                    }
                    self.if_stack.push(if_value);
                }
                Opcode::OP_ELSE => {
                    if self.if_stack.is_empty() {
                        self.err_str = "unbalanced conditional".to_string();
                        break;
                    }
                    let if_stack_len = self.if_stack.len();
                    self.if_stack[if_stack_len - 1] = !self.if_stack[self.if_stack.len() - 1];
                }
                Opcode::OP_ENDIF => {
                    if self.if_stack.is_empty() {
                        self.err_str = "unbalanced conditional".to_string();
                        break;
                    }
                    self.if_stack.pop();
                }
                Opcode::OP_0 => {
                    self.stack.push(vec![]);
                }
                Opcode::OP_PUSHDATA1 | Opcode::OP_PUSHDATA2 | Opcode::OP_PUSHDATA4 => {
                    if let Some(buffer) = &chunk.buffer {
                        self.stack.push(buffer.clone());
                    } else {
                        self.err_str = "invalid pushdata".to_string();
                    }
                }
                Opcode::OP_1NEGATE => {
                    let script_num = ScriptNum::new((-1).to_bigint().unwrap());
                    self.stack.push(script_num.to_iso_buf());
                }
                Opcode::OP_1 => {
                    let script_num = ScriptNum::new(1.into());
                    self.stack.push(script_num.to_iso_buf());
                }
                Opcode::OP_2 => {
                    let script_num = ScriptNum::new(2.into());
                    self.stack.push(script_num.to_iso_buf());
                }
                Opcode::OP_3 => {
                    let script_num = ScriptNum::new(3.into());
                    self.stack.push(script_num.to_iso_buf());
                }
                Opcode::OP_4 => {
                    let script_num = ScriptNum::new(4.into());
                    self.stack.push(script_num.to_iso_buf());
                }
                Opcode::OP_5 => {
                    let script_num = ScriptNum::new(5.into());
                    self.stack.push(script_num.to_iso_buf());
                }
                Opcode::OP_6 => {
                    let script_num = ScriptNum::new(6.into());
                    self.stack.push(script_num.to_iso_buf());
                }
                Opcode::OP_7 => {
                    let script_num = ScriptNum::new(7.into());
                    self.stack.push(script_num.to_iso_buf());
                }
                Opcode::OP_8 => {
                    let script_num = ScriptNum::new(8.into());
                    self.stack.push(script_num.to_iso_buf());
                }
                Opcode::OP_9 => {
                    let script_num = ScriptNum::new(9.into());
                    self.stack.push(script_num.to_iso_buf());
                }
                Opcode::OP_10 => {
                    let script_num = ScriptNum::new(10.into());
                    self.stack.push(script_num.to_iso_buf());
                }
                Opcode::OP_11 => {
                    let script_num = ScriptNum::new(11.into());
                    self.stack.push(script_num.to_iso_buf());
                }
                Opcode::OP_12 => {
                    let script_num = ScriptNum::new(12.into());
                    self.stack.push(script_num.to_iso_buf());
                }
                Opcode::OP_13 => {
                    let script_num = ScriptNum::new(13.into());
                    self.stack.push(script_num.to_iso_buf());
                }
                Opcode::OP_14 => {
                    let script_num = ScriptNum::new(14.into());
                    self.stack.push(script_num.to_iso_buf());
                }
                Opcode::OP_15 => {
                    let script_num = ScriptNum::new(15.into());
                    self.stack.push(script_num.to_iso_buf());
                }
                Opcode::OP_16 => {
                    let script_num = ScriptNum::new(16.into());
                    self.stack.push(script_num.to_iso_buf());
                }
                Opcode::OP_VERIFY => {
                    if self.stack.is_empty() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf = self.stack.pop().unwrap();
                    if !ScriptInterpreter::cast_to_bool(&buf) {
                        self.err_str = "VERIFY failed".to_string();
                        break;
                    }
                }
                Opcode::OP_RETURN => {
                    break;
                }
                Opcode::OP_TOALTSTACK => {
                    if self.stack.is_empty() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    self.alt_stack.push(self.stack.pop().unwrap());
                }
                Opcode::OP_FROMALTSTACK => {
                    if self.alt_stack.is_empty() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    self.stack.push(self.alt_stack.pop().unwrap());
                }
                Opcode::OP_2DROP => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    self.stack.pop();
                    self.stack.pop();
                }
                Opcode::OP_2DUP => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf1 = self.stack[self.stack.len() - 2].clone();
                    let buf2 = self.stack[self.stack.len() - 1].clone();
                    self.stack.push(buf1);
                    self.stack.push(buf2);
                }
                Opcode::OP_3DUP => {
                    if self.stack.len() < 3 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf1 = self.stack[self.stack.len() - 3].clone();
                    let buf2 = self.stack[self.stack.len() - 2].clone();
                    let buf3 = self.stack[self.stack.len() - 1].clone();
                    self.stack.push(buf1);
                    self.stack.push(buf2);
                    self.stack.push(buf3);
                }
                Opcode::OP_2OVER => {
                    if self.stack.len() < 4 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf1 = self.stack[self.stack.len() - 4].clone();
                    let buf2 = self.stack[self.stack.len() - 3].clone();
                    self.stack.push(buf1);
                    self.stack.push(buf2);
                }
                Opcode::OP_2ROT => {
                    if self.stack.len() < 6 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf1 = self.stack[self.stack.len() - 6].clone();
                    let buf2 = self.stack[self.stack.len() - 5].clone();
                    self.stack.remove(self.stack.len() - 6);
                    self.stack.remove(self.stack.len() - 5);
                    self.stack.push(buf1);
                    self.stack.push(buf2);
                }
                Opcode::OP_2SWAP => {
                    if self.stack.len() < 4 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf1 = self.stack[self.stack.len() - 4].clone();
                    let buf2 = self.stack[self.stack.len() - 3].clone();
                    self.stack.remove(self.stack.len() - 4);
                    self.stack.remove(self.stack.len() - 3);
                    self.stack.push(buf1);
                    self.stack.push(buf2);
                }
                Opcode::OP_IFDUP => {
                    if self.stack.is_empty() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf = self.stack[self.stack.len() - 1].clone();
                    if ScriptInterpreter::cast_to_bool(&buf) {
                        self.stack.push(buf);
                    }
                }
                Opcode::OP_DEPTH => {
                    let script_num = ScriptNum::new(self.stack.len().to_bigint().unwrap());
                    self.stack.push(script_num.to_iso_buf());
                }
                Opcode::OP_DROP => {
                    if self.stack.is_empty() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    self.stack.pop();
                }
                Opcode::OP_DUP => {
                    if self.stack.is_empty() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf = self.stack[self.stack.len() - 1].clone();
                    self.stack.push(buf);
                }
                Opcode::OP_NIP => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf = self.stack.pop().unwrap();
                    self.stack.pop();
                    self.stack.push(buf);
                }
                Opcode::OP_OVER => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf = self.stack[self.stack.len() - 2].clone();
                    self.stack.push(buf);
                }
                Opcode::OP_PICK => {
                    if self.stack.is_empty() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    if (script_num.num < 0.to_bigint().unwrap())
                        || (script_num.num >= self.stack.len().to_bigint().unwrap())
                    {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let num = script_num.to_u32() as usize;
                    if num >= self.stack.len() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf = self.stack[self.stack.len() - num - 1].clone();
                    self.stack.push(buf);
                }
                Opcode::OP_ROLL => {
                    if self.stack.is_empty() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    if (script_num.num < 0.to_bigint().unwrap())
                        || (script_num.num >= self.stack.len().to_bigint().unwrap())
                    {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let num = script_num.to_u32() as usize;
                    if num >= self.stack.len() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf = self.stack.remove(self.stack.len() - num - 1);
                    self.stack.push(buf);
                }
                Opcode::OP_ROT => {
                    if self.stack.len() < 3 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf = self.stack.remove(self.stack.len() - 3);
                    self.stack.push(buf);
                }
                Opcode::OP_SWAP => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf = self.stack.remove(self.stack.len() - 2);
                    self.stack.push(buf);
                }
                Opcode::OP_TUCK => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf = self.stack[self.stack.len() - 1].clone();
                    self.stack.insert(self.stack.len() - 2, buf);
                }
                Opcode::OP_CAT => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf1 = self.stack.pop().unwrap();
                    let buf2 = self.stack.pop().unwrap();
                    let mut new_buf = Vec::new();
                    new_buf.extend_from_slice(&buf2);
                    new_buf.extend_from_slice(&buf1);
                    self.stack.push(new_buf);
                }
                Opcode::OP_SUBSTR => {
                    if self.stack.len() < 3 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num2 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let script_num1 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let script_num2_bn = script_num2.clone().num;
                    let script_num1_bn = script_num1.clone().num;
                    let buf = self.stack.pop().unwrap();
                    let buf_len = buf.len();
                    if script_num1_bn < 0.to_bigint().unwrap()
                        || script_num2_bn < 0.to_bigint().unwrap()
                        || script_num1_bn + script_num2_bn > buf_len.to_bigint().unwrap()
                    {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let start = script_num1.to_u32() as usize;
                    let len = script_num2.to_u32() as usize;
                    let new_buf = buf[start..start + len].to_vec();
                    self.stack.push(new_buf);
                }
                Opcode::OP_LEFT => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let buf = self.stack.pop().unwrap();
                    let len_bn = script_num.clone().num;
                    if len_bn < 0.to_bigint().unwrap() || len_bn > buf.len().to_bigint().unwrap() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let len = script_num.to_u32() as usize;
                    let new_buf = buf[0..len].to_vec();
                    self.stack.push(new_buf);
                }
                Opcode::OP_RIGHT => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let buf = self.stack.pop().unwrap();
                    let len_bn = script_num.clone().num;
                    if len_bn < 0.to_bigint().unwrap() || len_bn > buf.len().to_bigint().unwrap() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let len = script_num.to_u32() as usize;
                    let new_buf = buf[buf.len() - len..buf.len()].to_vec();
                    self.stack.push(new_buf);
                }
                Opcode::OP_SIZE => {
                    if self.stack.is_empty() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num =
                        ScriptNum::new(self.stack[self.stack.len() - 1].len().to_bigint().unwrap());
                    self.stack.push(script_num.to_iso_buf());
                }
                Opcode::OP_INVERT => {
                    if self.stack.is_empty() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let mut buf = self.stack.pop().unwrap();
                    buf.iter_mut().for_each(|byte| *byte = !*byte);
                    self.stack.push(buf);
                }
                Opcode::OP_AND => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf1 = self.stack.pop().unwrap();
                    let buf2 = self.stack.pop().unwrap();
                    let len1 = buf1.len();
                    let len2 = buf2.len();
                    if len1 != len2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let len = len1;
                    let mut new_buf = Vec::new();
                    for i in 0..len {
                        new_buf.push(buf1[i] & buf2[i]);
                    }
                    self.stack.push(new_buf);
                }
                Opcode::OP_OR => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf1 = self.stack.pop().unwrap();
                    let buf2 = self.stack.pop().unwrap();
                    let len1 = buf1.len();
                    let len2 = buf2.len();
                    if len1 != len2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let len = len1;
                    let mut new_buf = Vec::new();
                    for i in 0..len {
                        new_buf.push(buf1[i] | buf2[i]);
                    }
                    self.stack.push(new_buf);
                }
                Opcode::OP_XOR => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf1 = self.stack.pop().unwrap();
                    let buf2 = self.stack.pop().unwrap();
                    let len1 = buf1.len();
                    let len2 = buf2.len();
                    if len1 != len2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let len = len1;
                    let mut new_buf = Vec::new();
                    for i in 0..len {
                        new_buf.push(buf1[i] ^ buf2[i]);
                    }
                    self.stack.push(new_buf);
                }
                Opcode::OP_EQUAL => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf1 = self.stack.pop().unwrap();
                    let buf2 = self.stack.pop().unwrap();
                    let equal = buf1 == buf2;
                    self.stack.push(if equal { vec![1] } else { vec![] });
                }
                Opcode::OP_EQUALVERIFY => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf1 = self.stack.pop().unwrap();
                    let buf2 = self.stack.pop().unwrap();
                    if buf1 != buf2 {
                        self.err_str = "EQUALVERIFY failed".to_string();
                        break;
                    }
                }
                Opcode::OP_1ADD => {
                    if self.stack.is_empty() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let new_num = script_num.num + 1.to_bigint().unwrap();
                    self.stack.push(ScriptNum::new(new_num).to_iso_buf());
                }
                Opcode::OP_1SUB => {
                    if self.stack.is_empty() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let new_num = script_num.num - 1.to_bigint().unwrap();
                    self.stack.push(ScriptNum::new(new_num).to_iso_buf());
                }
                Opcode::OP_2MUL => {
                    if self.stack.is_empty() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let new_num = script_num.num * 2.to_bigint().unwrap();
                    self.stack.push(ScriptNum::new(new_num).to_iso_buf());
                }
                Opcode::OP_2DIV => {
                    if self.stack.is_empty() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let new_num = script_num.num / 2.to_bigint().unwrap();
                    self.stack.push(ScriptNum::new(new_num).to_iso_buf());
                }
                Opcode::OP_NEGATE => {
                    if self.stack.is_empty() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let new_num = -script_num.num;
                    self.stack.push(ScriptNum::new(new_num).to_iso_buf());
                }
                Opcode::OP_ABS => {
                    if self.stack.is_empty() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let mut script_num = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    if script_num.num < 0.to_bigint().unwrap() {
                        script_num.num = -script_num.num;
                    }
                    self.stack.push(ScriptNum::new(script_num.num).to_iso_buf());
                }
                Opcode::OP_NOT => {
                    if self.stack.is_empty() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let new_num = if script_num.num == 0.to_bigint().unwrap() {
                        1.to_bigint().unwrap()
                    } else {
                        0.to_bigint().unwrap()
                    };
                    self.stack.push(ScriptNum::new(new_num).to_iso_buf());
                }
                Opcode::OP_0NOTEQUAL => {
                    if self.stack.is_empty() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let new_num = if script_num.num == 0.to_bigint().unwrap() {
                        0.to_bigint().unwrap()
                    } else {
                        1.to_bigint().unwrap()
                    };
                    self.stack.push(ScriptNum::new(new_num).to_iso_buf());
                }
                Opcode::OP_ADD => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let new_num = script_num1.num + script_num2.num;
                    self.stack.push(ScriptNum::new(new_num).to_iso_buf());
                }
                Opcode::OP_SUB => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let new_num = script_num2.num - script_num1.num;
                    self.stack.push(ScriptNum::new(new_num).to_iso_buf());
                }
                Opcode::OP_MUL => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let new_num = script_num1.num * script_num2.num;
                    self.stack.push(ScriptNum::new(new_num).to_iso_buf());
                }
                Opcode::OP_DIV => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    if script_num1.num == 0.to_bigint().unwrap() {
                        self.err_str = "division by zero".to_string();
                        break;
                    }
                    let new_num = script_num2.num / script_num1.num;
                    self.stack.push(ScriptNum::new(new_num).to_iso_buf());
                }
                Opcode::OP_MOD => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    if script_num1.num == 0.to_bigint().unwrap() {
                        self.err_str = "division by zero".to_string();
                        break;
                    }
                    let new_num = script_num2.num % script_num1.num;
                    self.stack.push(ScriptNum::new(new_num).to_iso_buf());
                }
                Opcode::OP_LSHIFT => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    if script_num1.num < 0.to_bigint().unwrap() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let new_num = script_num2.num << script_num1.to_u32();
                    self.stack.push(ScriptNum::new(new_num).to_iso_buf());
                }
                Opcode::OP_RSHIFT => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    if script_num1.num < 0.to_bigint().unwrap() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let new_num = script_num2.num >> script_num1.to_u32();
                    self.stack.push(ScriptNum::new(new_num).to_iso_buf());
                }
                Opcode::OP_BOOLAND => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf1 = self.stack.pop().unwrap();
                    let buf2 = self.stack.pop().unwrap();
                    let bool1 = ScriptInterpreter::cast_to_bool(&buf1);
                    let bool2 = ScriptInterpreter::cast_to_bool(&buf2);
                    self.stack
                        .push(if bool1 && bool2 { vec![1] } else { vec![] });
                }
                Opcode::OP_BOOLOR => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf1 = self.stack.pop().unwrap();
                    let buf2 = self.stack.pop().unwrap();
                    let bool1 = ScriptInterpreter::cast_to_bool(&buf1);
                    let bool2 = ScriptInterpreter::cast_to_bool(&buf2);
                    self.stack
                        .push(if bool1 || bool2 { vec![1] } else { vec![] });
                }
                Opcode::OP_NUMEQUAL => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    self.stack.push(if script_num1.num == script_num2.num {
                        vec![1]
                    } else {
                        vec![]
                    });
                }
                Opcode::OP_NUMEQUALVERIFY => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    if script_num1.num != script_num2.num {
                        self.err_str = "NUMEQUALVERIFY failed".to_string();
                        break;
                    }
                }
                Opcode::OP_NUMNOTEQUAL => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    self.stack.push(if script_num1.num != script_num2.num {
                        vec![1]
                    } else {
                        vec![]
                    });
                }
                Opcode::OP_LESSTHAN => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    self.stack.push(if script_num2.num < script_num1.num {
                        vec![1]
                    } else {
                        vec![]
                    });
                }
                Opcode::OP_GREATERTHAN => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    self.stack.push(if script_num2.num > script_num1.num {
                        vec![1]
                    } else {
                        vec![]
                    });
                }
                Opcode::OP_LESSTHANOREQUAL => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    self.stack.push(if script_num2.num <= script_num1.num {
                        vec![1]
                    } else {
                        vec![]
                    });
                }
                Opcode::OP_GREATERTHANOREQUAL => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    self.stack.push(if script_num2.num >= script_num1.num {
                        vec![1]
                    } else {
                        vec![]
                    });
                }
                Opcode::OP_MIN => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    self.stack.push(if script_num2.num < script_num1.num {
                        script_num2.to_iso_buf()
                    } else {
                        script_num1.to_iso_buf()
                    });
                }
                Opcode::OP_MAX => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    self.stack.push(if script_num2.num > script_num1.num {
                        script_num2.to_iso_buf()
                    } else {
                        script_num1.to_iso_buf()
                    });
                }
                Opcode::OP_WITHIN => {
                    // (x min max -- out)
                    if self.stack.len() < 3 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_max = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let script_min = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let script_x = ScriptNum::from_iso_buf(&self.stack.pop().unwrap());
                    let min = script_min.num;
                    let max = script_max.num;
                    let x = script_x.num;
                    self.stack
                        .push(if x >= min && x < max { vec![1] } else { vec![] });
                }
                Opcode::OP_BLAKE3 => {
                    if self.stack.is_empty() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf = self.stack.pop().unwrap();
                    let hash = blake3_hash(&buf);
                    self.stack.push(hash.to_vec());
                }
                Opcode::OP_DOUBLEBLAKE3 => {
                    if self.stack.is_empty() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf = self.stack.pop().unwrap();
                    let hash = double_blake3_hash(&buf);
                    self.stack.push(hash.to_vec());
                }
                Opcode::OP_CHECKSIG | Opcode::OP_CHECKSIGVERIFY => {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let pub_key_buf = self.stack.pop().unwrap();
                    if pub_key_buf.len() != PubKey::SIZE {
                        self.err_str = "invalid public key length".to_string();
                        break;
                    }
                    let sig_buf = self.stack.pop().unwrap();
                    if sig_buf.len() != TxSignature::SIZE {
                        self.err_str = "invalid signature length".to_string();
                        break;
                    }
                    let signature = TxSignature::from_iso_buf(sig_buf);

                    let exec_script_buf = self.script.to_iso_buf();

                    let pub_key_arr: [u8; PubKey::SIZE] =
                        pub_key_buf.try_into().unwrap_or_else(|v: Vec<u8>| {
                            panic!(
                                "Expected a Vec of length {} but it was {}",
                                PubKey::SIZE,
                                v.len()
                            )
                        });

                    let success = self.tx.verify_with_cache(
                        self.n_in,
                        pub_key_arr,
                        signature.unwrap(),
                        exec_script_buf,
                        self.value,
                        self.hash_cache,
                    );

                    self.stack.push(if success { vec![1] } else { vec![] });
                    if opcode == OP["CHECKSIGVERIFY"] && !success {
                        self.err_str = "CHECKSIGVERIFY failed".to_string();
                        break;
                    }
                }
                Opcode::OP_CHECKMULTISIG | Opcode::OP_CHECKMULTISIGVERIFY => {
                    if self.stack.is_empty() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let n_keys = ScriptNum::from_iso_buf(&self.stack.pop().unwrap()).num;
                    if n_keys < BigInt::from(0) || n_keys > BigInt::from(16) {
                        self.err_str = "invalid number of keys".to_string();
                        break;
                    }
                    if self.stack.len() < (n_keys.to_usize().unwrap() + 1) {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let mut pub_keys: Vec<Vec<u8>> = Vec::new();
                    for _ in 0..n_keys.to_usize().unwrap() {
                        let pub_key_buf = self.stack.pop().unwrap();
                        if pub_key_buf.len() != PubKey::SIZE {
                            self.err_str = "invalid public key length".to_string();
                            break;
                        }
                        pub_keys.push(pub_key_buf);
                    }
                    let n_sigs = ScriptNum::from_iso_buf(&self.stack.pop().unwrap()).num;
                    if n_sigs < BigInt::from(0) || n_sigs > n_keys {
                        self.err_str = "invalid number of signatures".to_string();
                        break;
                    }
                    if self.stack.len() < n_sigs.to_usize().unwrap() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let mut sigs: Vec<Vec<u8>> = Vec::new();
                    for _ in 0..n_sigs.to_usize().unwrap() {
                        let sig_buf = self.stack.pop().unwrap();
                        if sig_buf.len() != TxSignature::SIZE {
                            self.err_str = "invalid signature length".to_string();
                            break;
                        }
                        sigs.push(sig_buf);
                    }
                    let exec_script_buf = self.script.to_iso_buf();

                    let mut matched_sigs = 0;
                    for sig in sigs {
                        for j in 0..pub_keys.len() {
                            let success = self.tx.verify_with_cache(
                                self.n_in,
                                pub_keys[j][..PubKey::SIZE].try_into().unwrap(),
                                TxSignature::from_iso_buf(sig.clone()).unwrap(),
                                exec_script_buf.clone(),
                                self.value,
                                self.hash_cache,
                            );
                            if success {
                                matched_sigs += 1;
                                pub_keys.remove(j); // Remove the matched public key
                                break;
                            }
                        }
                    }
                    let success = matched_sigs == n_sigs.to_usize().unwrap();

                    self.stack.push(if success { vec![1] } else { vec![] });
                    if opcode == OP["CHECKMULTISIGVERIFY"] && !success {
                        self.err_str = "CHECKMULTISIGVERIFY failed".to_string();
                        break;
                    }
                }
                Opcode::OP_CHECKLOCKABSVERIFY => {
                    if self.stack.is_empty() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_iso_buf(self.stack.last().unwrap());
                    if script_num.num < 0.into() {
                        self.err_str = "negative lockabs".to_string();
                        break;
                    }
                    if self.tx.lock_abs.to_bigint().unwrap() < script_num.num {
                        self.err_str = "lockabs requirement not met".to_string();
                        break;
                    }
                }
                Opcode::OP_CHECKLOCKRELVERIFY => {
                    if self.stack.is_empty() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_iso_buf(self.stack.last().unwrap());
                    if script_num.num < 0.into() {
                        self.err_str = "negative lockrel".to_string();
                        break;
                    }
                    let tx_input = &self.tx.inputs[self.n_in];
                    if tx_input.lock_rel.to_bigint().unwrap() < script_num.num {
                        self.err_str = "lockrel requirement not met".to_string();
                        break;
                    }
                }
                _ => {
                    self.err_str = "invalid opcode".to_string();
                    break;
                }
            }

            self.pc += 1;
        }
        if !self.err_str.is_empty() {
            if !self.stack.is_empty() {
                self.return_value = Some(self.stack[self.stack.len() - 1].clone());
            } else {
                self.return_value = Some(vec![]);
            }
            self.return_success = Some(false);
            return self.return_success.unwrap();
        }
        if !self.stack.is_empty() {
            self.return_value = Some(self.stack[self.stack.len() - 1].clone());
            self.return_success = Some(ScriptInterpreter::cast_to_bool(
                self.return_value.as_ref().unwrap(),
            ));
        } else {
            self.return_value = Some(vec![]);
            self.return_success = Some(false);
        }
        self.return_success.unwrap()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ebx_buf::EbxBuf;
    use crate::pkh::Pkh;
    use crate::tx_in::TxIn;
    use crate::tx_out::TxOut;

    mod sanity_tests {
        use crate::{priv_key::PrivKey, pub_key::PubKey};

        use super::*;

        #[test]
        fn test_zero() {
            let tx = Tx::new(0, Vec::new(), Vec::new(), 0);
            let script = Script::from_iso_str("0").unwrap();
            let mut hash_cache = HashCache::new();
            let mut script_interpreter =
                ScriptInterpreter::from_script_tx(script, tx, 0, &mut hash_cache);
            script_interpreter.eval_script();
            assert_eq!(script_interpreter.return_success, Some(false));
            assert_eq!(hex::encode(script_interpreter.return_value.unwrap()), "");
        }

        #[test]
        fn test_pushdata1() {
            let tx = Tx::new(0, Vec::new(), Vec::new(), 0);
            let script = Script::from_iso_str("0xff").unwrap();
            let mut hash_cache = HashCache::new();
            let mut script_interpreter =
                ScriptInterpreter::from_script_tx(script, tx, 0, &mut hash_cache);
            script_interpreter.eval_script();
            assert_eq!(script_interpreter.return_success, Some(true));
            assert!(script_interpreter.return_value.is_some());
            assert_eq!(hex::encode(script_interpreter.return_value.unwrap()), "ff");
        }

        #[test]
        fn test_pushdata2() {
            let tx = Tx::new(0, Vec::new(), Vec::new(), 0);
            let script = Script::from_iso_str(&("0x".to_owned() + &"ff".repeat(256))).unwrap();

            let mut hash_cache = HashCache::new();
            let mut script_interpreter =
                ScriptInterpreter::from_script_tx(script, tx, 0, &mut hash_cache);
            script_interpreter.eval_script();
            assert_eq!(script_interpreter.return_success, Some(true));
            assert!(script_interpreter.return_value.is_some());
            assert_eq!(
                hex::encode(script_interpreter.return_value.unwrap()),
                "ff".repeat(256)
            );
        }

        #[test]
        fn test_pushdata4() {
            let tx = Tx::new(0, Vec::new(), Vec::new(), 0);
            let script = Script::from_iso_str(&("0x".to_owned() + &"ff".repeat(65536))).unwrap();
            let mut hash_cache = HashCache::new();
            let mut script_interpreter =
                ScriptInterpreter::from_script_tx(script, tx, 0, &mut hash_cache);
            script_interpreter.eval_script();
            assert_eq!(script_interpreter.return_success, Some(true));
            assert!(script_interpreter.return_value.is_some());
            assert_eq!(
                hex::encode(script_interpreter.return_value.unwrap()),
                "ff".repeat(65536)
            );
        }

        #[test]
        fn test_1negate() {
            let tx = Tx::new(0, Vec::new(), Vec::new(), 0);
            let script = Script::from_iso_str("1NEGATE").unwrap();
            let mut hash_cache = HashCache::new();
            let mut script_interpreter =
                ScriptInterpreter::from_script_tx(script, tx, 0, &mut hash_cache);
            script_interpreter.eval_script();
            assert_eq!(script_interpreter.return_success, Some(true));
            assert!(script_interpreter.return_value.is_some());
            assert_eq!(hex::encode(script_interpreter.return_value.unwrap()), "ff");
        }

        #[test]
        fn test_checksig() {
            let output_priv_key_hex =
                "d9486fac4a1de03ca8c562291182e58f2f3e42a82eaf3152ccf744b3a8b3b725";
            let output_priv_key_buf = PrivKey::from_iso_hex(output_priv_key_hex).unwrap().buf;
            // let output_key = KeyPair::new(output_priv_key_buf.clone());
            let output_pub_key =
                PubKey::from_priv_key(&PrivKey::from_iso_hex(output_priv_key_hex).unwrap())
                    .unwrap()
                    .buf;
            assert_eq!(
                output_pub_key.to_strict_hex(),
                "0377b8ba0a276329096d51275a8ab13809b4cd7af856c084d60784ed8e4133d987"
            );
            let output_pkh = Pkh::from_pub_key_buffer(output_pub_key.to_vec());
            let output_script = Script::from_pkh_output(output_pkh.to_iso_buf());
            let output_amount = 100;
            let output_tx_id = [0; 32];
            let output_tx_index = 0;

            let mut tx = Tx::new(
                1,
                vec![TxIn::new(
                    output_tx_id,
                    output_tx_index,
                    Script::from_empty(),
                    0xffffffff,
                )],
                vec![TxOut::new(output_amount, output_script.clone())],
                0,
            );

            let sig = tx.sign_no_cache(
                0,
                output_priv_key_buf,
                output_script.to_iso_buf(),
                output_amount,
                TxSignature::SIGHASH_ALL,
            );

            let stack = vec![sig.to_iso_buf().to_vec(), output_pub_key.to_vec()];
            let mut hash_cache = HashCache::new();

            let mut script_interpreter = ScriptInterpreter::from_output_script_tx(
                output_script,
                tx,
                0,
                stack,
                output_amount,
                &mut hash_cache,
            );

            let result = script_interpreter.eval_script();
            assert!(result);
        }

        #[test]
        fn test_checkmultisig() {
            // Define private keys
            let priv_keys_hex = [
                "eee66a051d43a62b00da7185bbf2a13b42f601a0b987a8f1815b4213c9343451",
                "f8749a7b6a825eb9e82e27720fd3b90e0f157adc75fe3e0efbf3c8a335eb3ef5",
                "5df05870846dd200a7d29da98ad32016209d99af0422d66e568f97720d1acee3",
                "c91b042751b94d705abee4fc67eb483dc32ae432e037f66120f5e865e4257c66",
                "b78467b0ea6afa6c42c94333dcece978829bdb7ba7b97a2273b72cdc6be8c553",
            ];

            // Convert private keys to Vec<u8> format
            let priv_keys_iso_buf: Vec<Vec<u8>> = priv_keys_hex
                .iter()
                .map(|hex| Vec::<u8>::from_strict_hex(hex).unwrap())
                .collect();

            // Generate public keys
            let pub_keys: Vec<Vec<u8>> = priv_keys_iso_buf
                .iter()
                .map(|priv_key| {
                    PrivKey::from_iso_buf(priv_key.clone())
                        .unwrap()
                        .to_pub_key_buffer()
                        .unwrap()
                        .clone()
                        .to_vec()
                })
                .collect();

            // Create a multisig output script
            let output_script = Script::from_multi_sig_output(3, pub_keys);

            // Other tx parameters
            let output_amount = 100;
            let output_tx_id = [0; 32];
            let output_tx_index = 0;

            // Create a tx
            let mut tx = Tx::new(
                1,
                vec![TxIn::new(
                    output_tx_id,
                    output_tx_index,
                    Script::from_empty(),
                    0xffffffff,
                )],
                vec![TxOut::new(output_amount, output_script.clone())],
                0,
            );

            // Sign the tx with the first 3 private keys
            let sigs: Vec<Vec<u8>> = priv_keys_iso_buf[0..3]
                .iter()
                .map(|priv_key| {
                    tx.sign_no_cache(
                        0,
                        priv_key[..32].try_into().unwrap(),
                        output_script.to_iso_buf(),
                        output_amount,
                        TxSignature::SIGHASH_ALL,
                    )
                    .to_iso_buf()
                    .to_vec()
                })
                .collect();

            // Create a stack with the signatures
            let stack = sigs.clone();
            let mut hash_cache = HashCache::new();

            // Create a script interpreter
            let mut script_interpreter = ScriptInterpreter::from_output_script_tx(
                output_script,
                tx,
                0,
                stack,
                output_amount,
                &mut hash_cache,
            );

            // Evaluate the script
            let result = script_interpreter.eval_script();
            assert_eq!(script_interpreter.err_str, "");
            assert!(result);
        }
    }

    mod test_vectors {
        use super::*;
        use hex;
        use serde::Deserialize;
        use std::fs;

        #[derive(Deserialize)]
        struct TestScript {
            name: String,
            script: String,
            expected_return_value: String,
            expected_success: bool,
            expected_error: String,
        }

        #[derive(Deserialize)]
        struct TestScripts {
            scripts: Vec<TestScript>,
        }

        #[test]
        fn test_vectors() {
            let file = fs::read_to_string("./test_vectors/script_interpreter.json")
                .expect("Failed to read JSON file");
            let test_scripts: TestScripts =
                serde_json::from_str(&file).expect("Failed to parse JSON file");

            for test_script in test_scripts.scripts {
                println!("Running test: {}", test_script.name);
                // to confirm tests are running:
                // cargo test script_interpreter -- --nocapture

                let script = Script::from_iso_str(&test_script.script).unwrap();
                let tx = Tx::new(
                    1,
                    vec![TxIn::new([0; 32], 0, Script::from_empty(), 0xffffffff)],
                    vec![TxOut::new(0, Script::from_empty())],
                    0,
                );
                let mut hash_cache = HashCache::new();
                let mut script_interpreter =
                    ScriptInterpreter::from_script_tx(script, tx, 0, &mut hash_cache);
                script_interpreter.eval_script();
                assert_eq!(
                    script_interpreter.err_str, test_script.expected_error,
                    "Test '{}' failed on error value",
                    test_script.name
                );
                assert_eq!(
                    script_interpreter.return_success,
                    Some(test_script.expected_success),
                    "Test '{}' failed on success value",
                    test_script.name
                );
                assert_eq!(
                    hex::encode(&script_interpreter.return_value.unwrap()),
                    test_script.expected_return_value,
                    "Test '{}' failed on return value",
                    test_script.name
                );
            }
        }
    }
}
