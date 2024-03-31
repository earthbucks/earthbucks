use num_bigint::ToBigInt;

use crate::opcode::NAME_TO_OPCODE;
use crate::script::Script;
use crate::script_num::ScriptNum;
use crate::transaction::Transaction;

pub struct ScriptInterpreter {
    pub script: Script,
    pub transaction: Transaction,
    pub stack: Vec<Vec<u8>>,
    pub alt_stack: Vec<Vec<u8>>,
    pub pc: usize,
    pub p_begin_code_hash: usize,
    pub n_op_count: usize,
    pub if_stack: Vec<bool>,
    pub return_value: Option<Vec<u8>>,
    pub return_success: Option<bool>,
    pub err_str: String,
    pub value: i64,
}

impl ScriptInterpreter {
    pub fn new(
        script: Script,
        transaction: Transaction,
        stack: Vec<Vec<u8>>,
        alt_stack: Vec<Vec<u8>>,
        pc: usize,
        p_begin_code_hash: usize,
        n_op_count: usize,
        if_stack: Vec<bool>,
        return_value: Option<Vec<u8>>,
        return_success: Option<bool>,
        err_str: String,
        value: i64,
    ) -> Self {
        Self {
            script,
            transaction,
            stack,
            alt_stack,
            pc,
            p_begin_code_hash,
            n_op_count,
            if_stack,
            return_value,
            return_success,
            err_str,
            value,
        }
    }

    pub fn from_script(script: Script, transaction: Transaction) -> Self {
        Self::new(
            script,
            transaction,
            Vec::new(),
            Vec::new(),
            0,
            0,
            0,
            Vec::new(),
            None,
            None,
            String::new(),
            0,
        )
    }

    pub fn cast_to_bool(buf: &Vec<u8>) -> bool {
        !buf.iter().all(|&x| x == 0)
    }

    pub fn eval_script(&mut self) -> bool {
        while self.pc < self.script.chunks.len() {
            let chunk = &self.script.chunks[self.pc];
            let opcode = chunk.opcode;

            if opcode == NAME_TO_OPCODE["0"] {
                self.stack.push(vec![0]);
            } else if opcode == NAME_TO_OPCODE["PUSHDATA1"]
                || opcode == NAME_TO_OPCODE["PUSHDATA2"]
                || opcode == NAME_TO_OPCODE["PUSHDATA4"]
            {
                if let Some(buffer) = &chunk.buffer {
                    self.stack.push(buffer.clone());
                } else {
                    self.err_str = "invalid pushdata".to_string();
                }
            } else if opcode == NAME_TO_OPCODE["1NEGATE"] {
                let script_num = ScriptNum::new(-1.to_bigint().unwrap());
                self.stack.push(script_num.to_u8_vec());
            }

            self.pc += 1;
            if !self.err_str.is_empty() {
                self.return_value = Some(self.stack[self.stack.len() - 1].clone());
                self.return_success = Some(false);
                return self.return_success.unwrap();
            }
        }
        self.return_value = Some(self.stack[self.stack.len() - 1].clone());
        self.return_success = Some(ScriptInterpreter::cast_to_bool(
            &self.return_value.as_ref().unwrap(),
        ));
        self.return_success.unwrap()
    }
}
