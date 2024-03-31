use crate::opcode::NAME_TO_OPCODE;
use crate::script::Script;
use crate::script_num::ScriptNum;
use crate::transaction::Transaction;
use num_bigint::ToBigInt;

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
            let if_exec = !self.if_stack.contains(&false);

            if if_exec
                || (opcode == NAME_TO_OPCODE["IF"]
                    || opcode == NAME_TO_OPCODE["NOTIF"]
                    || opcode == NAME_TO_OPCODE["ELSE"]
                    || opcode == NAME_TO_OPCODE["ENDIF"])
            {
                if opcode == NAME_TO_OPCODE["IF"] {
                    let mut if_value = false;
                    if if_exec {
                        if self.stack.len() < 1 {
                            self.err_str = "unbalanced conditional".to_string();
                            if !self.stack.is_empty() {
                                self.return_value = Some(self.stack[self.stack.len() - 1].clone());
                            } else {
                                self.return_value = Some(vec![]);
                            }
                            self.return_success = Some(false);
                            return false;
                        }
                        let buf = self.stack.pop().unwrap();
                        if_value = ScriptInterpreter::cast_to_bool(&buf);
                    }
                    self.if_stack.push(if_value);
                } else if opcode == NAME_TO_OPCODE["NOTIF"] {
                    let mut if_value = false;
                    if if_exec {
                        if self.stack.len() < 1 {
                            self.err_str = "unbalanced conditional".to_string();
                            if !self.stack.is_empty() {
                                self.return_value = Some(self.stack[self.stack.len() - 1].clone());
                            } else {
                                self.return_value = Some(vec![]);
                            }
                            self.return_success = Some(false);
                            return false;
                        }
                        let buf = self.stack.pop().unwrap();
                        if_value = !ScriptInterpreter::cast_to_bool(&buf);
                    }
                    self.if_stack.push(if_value);
                } else if opcode == NAME_TO_OPCODE["ELSE"] {
                    if self.if_stack.is_empty() {
                        self.err_str = "unbalanced conditional".to_string();
                        if !self.stack.is_empty() {
                            self.return_value = Some(self.stack[self.stack.len() - 1].clone());
                        } else {
                            self.return_value = Some(vec![]);
                        }
                        self.return_success = Some(false);
                        return false;
                    }
                    let if_stack_len = self.if_stack.len();
                    self.if_stack[if_stack_len - 1] = !self.if_stack[self.if_stack.len() - 1];
                } else if opcode == NAME_TO_OPCODE["ENDIF"] {
                    if self.if_stack.is_empty() {
                        self.err_str = "unbalanced conditional".to_string();
                        if !self.stack.is_empty() {
                            self.return_value = Some(self.stack[self.stack.len() - 1].clone());
                        } else {
                            self.return_value = Some(vec![]);
                        }
                        self.return_success = Some(false);
                        return false;
                    }
                    self.if_stack.pop();
                } else if opcode == NAME_TO_OPCODE["0"] {
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
                } else if opcode == NAME_TO_OPCODE["1"] {
                    let script_num = ScriptNum::new(1.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == NAME_TO_OPCODE["2"] {
                    let script_num = ScriptNum::new(2.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == NAME_TO_OPCODE["3"] {
                    let script_num = ScriptNum::new(3.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == NAME_TO_OPCODE["4"] {
                    let script_num = ScriptNum::new(4.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == NAME_TO_OPCODE["5"] {
                    let script_num = ScriptNum::new(5.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == NAME_TO_OPCODE["6"] {
                    let script_num = ScriptNum::new(6.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == NAME_TO_OPCODE["7"] {
                    let script_num = ScriptNum::new(7.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == NAME_TO_OPCODE["8"] {
                    let script_num = ScriptNum::new(8.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == NAME_TO_OPCODE["9"] {
                    let script_num = ScriptNum::new(9.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == NAME_TO_OPCODE["10"] {
                    let script_num = ScriptNum::new(10.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == NAME_TO_OPCODE["11"] {
                    let script_num = ScriptNum::new(11.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == NAME_TO_OPCODE["12"] {
                    let script_num = ScriptNum::new(12.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == NAME_TO_OPCODE["13"] {
                    let script_num = ScriptNum::new(13.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == NAME_TO_OPCODE["14"] {
                    let script_num = ScriptNum::new(14.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == NAME_TO_OPCODE["15"] {
                    let script_num = ScriptNum::new(15.into());
                    self.stack.push(script_num.to_u8_vec());
                } else if opcode == NAME_TO_OPCODE["16"] {
                    let script_num = ScriptNum::new(16.into());
                    self.stack.push(script_num.to_u8_vec());
                } else {
                    self.err_str = "invalid opcode".to_string();
                }
            }

            if !self.err_str.is_empty() {
                self.return_value = Some(self.stack[self.stack.len() - 1].clone());
                self.return_success = Some(false);
                return self.return_success.unwrap();
            }
            self.pc += 1;
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
    use crate::transaction_input::TransactionInput;
    use crate::transaction_output::TransactionOutput;
    use hex;

    mod sanity_tests {
        use super::*;

        #[test]
        fn test_zero() {
            let transaction = Transaction::new(0, Vec::new(), Vec::new(), 0);
            let script = Script::from_string_new("0").unwrap();
            let mut script_interpreter = ScriptInterpreter::from_script(script, transaction);
            script_interpreter.eval_script();
            assert_eq!(script_interpreter.return_success, Some(false));
            assert_eq!(hex::encode(&script_interpreter.return_value.unwrap()), "00");
        }

        #[test]
        fn test_pushdata1() {
            let transaction = Transaction::new(0, Vec::new(), Vec::new(), 0);
            let script = Script::from_string_new("0xff").unwrap();
            let mut script_interpreter = ScriptInterpreter::from_script(script, transaction);
            script_interpreter.eval_script();
            assert_eq!(script_interpreter.return_success, Some(true));
            assert!(script_interpreter.return_value.is_some());
            assert_eq!(hex::encode(&script_interpreter.return_value.unwrap()), "ff");
        }

        #[test]
        fn test_pushdata2() {
            let transaction = Transaction::new(0, Vec::new(), Vec::new(), 0);
            let script = Script::from_string_new(&("0x".to_owned() + &"ff".repeat(256))).unwrap();
            let mut script_interpreter = ScriptInterpreter::from_script(script, transaction);
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
            let transaction = Transaction::new(0, Vec::new(), Vec::new(), 0);
            let script = Script::from_string_new(&("0x".to_owned() + &"ff".repeat(65536))).unwrap();
            let mut script_interpreter = ScriptInterpreter::from_script(script, transaction);
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
            let transaction = Transaction::new(0, Vec::new(), Vec::new(), 0);
            let script = Script::from_string_new("1NEGATE").unwrap();
            let mut script_interpreter = ScriptInterpreter::from_script(script, transaction);
            script_interpreter.eval_script();
            assert_eq!(script_interpreter.return_success, Some(true));
            assert!(script_interpreter.return_value.is_some());
            assert_eq!(hex::encode(&script_interpreter.return_value.unwrap()), "ff");
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

                let script = Script::from_string_new(&test_script.script).unwrap();
                let transaction = Transaction::new(
                    1,
                    vec![TransactionInput::new(
                        vec![],
                        0,
                        Script::from_string_new("").unwrap(),
                        0xffffffff,
                    )],
                    vec![TransactionOutput::new(
                        0 as u64,
                        Script::from_string_new("").unwrap(),
                    )],
                    0 as u64,
                );
                let mut script_interpreter = ScriptInterpreter::from_script(script, transaction);
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
