use earthbucks_lib::opcode::*;
use earthbucks_lib::script_chunk::*;

#[test]
fn test_new() {
    let opcode = 1;
    let buffer = Some(vec![2, 3, 4]);
    let chunk = ScriptChunk::new(opcode, buffer.clone());

    assert_eq!(chunk.opcode, opcode);
    assert_eq!(chunk.buffer, buffer);
}

#[test]
fn test_to_string_if() {
    let chunk = ScriptChunk::new(Opcode::OP_IF, None);
    assert_eq!(chunk.to_iso_str().unwrap(), "IF");
}

#[test]
fn test_to_string_pushdata1() {
    let chunk = ScriptChunk::new(Opcode::OP_PUSHDATA1, Some(vec![1, 2, 3]));
    assert_eq!(chunk.to_iso_str().unwrap(), "0x010203");
}

#[test]
fn test_to_string_pushdata2() {
    let chunk = ScriptChunk::new(Opcode::OP_PUSHDATA2, Some(vec![4, 5, 6]));
    assert_eq!(chunk.to_iso_str().unwrap(), "0x040506");
}

#[test]
fn test_to_string_pushdata4() {
    let chunk = ScriptChunk::new(Opcode::OP_PUSHDATA4, Some(vec![7, 8, 9]));
    assert_eq!(chunk.to_iso_str().unwrap(), "0x070809");
}

#[test]
fn test_from_iso_str_if() {
    let chunk = ScriptChunk::from_iso_str("IF".to_string()).unwrap();
    assert_eq!(chunk.opcode, Opcode::OP_IF);
    assert_eq!(chunk.buffer, None);
}

#[test]
fn test_from_iso_str_pushdata1() {
    let chunk = ScriptChunk::from_iso_str("0x010203".to_string()).unwrap();
    assert_eq!(chunk.opcode, Opcode::OP_PUSHDATA1);
    assert_eq!(chunk.buffer, Some(vec![1, 2, 3]));
}

#[test]
fn test_from_iso_str_pushdata2() {
    let chunk = ScriptChunk::from_iso_str("0x".to_string() + &"01".repeat(256)).unwrap();
    assert_eq!(chunk.opcode, Opcode::OP_PUSHDATA2);
    assert_eq!(chunk.buffer, Some(vec![1; 256]));
}

#[test]
fn test_from_iso_str_pushdata4() {
    let chunk = ScriptChunk::from_iso_str("0x".to_string() + &"01".repeat(70000)).unwrap();
    assert_eq!(chunk.opcode, Opcode::OP_PUSHDATA4);
    assert_eq!(chunk.buffer, Some(vec![1; 70000]));
}

#[test]
fn test_from_iso_str_new() {
    let chunk = ScriptChunk::from_iso_str("0x010203".to_string()).unwrap();
    assert_eq!(chunk.opcode, Opcode::OP_PUSHDATA1);
    assert_eq!(chunk.buffer, Some(vec![1, 2, 3]));
}

#[test]
fn test_to_iso_buf_if() {
    let chunk = ScriptChunk::new(Opcode::OP_IF, None);
    assert_eq!(chunk.to_iso_buf(), vec![Opcode::OP_IF]);
}

#[test]
fn test_to_iso_buf_pushdata1() {
    let chunk = ScriptChunk::new(Opcode::OP_PUSHDATA1, Some(vec![1, 2, 3]));
    assert_eq!(chunk.to_iso_buf(), vec![Opcode::OP_PUSHDATA1, 3, 1, 2, 3]);
}

#[test]
fn test_to_iso_buf_pushdata2() {
    let chunk = ScriptChunk::new(Opcode::OP_PUSHDATA2, Some(vec![1; 256]));
    let mut expected = vec![Opcode::OP_PUSHDATA2, 1, 0];
    expected.extend(vec![1; 256]);
    assert_eq!(chunk.to_iso_buf(), expected);
}

#[test]
fn test_to_iso_buf_pushdata4() {
    let chunk = ScriptChunk::new(Opcode::OP_PUSHDATA4, Some(vec![1; 65536]));
    let mut expected = vec![Opcode::OP_PUSHDATA4, 0, 1, 0, 0];
    expected.extend(vec![1; 65536]);
    assert_eq!(chunk.to_iso_buf(), expected);
}

#[test]
fn test_from_iso_buf_if() {
    let arr = vec![Opcode::OP_IF];
    let chunk = ScriptChunk::from_iso_buf(arr).unwrap();
    assert_eq!(chunk.opcode, Opcode::OP_IF);
    assert_eq!(chunk.buffer, None);
}

#[test]
fn test_from_iso_buf_pushdata1() {
    let mut arr = vec![Opcode::OP_PUSHDATA1, 2];
    arr.extend(vec![1, 2]);
    let chunk = ScriptChunk::from_iso_buf(arr).unwrap();
    assert_eq!(chunk.opcode, Opcode::OP_PUSHDATA1);
    assert_eq!(chunk.buffer, Some(vec![1, 2]));
}

#[test]
fn test_from_iso_buf_pushdata2() {
    let mut arr = vec![Opcode::OP_PUSHDATA2, 0x01, 0x00];
    arr.extend(vec![0; 256]);
    let chunk = ScriptChunk::from_iso_buf(arr).unwrap();
    assert_eq!(chunk.opcode, Opcode::OP_PUSHDATA2);
    assert_eq!(chunk.buffer, Some(vec![0; 256]));
}

#[test]
fn test_from_iso_buf_pushdata4() {
    let mut arr = vec![Opcode::OP_PUSHDATA4, 0, 0x01, 0, 0];
    arr.extend(vec![0; 0x010000]);
    let chunk = ScriptChunk::from_iso_buf(arr).unwrap();
    assert_eq!(chunk.opcode, Opcode::OP_PUSHDATA4);
    assert_eq!(chunk.buffer, Some(vec![0; 0x010000]));
}

#[test]
fn test_from_iso_buf_new_pushdata1() {
    let mut arr = vec![Opcode::OP_PUSHDATA1, 2];
    arr.extend(vec![1, 2]);
    let chunk = ScriptChunk::from_iso_buf(arr).unwrap();
    assert_eq!(chunk.opcode, Opcode::OP_PUSHDATA1);
    assert_eq!(chunk.buffer, Some(vec![1, 2]));
}

#[test]
fn test_from_data() {
    let data = vec![1, 2, 3];
    let chunk = ScriptChunk::from_data(data.clone());
    assert_eq!(chunk.opcode, Opcode::OP_PUSHDATA1);
    assert_eq!(chunk.buffer, Some(data));
}

#[test]
fn test_from_data_pushdata2() {
    let data = vec![1; 256];
    let chunk = ScriptChunk::from_data(data.clone());
    assert_eq!(chunk.opcode, Opcode::OP_PUSHDATA2);
    assert_eq!(chunk.buffer, Some(data));
}

#[test]
fn test_from_data_pushdata4() {
    let data = vec![1; 65536];
    let chunk = ScriptChunk::from_data(data.clone());
    assert_eq!(chunk.opcode, Opcode::OP_PUSHDATA4);
    assert_eq!(chunk.buffer, Some(data));
}

#[test]
fn test_from_iso_buf_pushdata1_error() {
    let arr = vec![Opcode::OP_PUSHDATA1, 2];
    let result = ScriptChunk::from_iso_buf(arr);
    assert!(
        result.is_err(),
        "Expected an error for insufficient buffer length in PUSHDATA1 case"
    );
    match result {
        Err(e) => assert_eq!(e.to_string(), "not enough bytes in the buffer to read"),
        _ => panic!("Expected an error for insufficient buffer length in PUSHDATA1 case"),
    }
}

#[test]
fn test_from_iso_buf_pushdata2_error() {
    let arr = vec![Opcode::OP_PUSHDATA2, 0, 2];
    let result = ScriptChunk::from_iso_buf(arr);
    assert!(
        result.is_err(),
        "Expected an error for insufficient buffer length in PUSHDATA2 case"
    );
    match result {
        Err(e) => assert_eq!(e.to_string(), "non-minimal encoding"),
        _ => panic!("Expected an error for insufficient buffer length in PUSHDATA2 case"),
    }
}

#[test]
fn test_from_iso_buf_pushdata4_error() {
    let arr = vec![Opcode::OP_PUSHDATA4, 0, 0, 0, 2];
    let result = ScriptChunk::from_iso_buf(arr);
    assert!(
        result.is_err(),
        "Expected an error for insufficient buffer length in PUSHDATA4 case"
    );
    match result {
        Err(e) => assert_eq!(e.to_string(), "non-minimal encoding"),
        _ => panic!("Expected an error for insufficient buffer length in PUSHDATA4 case"),
    }
}
