
use earthbucks_lib::pkh::*;
use earthbucks_lib::script::*;
use earthbucks_lib::script_interpreter::*;
use earthbucks_lib::tx::*;
use earthbucks_lib::tx_in::TxIn;
use earthbucks_lib::tx_out::TxOut;
use earthbucks_lib::tx_signature::*;

mod sanity_tests {
    use super::*;
    use earthbucks_lib::{priv_key::PrivKey, pub_key::PubKey};

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
            hex::encode(output_pub_key),
            "0377b8ba0a276329096d51275a8ab13809b4cd7af856c084d60784ed8e4133d987"
        );
        let output_pkh = Pkh::from_pub_key_buffer(output_pub_key.to_vec());
        let output_script = Script::from_pkh_output(output_pkh.to_iso_buf());
        let output_amount = 100;
        let output_tx_id = vec![0; 32];
        let output_tx_index = 0;

        let mut tx = Tx::new(
            1,
            vec![TxIn::new(
                output_tx_id.clone(),
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
            .map(|hex| hex::decode(hex).unwrap())
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
        let output_tx_id = vec![0; 32];
        let output_tx_index = 0;

        // Create a tx
        let mut tx = Tx::new(
            1,
            vec![TxIn::new(
                output_tx_id.clone(),
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
                vec![TxIn::new(vec![], 0, Script::from_empty(), 0xffffffff)],
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
