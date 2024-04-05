use crate::blake3::{blake3_hash, double_blake3_hash};
use crate::opcode::OP;
use crate::script::Script;
use crate::script_num::ScriptNum;
use crate::tx::Tx;
use crate::tx_signature::TxSignature;
use num_bigint::{BigInt, ToBigInt};
use num_traits::ToPrimitive;

pub struct ScriptInterpreter {
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
}

impl ScriptInterpreter {
    pub fn new(
        script: Script,
        tx: Tx,
        n_in: usize,
        stack: Vec<Vec<u8>>,
        alt_stack: Vec<Vec<u8>>,
        pc: usize,
        n_op_count: usize,
        if_stack: Vec<bool>,
        return_value: Option<Vec<u8>>,
        return_success: Option<bool>,
        err_str: String,
        value: u64,
    ) -> Self {
        Self {
            script,
            tx,
            n_in,
            stack,
            alt_stack,
            pc,
            n_op_count,
            if_stack,
            return_value,
            return_success,
            err_str,
            value,
        }
    }

    pub fn from_script_tx(script: Script, tx: Tx, n_in: usize) -> Self {
        Self::new(
            script,
            tx,
            n_in,
            Vec::new(),
            Vec::new(),
            0,
            0,
            Vec::new(),
            None,
            None,
            "".to_string(),
            0 as u64,
        )
    }

    pub fn from_output_script_tx(
        script: Script,
        tx: Tx,
        n_in: usize,
        stack: Vec<Vec<u8>>,
        value: u64,
    ) -> Self {
        Self::new(
            script,
            tx,
            n_in,
            stack,
            Vec::new(),
            0,
            0,
            Vec::new(),
            None,
            None,
            "".to_string(),
            value,
        )
    }

    pub fn cast_to_bool(buf: &Vec<u8>) -> bool {
        !buf.iter().all(|&x| x == 0)
    }

    pub fn eval_script(&mut self) -> bool {
        while self.pc < self.script.chunks.len() {
            let chunk = &self.script.chunks[self.pc];
            let opcode = chunk.opcode;
            let if_exec = !self.if_stack.contains(&false);

            if if_exec
                || (opcode == OP["IF"]
                    || opcode == OP["NOTIF"]
                    || opcode == OP["ELSE"]
                    || opcode == OP["ENDIF"])
            {
                if opcode == OP["IF"] {
                    let mut if_value = false;
                    if if_exec {
                        if self.stack.len() < 1 {
                            self.err_str = "unbalanced conditional".to_string();
                            break;
                        }
                        let buf = self.stack.pop().unwrap();
                        if_value = ScriptInterpreter::cast_to_bool(&buf);
                    }
                    self.if_stack.push(if_value);
                } else if opcode == OP["NOTIF"] {
                    let mut if_value = false;
                    if if_exec {
                        if self.stack.len() < 1 {
                            self.err_str = "unbalanced conditional".to_string();
                            break;
                        }
                        let buf = self.stack.pop().unwrap();
                        if_value = !ScriptInterpreter::cast_to_bool(&buf);
                    }
                    self.if_stack.push(if_value);
                } else if opcode == OP["ELSE"] {
                    if self.if_stack.is_empty() {
                        self.err_str = "unbalanced conditional".to_string();
                        break;
                    }
                    let if_stack_len = self.if_stack.len();
                    self.if_stack[if_stack_len - 1] = !self.if_stack[self.if_stack.len() - 1];
                } else if opcode == OP["ENDIF"] {
                    if self.if_stack.is_empty() {
                        self.err_str = "unbalanced conditional".to_string();
                        break;
                    }
                    self.if_stack.pop();
                } else if opcode == OP["0"] {
                    self.stack.push(vec![0]);
                } else if opcode == OP["PUSHDATA1"]
                    || opcode == OP["PUSHDATA2"]
                    || opcode == OP["PUSHDATA4"]
                {
                    if let Some(buffer) = &chunk.buffer {
                        self.stack.push(buffer.clone());
                    } else {
                        self.err_str = "invalid pushdata".to_string();
                    }
                } else if opcode == OP["1NEGATE"] {
                    let script_num = ScriptNum::new(-1.to_bigint().unwrap());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == OP["1"] {
                    let script_num = ScriptNum::new(1.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == OP["2"] {
                    let script_num = ScriptNum::new(2.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == OP["3"] {
                    let script_num = ScriptNum::new(3.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == OP["4"] {
                    let script_num = ScriptNum::new(4.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == OP["5"] {
                    let script_num = ScriptNum::new(5.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == OP["6"] {
                    let script_num = ScriptNum::new(6.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == OP["7"] {
                    let script_num = ScriptNum::new(7.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == OP["8"] {
                    let script_num = ScriptNum::new(8.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == OP["9"] {
                    let script_num = ScriptNum::new(9.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == OP["10"] {
                    let script_num = ScriptNum::new(10.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == OP["11"] {
                    let script_num = ScriptNum::new(11.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == OP["12"] {
                    let script_num = ScriptNum::new(12.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == OP["13"] {
                    let script_num = ScriptNum::new(13.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == OP["14"] {
                    let script_num = ScriptNum::new(14.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == OP["15"] {
                    let script_num = ScriptNum::new(15.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == OP["16"] {
                    let script_num = ScriptNum::new(16.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == OP["VERIFY"] {
                    if self.stack.len() < 1 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf = self.stack.pop().unwrap();
                    if !ScriptInterpreter::cast_to_bool(&buf) {
                        self.err_str = "VERIFY failed".to_string();
                        break;
                    }
                } else if opcode == OP["RETURN"] {
                    break;
                } else if opcode == OP["TOALTSTACK"] {
                    if self.stack.len() < 1 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    self.alt_stack.push(self.stack.pop().unwrap());
                } else if opcode == OP["FROMALTSTACK"] {
                    if self.alt_stack.len() < 1 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    self.stack.push(self.alt_stack.pop().unwrap());
                } else if opcode == OP["2DROP"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    self.stack.pop();
                    self.stack.pop();
                } else if opcode == OP["2DUP"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf1 = self.stack[self.stack.len() - 2].clone();
                    let buf2 = self.stack[self.stack.len() - 1].clone();
                    self.stack.push(buf1);
                    self.stack.push(buf2);
                } else if opcode == OP["3DUP"] {
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
                } else if opcode == OP["2OVER"] {
                    if self.stack.len() < 4 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf1 = self.stack[self.stack.len() - 4].clone();
                    let buf2 = self.stack[self.stack.len() - 3].clone();
                    self.stack.push(buf1);
                    self.stack.push(buf2);
                } else if opcode == OP["2ROT"] {
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
                } else if opcode == OP["2SWAP"] {
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
                } else if opcode == OP["IFDUP"] {
                    if self.stack.len() < 1 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf = self.stack[self.stack.len() - 1].clone();
                    if ScriptInterpreter::cast_to_bool(&buf) {
                        self.stack.push(buf);
                    }
                } else if opcode == OP["DEPTH"] {
                    let script_num = ScriptNum::new(self.stack.len().to_bigint().unwrap());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == OP["DROP"] {
                    if self.stack.len() < 1 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    self.stack.pop();
                } else if opcode == OP["DUP"] {
                    if self.stack.len() < 1 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf = self.stack[self.stack.len() - 1].clone();
                    self.stack.push(buf);
                } else if opcode == OP["NIP"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf = self.stack.pop().unwrap();
                    self.stack.pop();
                    self.stack.push(buf);
                } else if opcode == OP["OVER"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf = self.stack[self.stack.len() - 2].clone();
                    self.stack.push(buf);
                } else if opcode == OP["PICK"] {
                    if self.stack.len() < 1 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
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
                } else if opcode == OP["ROLL"] {
                    if self.stack.len() < 1 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
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
                } else if opcode == OP["ROT"] {
                    if self.stack.len() < 3 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf = self.stack.remove(self.stack.len() - 3);
                    self.stack.push(buf);
                } else if opcode == OP["SWAP"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf = self.stack.remove(self.stack.len() - 2);
                    self.stack.push(buf);
                } else if opcode == OP["TUCK"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf = self.stack[self.stack.len() - 1].clone();
                    self.stack.insert(self.stack.len() - 2, buf);
                } else if opcode == OP["CAT"] {
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
                } else if opcode == OP["SUBSTR"] {
                    if self.stack.len() < 3 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num2 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let script_num1 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
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
                } else if opcode == OP["LEFT"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let buf = self.stack.pop().unwrap();
                    let len_bn = script_num.clone().num;
                    if len_bn < 0.to_bigint().unwrap() || len_bn > buf.len().to_bigint().unwrap() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let len = script_num.to_u32() as usize;
                    let new_buf = buf[0..len].to_vec();
                    self.stack.push(new_buf);
                } else if opcode == OP["RIGHT"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let buf = self.stack.pop().unwrap();
                    let len_bn = script_num.clone().num;
                    if len_bn < 0.to_bigint().unwrap() || len_bn > buf.len().to_bigint().unwrap() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let len = script_num.to_u32() as usize;
                    let new_buf = buf[buf.len() - len..buf.len()].to_vec();
                    self.stack.push(new_buf);
                } else if opcode == OP["SIZE"] {
                    if self.stack.len() < 1 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num =
                        ScriptNum::new(self.stack[self.stack.len() - 1].len().to_bigint().unwrap());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == OP["INVERT"] {
                    if self.stack.len() < 1 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let mut buf = self.stack.pop().unwrap();
                    for i in 0..buf.len() {
                        buf[i] = !buf[i];
                    }
                    self.stack.push(buf);
                } else if opcode == OP["AND"] {
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
                } else if opcode == OP["OR"] {
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
                } else if opcode == OP["XOR"] {
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
                } else if opcode == OP["EQUAL"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf1 = self.stack.pop().unwrap();
                    let buf2 = self.stack.pop().unwrap();
                    let equal = buf1 == buf2;
                    self.stack.push(if equal { vec![1] } else { vec![0] });
                } else if opcode == OP["EQUALVERIFY"] {
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
                } else if opcode == OP["1ADD"] {
                    if self.stack.len() < 1 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let new_num = script_num.num + 1.to_bigint().unwrap();
                    self.stack.push(ScriptNum::new(new_num).to_u8_vec());
                } else if opcode == OP["1SUB"] {
                    if self.stack.len() < 1 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let new_num = script_num.num - 1.to_bigint().unwrap();
                    self.stack.push(ScriptNum::new(new_num).to_u8_vec());
                } else if opcode == OP["2MUL"] {
                    if self.stack.len() < 1 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let new_num = script_num.num * 2.to_bigint().unwrap();
                    self.stack.push(ScriptNum::new(new_num).to_u8_vec());
                } else if opcode == OP["2DIV"] {
                    if self.stack.len() < 1 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let new_num = script_num.num / 2.to_bigint().unwrap();
                    self.stack.push(ScriptNum::new(new_num).to_u8_vec());
                } else if opcode == OP["NEGATE"] {
                    if self.stack.len() < 1 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let new_num = -script_num.num;
                    self.stack.push(ScriptNum::new(new_num).to_u8_vec());
                } else if opcode == OP["ABS"] {
                    if self.stack.len() < 1 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let mut script_num = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    if script_num.num < 0.to_bigint().unwrap() {
                        script_num.num = -script_num.num;
                    }
                    self.stack.push(ScriptNum::new(script_num.num).to_u8_vec());
                } else if opcode == OP["NOT"] {
                    if self.stack.len() < 1 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let new_num = if script_num.num == 0.to_bigint().unwrap() {
                        1.to_bigint().unwrap()
                    } else {
                        0.to_bigint().unwrap()
                    };
                    self.stack.push(ScriptNum::new(new_num).to_u8_vec());
                } else if opcode == OP["0NOTEQUAL"] {
                    if self.stack.len() < 1 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let new_num = if script_num.num == 0.to_bigint().unwrap() {
                        0.to_bigint().unwrap()
                    } else {
                        1.to_bigint().unwrap()
                    };
                    self.stack.push(ScriptNum::new(new_num).to_u8_vec());
                } else if opcode == OP["ADD"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let new_num = script_num1.num + script_num2.num;
                    self.stack.push(ScriptNum::new(new_num).to_u8_vec());
                } else if opcode == OP["SUB"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let new_num = script_num2.num - script_num1.num;
                    self.stack.push(ScriptNum::new(new_num).to_u8_vec());
                } else if opcode == OP["MUL"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let new_num = script_num1.num * script_num2.num;
                    self.stack.push(ScriptNum::new(new_num).to_u8_vec());
                } else if opcode == OP["DIV"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    if script_num1.num == 0.to_bigint().unwrap() {
                        self.err_str = "division by zero".to_string();
                        break;
                    }
                    let new_num = script_num2.num / script_num1.num;
                    self.stack.push(ScriptNum::new(new_num).to_u8_vec());
                } else if opcode == OP["MOD"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    if script_num1.num == 0.to_bigint().unwrap() {
                        self.err_str = "division by zero".to_string();
                        break;
                    }
                    let new_num = script_num2.num % script_num1.num;
                    self.stack.push(ScriptNum::new(new_num).to_u8_vec());
                } else if opcode == OP["LSHIFT"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    if script_num1.num < 0.to_bigint().unwrap() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let new_num = script_num2.num << script_num1.to_u32();
                    self.stack.push(ScriptNum::new(new_num).to_u8_vec());
                } else if opcode == OP["RSHIFT"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    if script_num1.num < 0.to_bigint().unwrap() {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let new_num = script_num2.num >> script_num1.to_u32();
                    self.stack.push(ScriptNum::new(new_num).to_u8_vec());
                } else if opcode == OP["BOOLAND"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf1 = self.stack.pop().unwrap();
                    let buf2 = self.stack.pop().unwrap();
                    let bool1 = ScriptInterpreter::cast_to_bool(&buf1);
                    let bool2 = ScriptInterpreter::cast_to_bool(&buf2);
                    self.stack
                        .push(if bool1 && bool2 { vec![1] } else { vec![0] });
                } else if opcode == OP["BOOLOR"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf1 = self.stack.pop().unwrap();
                    let buf2 = self.stack.pop().unwrap();
                    let bool1 = ScriptInterpreter::cast_to_bool(&buf1);
                    let bool2 = ScriptInterpreter::cast_to_bool(&buf2);
                    self.stack
                        .push(if bool1 || bool2 { vec![1] } else { vec![0] });
                } else if opcode == OP["NUMEQUAL"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    self.stack.push(if script_num1.num == script_num2.num {
                        vec![1]
                    } else {
                        vec![0]
                    });
                } else if opcode == OP["NUMEQUALVERIFY"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    if script_num1.num != script_num2.num {
                        self.err_str = "NUMEQUALVERIFY failed".to_string();
                        break;
                    }
                } else if opcode == OP["NUMNOTEQUAL"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    self.stack.push(if script_num1.num != script_num2.num {
                        vec![1]
                    } else {
                        vec![0]
                    });
                } else if opcode == OP["LESSTHAN"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    self.stack.push(if script_num2.num < script_num1.num {
                        vec![1]
                    } else {
                        vec![0]
                    });
                } else if opcode == OP["GREATERTHAN"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    self.stack.push(if script_num2.num > script_num1.num {
                        vec![1]
                    } else {
                        vec![0]
                    });
                } else if opcode == OP["LESSTHANOREQUAL"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    self.stack.push(if script_num2.num <= script_num1.num {
                        vec![1]
                    } else {
                        vec![0]
                    });
                } else if opcode == OP["GREATERTHANOREQUAL"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    self.stack.push(if script_num2.num >= script_num1.num {
                        vec![1]
                    } else {
                        vec![0]
                    });
                } else if opcode == OP["MIN"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    self.stack.push(if script_num2.num < script_num1.num {
                        script_num2.to_u8_vec()
                    } else {
                        script_num1.to_u8_vec()
                    });
                } else if opcode == OP["MAX"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_num1 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let script_num2 = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    self.stack.push(if script_num2.num > script_num1.num {
                        script_num2.to_u8_vec()
                    } else {
                        script_num1.to_u8_vec()
                    });
                } else if opcode == OP["WITHIN"] {
                    // (x min max -- out)
                    if self.stack.len() < 3 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let script_max = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let script_min = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let script_x = ScriptNum::from_u8_vec(&self.stack.pop().unwrap());
                    let min = script_min.num;
                    let max = script_max.num;
                    let x = script_x.num;
                    self.stack.push(if x >= min && x < max {
                        vec![1]
                    } else {
                        vec![0]
                    });
                } else if opcode == OP["BLAKE3"] {
                    if self.stack.len() < 1 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf = self.stack.pop().unwrap();
                    let hash = blake3_hash(&buf);
                    self.stack.push(hash.to_vec());
                } else if opcode == OP["DOUBLEBLAKE3"] {
                    if self.stack.len() < 1 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let buf = self.stack.pop().unwrap();
                    let hash = double_blake3_hash(&buf);
                    self.stack.push(hash.to_vec());
                } else if opcode == OP["CHECKSIG"] || opcode == OP["CHECKSIGVERIFY"] {
                    if self.stack.len() < 2 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let pub_key_buf = self.stack.pop().unwrap();
                    if pub_key_buf.len() != 33 {
                        self.err_str = "invalid public key length".to_string();
                        break;
                    }
                    let sig_buf = self.stack.pop().unwrap();
                    if sig_buf.len() != 65 {
                        self.err_str = "invalid signature length".to_string();
                        break;
                    }
                    let signature = TxSignature::from_u8_vec(&sig_buf);

                    let exec_script_buf = self.script.to_u8_vec();

                    let pub_key_arr: [u8; 33] =
                        pub_key_buf.try_into().unwrap_or_else(|v: Vec<u8>| {
                            panic!("Expected a Vec of length {} but it was {}", 33, v.len())
                        });

                    let success = self.tx.verify(
                        self.n_in,
                        pub_key_arr,
                        signature,
                        exec_script_buf,
                        self.value,
                    );

                    self.stack.push(vec![if success { 1 } else { 0 }]);
                    if opcode == OP["CHECKSIGVERIFY"] && !success {
                        self.err_str = "CHECKSIGVERIFY failed".to_string();
                        break;
                    }
                } else if opcode == OP["CHECKMULTISIG"] || opcode == OP["CHECKMULTISIGVERIFY"] {
                    if self.stack.len() < 1 {
                        self.err_str = "invalid stack operation".to_string();
                        break;
                    }
                    let n_keys = ScriptNum::from_u8_vec(&self.stack.pop().unwrap()).num;
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
                        if pub_key_buf.len() != 33 {
                            self.err_str = "invalid public key length".to_string();
                            break;
                        }
                        pub_keys.push(pub_key_buf);
                    }
                    let n_sigs = ScriptNum::from_u8_vec(&self.stack.pop().unwrap()).num;
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
                        if sig_buf.len() != 65 {
                            self.err_str = "invalid signature length".to_string();
                            break;
                        }
                        sigs.push(sig_buf);
                    }
                    let exec_script_buf = self.script.to_u8_vec();

                    let mut matched_sigs = 0;
                    for i in 0..n_sigs.to_usize().unwrap() {
                        for j in 0..pub_keys.len() {
                            let success = self.tx.verify(
                                self.n_in,
                                pub_keys[j][..33].try_into().unwrap(),
                                TxSignature::from_u8_vec(&sigs[i].clone()),
                                exec_script_buf.clone(),
                                self.value,
                            );
                            if success {
                                matched_sigs += 1;
                                pub_keys.remove(j); // Remove the matched public key
                                break;
                            }
                        }
                    }
                    let success = matched_sigs == n_sigs.to_usize().unwrap();

                    self.stack.push(vec![if success { 1 } else { 0 }]);
                    if opcode == OP["CHECKMULTISIGVERIFY"] && !success {
                        self.err_str = "CHECKMULTISIGVERIFY failed".to_string();
                        break;
                    }
                } else {
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
                &self.return_value.as_ref().unwrap(),
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
    use crate::key::Key;
    use crate::address::Address;
    use crate::tx_input::TxInput;
    use crate::tx_output::TxOutput;
    use hex;

    mod sanity_tests {
        use super::*;

        #[test]
        fn test_zero() {
            let tx = Tx::new(0, Vec::new(), Vec::new(), 0);
            let script = Script::from_string("0").unwrap();
            let mut script_interpreter = ScriptInterpreter::from_script_tx(script, tx, 0);
            script_interpreter.eval_script();
            assert_eq!(script_interpreter.return_success, Some(false));
            assert_eq!(hex::encode(&script_interpreter.return_value.unwrap()), "00");
        }

        #[test]
        fn test_pushdata1() {
            let tx = Tx::new(0, Vec::new(), Vec::new(), 0);
            let script = Script::from_string("0xff").unwrap();
            let mut script_interpreter = ScriptInterpreter::from_script_tx(script, tx, 0);
            script_interpreter.eval_script();
            assert_eq!(script_interpreter.return_success, Some(true));
            assert!(script_interpreter.return_value.is_some());
            assert_eq!(hex::encode(&script_interpreter.return_value.unwrap()), "ff");
        }

        #[test]
        fn test_pushdata2() {
            let tx = Tx::new(0, Vec::new(), Vec::new(), 0);
            let script = Script::from_string(&("0x".to_owned() + &"ff".repeat(256))).unwrap();
            let mut script_interpreter = ScriptInterpreter::from_script_tx(script, tx, 0);
            script_interpreter.eval_script();
            assert_eq!(script_interpreter.return_success, Some(true));
            assert!(script_interpreter.return_value.is_some());
            assert_eq!(
                hex::encode(&script_interpreter.return_value.unwrap()),
                "ff".repeat(256)
            );
        }

        #[test]
        fn test_pushdata4() {
            let tx = Tx::new(0, Vec::new(), Vec::new(), 0);
            let script = Script::from_string(&("0x".to_owned() + &"ff".repeat(65536))).unwrap();
            let mut script_interpreter = ScriptInterpreter::from_script_tx(script, tx, 0);
            script_interpreter.eval_script();
            assert_eq!(script_interpreter.return_success, Some(true));
            assert!(script_interpreter.return_value.is_some());
            assert_eq!(
                hex::encode(&script_interpreter.return_value.unwrap()),
                "ff".repeat(65536)
            );
        }

        #[test]
        fn test_1negate() {
            let tx = Tx::new(0, Vec::new(), Vec::new(), 0);
            let script = Script::from_string("1NEGATE").unwrap();
            let mut script_interpreter = ScriptInterpreter::from_script_tx(script, tx, 0);
            script_interpreter.eval_script();
            assert_eq!(script_interpreter.return_success, Some(true));
            assert!(script_interpreter.return_value.is_some());
            assert_eq!(hex::encode(&script_interpreter.return_value.unwrap()), "ff");
        }

        #[test]
        fn checksig() {
            let output_priv_key_hex =
                "d9486fac4a1de03ca8c562291182e58f2f3e42a82eaf3152ccf744b3a8b3b725";
            let output_priv_key_buf = hex::decode(output_priv_key_hex).unwrap();
            let output_key = Key::new(output_priv_key_buf.clone());
            let output_pub_key = output_key.public_key();
            assert_eq!(
                hex::encode(&output_pub_key),
                "0377b8ba0a276329096d51275a8ab13809b4cd7af856c084d60784ed8e4133d987"
            );
            let output_address = Address::new(output_pub_key.to_vec());
            let output_script =
                Script::from_address_output(output_address.address());
            let output_amount = 100;
            let output_tx_id = vec![0; 32];
            let output_tx_index = 0;

            let mut tx = Tx::new(
                1,
                vec![TxInput::new(
                    output_tx_id.clone(),
                    output_tx_index,
                    Script::from_string("").unwrap(),
                    0xffffffff,
                )],
                vec![TxOutput::new(output_amount, output_script.clone())],
                0,
            );

            let output_priv_key_arr: [u8; 32] =
                output_priv_key_buf.try_into().unwrap_or_else(|v: Vec<u8>| {
                    panic!("Expected a Vec of length {} but it was {}", 32, v.len())
                });

            let sig = tx.sign(
                0,
                output_priv_key_arr,
                output_script.to_u8_vec(),
                output_amount,
                TxSignature::SIGHASH_ALL,
            );

            let stack = vec![sig.to_u8_vec(), output_pub_key.to_vec()];

            let mut script_interpreter = ScriptInterpreter::from_output_script_tx(
                output_script,
                tx,
                0,
                stack,
                output_amount,
            );

            let result = script_interpreter.eval_script();
            assert!(result);
        }

        #[test]
        fn checkmultisig() {
            // Define private keys
            let priv_keys_hex = vec![
                "eee66a051d43a62b00da7185bbf2a13b42f601a0b987a8f1815b4213c9343451",
                "f8749a7b6a825eb9e82e27720fd3b90e0f157adc75fe3e0efbf3c8a335eb3ef5",
                "5df05870846dd200a7d29da98ad32016209d99af0422d66e568f97720d1acee3",
                "c91b042751b94d705abee4fc67eb483dc32ae432e037f66120f5e865e4257c66",
                "b78467b0ea6afa6c42c94333dcece978829bdb7ba7b97a2273b72cdc6be8c553",
            ];

            // Convert private keys to Vec<u8> format
            let priv_keys_u8_vec: Vec<Vec<u8>> = priv_keys_hex
                .iter()
                .map(|hex| hex::decode(hex).unwrap())
                .collect();

            // Generate public keys
            let pub_keys: Vec<Vec<u8>> = priv_keys_u8_vec
                .iter()
                .map(|priv_key| Key::new(priv_key.clone()).public_key().clone())
                .collect();

            // Create a multisig output script
            let output_script = Script::from_multi_sig_output(3, pub_keys);

            // Other tx parameters
            let output_amount = 100;
            let output_tx_id = vec![0; 32];
            let output_tx_index = 0;

            // Create a tx
            let mut tx = Tx::new(
                1,
                vec![TxInput::new(
                    output_tx_id.clone(),
                    output_tx_index,
                    Script::from_string("").unwrap(),
                    0xffffffff,
                )],
                vec![TxOutput::new(output_amount, output_script.clone())],
                0,
            );

            // Sign the tx with the first 3 private keys
            let sigs: Vec<Vec<u8>> = priv_keys_u8_vec[0..3]
                .iter()
                .map(|priv_key| {
                    tx.sign(
                        0,
                        priv_key[..32].try_into().unwrap(),
                        output_script.to_u8_vec(),
                        output_amount,
                        TxSignature::SIGHASH_ALL,
                    )
                    .to_u8_vec()
                })
                .collect();

            // Create a stack with the signatures
            let stack = sigs.clone();

            // Create a script interpreter
            let mut script_interpreter = ScriptInterpreter::from_output_script_tx(
                output_script,
                tx,
                0,
                stack,
                output_amount,
            );

            // Evaluate the script
            let result = script_interpreter.eval_script();
            assert_eq!(script_interpreter.err_str, "");
            assert_eq!(result, true);
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
            let file = fs::read_to_string("../../json/script_interpreter.json")
                .expect("Failed to read JSON file");
            let test_scripts: TestScripts =
                serde_json::from_str(&file).expect("Failed to parse JSON file");

            for test_script in test_scripts.scripts {
                println!("Running test: {}", test_script.name);
                // to confirm tests are running:
                // cargo test script_interpreter -- --nocapture

                let script = Script::from_string(&test_script.script).unwrap();
                let tx = Tx::new(
                    1,
                    vec![TxInput::new(
                        vec![],
                        0,
                        Script::from_string("").unwrap(),
                        0xffffffff,
                    )],
                    vec![TxOutput::new(0 as u64, Script::from_string("").unwrap())],
                    0 as u64,
                );
                let mut script_interpreter = ScriptInterpreter::from_script_tx(script, tx, 0);
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
