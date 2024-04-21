import { describe, expect, test, beforeEach, it } from "@jest/globals";
import Matmul from "../src/matmul";

// #[cfg(test)]
// mod tests {
//     use super::*;

//     #[test]
//     fn test_matmul_32() {
//         let source = [0u8; 32];
//         let matmul = Matmul { source };
//         let res_buf = matmul.matmul_32_buf();
//         let res_hex = hex::encode(res_buf);
//         assert_eq!(res_hex, "0007e0dd0007de0a00081c4a00078b3e00080020000a82af00086a210008a2c400070c5c00076ac40008a083000991fd000841ae0008d8210007d8f30007a43c00094a9f000846d30006f7e100079bb8000770190008b8a50007cf8a000866fe000a72d40008979b000aac220009a7720009072600088234000763ab00094c04");
//     }
// }

describe("Matmul", () => {
  test("matmul_32_buf", () => {
    const source = new Uint8Array(32);
    const matmul = new Matmul(source);
    const res_buf = matmul.matmul_32_buf();
    const res_hex = Buffer.from(res_buf).toString("hex");
    expect(res_hex).toBe(
      "0007e0dd0007de0a00081c4a00078b3e00080020000a82af00086a210008a2c400070c5c00076ac40008a083000991fd000841ae0008d8210007d8f30007a43c00094a9f000846d30006f7e100079bb8000770190008b8a50007cf8a000866fe000a72d40008979b000aac220009a7720009072600088234000763ab00094c04",
    );
  });
});
