use earthbucks_lib::opcode::*;

#[test]
fn test_maps() {
    for (name, opcode) in OP.iter() {
        assert_eq!(Some(*name), OPCODE_TO_NAME.get(opcode).cloned());
    }

    for (opcode, name) in OPCODE_TO_NAME.iter() {
        assert_eq!(Some(opcode), OP.get(*name));
    }
}
