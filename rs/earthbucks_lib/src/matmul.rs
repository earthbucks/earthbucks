use crate::blake3::blake3_hash;
use crate::buffer_writer::BufferWriter;
use ndarray::{Array1, Array2};

pub struct Matmul {
    source: [u8; 32],
}

impl Matmul {
    pub fn new(source: [u8; 32]) -> Self {
        Matmul { source }
    }

    pub fn hash_once(&self) -> [u8; 32] {
        blake3_hash(&self.source)
    }

    pub fn gen_vector_32_u8(&self) -> [u8; 32] {
        self.hash_once()
    }

    pub fn gen_vector_32_u32(&self) -> [u32; 32] {
        let hash0 = self.gen_vector_32_u8();
        let vec_u8 = hash0.to_vec();
        let vec_u32 = vec_u8.iter().map(|x| *x as u32).collect::<Vec<u32>>();
        vec_u32.try_into().unwrap()
    }

    pub fn gen_vector_32(&self) -> Array1<u32> {
        let vec_u32 = self.gen_vector_32_u32().to_vec();
        Array1::from_vec(vec_u32)
    }

    pub fn gen_matrix_32x32(&self) -> Array2<u32> {
        let mut hash = blake3_hash(&self.source);
        let mut hashes: Vec<[u8; 32]> = Vec::new();

        for _ in 0..32 {
            hash = blake3_hash(&hash);
            hashes.push(hash);
        }

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
