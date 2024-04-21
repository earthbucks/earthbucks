use crate::blake3::blake3_hash;
use crate::buffer_writer::BufferWriter;
use ndarray::{Array1, Array2};
// use tensorflow::Tensor;

pub struct Matmul {
    source: [u8; 32],
}

impl Matmul {
    pub fn hash_once(&self) -> [u8; 32] {
        blake3_hash(&self.source)
    }

    pub fn gen_vector_32(&self) -> Array1<u32> {
        let hash0 = blake3_hash(&self.source);
        let vec_u8 = hash0.to_vec();
        let vec_u32 = vec_u8.iter().map(|x| *x as u32).collect();
        Array1::from_vec(vec_u32)
    }

    pub fn gen_matrix_32x32(&self) -> Array2<u32> {
        // Create a 32x32 matrix where the first column is the source, the second column is the hash of the nonce, and the third column is the hash of the hash, and so on.
        let hash0 = blake3_hash(&self.source);
        let hash1 = blake3_hash(&hash0);
        let hash2 = blake3_hash(&hash1);
        let hash3 = blake3_hash(&hash2);
        let hash4 = blake3_hash(&hash3);
        let hash5 = blake3_hash(&hash4);
        let hash6 = blake3_hash(&hash5);
        let hash7 = blake3_hash(&hash6);
        let hash8 = blake3_hash(&hash7);
        let hash9 = blake3_hash(&hash8);
        let hash10 = blake3_hash(&hash9);
        let hash11 = blake3_hash(&hash10);
        let hash12 = blake3_hash(&hash11);
        let hash13 = blake3_hash(&hash12);
        let hash14 = blake3_hash(&hash13);
        let hash15 = blake3_hash(&hash14);
        let hash16 = blake3_hash(&hash15);
        let hash17 = blake3_hash(&hash16);
        let hash18 = blake3_hash(&hash17);
        let hash19 = blake3_hash(&hash18);
        let hash20 = blake3_hash(&hash19);
        let hash21 = blake3_hash(&hash20);
        let hash22 = blake3_hash(&hash21);
        let hash23 = blake3_hash(&hash22);
        let hash24 = blake3_hash(&hash23);
        let hash25 = blake3_hash(&hash24);
        let hash26 = blake3_hash(&hash25);
        let hash27 = blake3_hash(&hash26);
        let hash28 = blake3_hash(&hash27);
        let hash29 = blake3_hash(&hash28);
        let hash30 = blake3_hash(&hash29);
        let hash31 = blake3_hash(&hash30);
        let hash32 = blake3_hash(&hash31);
        let hashes: [[u8; 32]; 32] = [
            hash1, hash2, hash3, hash4, hash5, hash6, hash7, hash8, hash9, hash10, hash11, hash12,
            hash13, hash14, hash15, hash16, hash17, hash18, hash19, hash20, hash21, hash22, hash23,
            hash24, hash25, hash26, hash27, hash28, hash29, hash30, hash31, hash32,
        ];

        let ndarray_hashes = Array2::from_shape_vec((32, 32), hashes.concat()).unwrap();
        ndarray_hashes.mapv(|x| x as u32)
    }

    pub fn matmul_32_arr(&self) -> Array2<u32> {
        let matrix = self.gen_matrix_32x32();
        let vector = self.gen_vector_32();
        let result = matrix.dot(&vector);
        result.into_shape((32, 1)).unwrap()
    }

    pub fn matmul_32_buf(&self) -> [u8; 128] {
        let arr = self.matmul_32_arr();
        let vec: Vec<u32> = arr.iter().cloned().collect();
        let mut bw = BufferWriter::new();
        for &value in vec.iter() {
            bw.write_u32_be(value);
        }
        bw.to_u8_vec().try_into().unwrap()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_matmul_32() {
        let source = [0u8; 32];
        let matmul = Matmul { source };
        let res_buf = matmul.matmul_32_buf();
        let res_hex = hex::encode(res_buf);
        assert_eq!(res_hex, "0007e0dd0007de0a00081c4a00078b3e00080020000a82af00086a210008a2c400070c5c00076ac40008a083000991fd000841ae0008d8210007d8f30007a43c00094a9f000846d30006f7e100079bb8000770190008b8a50007cf8a000866fe000a72d40008979b000aac220009a7720009072600088234000763ab00094c04");
    }
}
