
use earthbucks_lib::opcode::*;
use earthbucks_lib::script::*;
use earthbucks_lib::script_chunk::ScriptChunk;
use serde::Deserialize;

#[test]
fn test_new() {
    let chunks = vec![ScriptChunk::new(1, Some(vec![0x01, 0x02, 0x03]))];
    let script = Script::new(chunks.clone());
    assert_eq!(script.chunks, chunks);
}

#[test]
fn test_from_iso_str() {
    let s = "DUP BLAKE3 DOUBLEBLAKE3";
    let script = Script::from_iso_str(s).unwrap();
    let expected_chunks = vec![
        ScriptChunk::from_iso_str("DUP".to_string()).unwrap(),
        ScriptChunk::from_iso_str("BLAKE3".to_string()).unwrap(),
        ScriptChunk::from_iso_str("DOUBLEBLAKE3".to_string()).unwrap(),
    ];
    assert_eq!(script.chunks, expected_chunks);
}

#[test]
fn test_to_string() {
    let chunks = vec![
        ScriptChunk::from_iso_str("DUP".to_string()).unwrap(),
        ScriptChunk::from_iso_str("BLAKE3".to_string()).unwrap(),
        ScriptChunk::from_iso_str("DOUBLEBLAKE3".to_string()).unwrap(),
    ];
    let script = Script::new(chunks);
    let expected_string = "DUP BLAKE3 DOUBLEBLAKE3"; // Replace with the expected string representation of your chunks
    assert_eq!(script.to_iso_str().unwrap(), expected_string);
}

#[test]
fn test_to_iso_buf() {
    let chunks = vec![
        ScriptChunk::from_iso_str("0xffff".to_string()).unwrap(),
        ScriptChunk::from_iso_str("BLAKE3".to_string()).unwrap(),
        ScriptChunk::from_iso_str("DOUBLEBLAKE3".to_string()).unwrap(),
    ];
    let script = Script::new(chunks);
    let expected_vec = vec![76, 0x02, 0xff, 0xff, 166, 167];
    assert_eq!(script.to_iso_buf(), expected_vec);
}

#[test]
fn test_from_iso_buf() {
    let arr = vec![76, 0x02, 0xff, 0xff, 166, 167];
    let script = Script::from_iso_buf(&arr);
    let expected_chunks = vec![
        ScriptChunk::from_iso_str("0xffff".to_string()).unwrap(),
        ScriptChunk::from_iso_str("BLAKE3".to_string()).unwrap(),
        ScriptChunk::from_iso_str("DOUBLEBLAKE3".to_string()).unwrap(),
    ];
    assert_eq!(script.unwrap().chunks, expected_chunks);
}

#[test]
fn test_from_iso_buf_2() {
    let input_string = "0xffff 0xffff";
    let expected_output_string = "0xffff 0xffff";

    // Convert the input string to a Script
    let script = Script::from_iso_str(input_string).unwrap();

    // Convert the Script to a u8 vector
    let iso_buf = script.to_iso_buf();

    let script2 = Script::from_iso_buf(&iso_buf).unwrap();

    // Convert the Script back to a string
    let output_string = script2.to_iso_str().unwrap();

    // Check that the output string is the same as the input string
    assert_eq!(output_string, expected_output_string);
}

#[test]
fn test_from_iso_buf_new() {
    let arr = vec![76, 0x02, 0xff, 0xff, 166, 167];
    let script = Script::from_iso_buf(arr.as_slice());
    let expected_chunks = vec![
        ScriptChunk::from_iso_str("0xffff".to_string()).unwrap(),
        ScriptChunk::from_iso_str("BLAKE3".to_string()).unwrap(),
        ScriptChunk::from_iso_str("DOUBLEBLAKE3".to_string()).unwrap(),
    ];
    let new_script = Script::new(expected_chunks);
    let new_string = new_script.to_iso_str().unwrap();
    assert_eq!(script.unwrap().to_iso_str().unwrap(), new_string);
}

#[test]
fn test_is_pkh_output() {
    let mut script = Script::from_empty();
    script.chunks = vec![
        ScriptChunk::new(Opcode::OP_DUP, None),
        ScriptChunk::new(Opcode::OP_DOUBLEBLAKE3, None),
        ScriptChunk::new(Opcode::OP_PUSHDATA1, Some(vec![0; 32])),
        ScriptChunk::new(Opcode::OP_EQUALVERIFY, None),
        ScriptChunk::new(Opcode::OP_CHECKSIG, None),
    ];

    assert!(script.is_pkh_output());

    // Change a chunk to make the script invalid
    script.chunks[0].opcode = Opcode::OP_BLAKE3;
    assert!(!script.is_pkh_output());
}

// standard test vectors

#[derive(Deserialize)]
struct TestVectorScript {
    from_iso_buf: TestVectorErrors,
}

#[derive(Deserialize)]
struct TestVectorErrors {
    errors: Vec<TestVectorError>,
}

#[derive(Deserialize)]
struct TestVectorError {
    hex: String,
    error: String,
}

#[test]
fn test_vectors_from_iso_buf() {
    let file = std::fs::File::open("./test_vectors/script.json").unwrap();
    let test_vectors: TestVectorScript = serde_json::from_reader(file).unwrap();

    for test_vector in test_vectors.from_iso_buf.errors {
        let arr = hex::decode(test_vector.hex).unwrap();
        let result = Script::from_iso_buf(&arr);
        match result {
            Ok(_) => panic!("Expected an error, but got Ok(_)"),
            Err(e) => assert!(e.to_string().starts_with(&test_vector.error)),
        }
    }
}
