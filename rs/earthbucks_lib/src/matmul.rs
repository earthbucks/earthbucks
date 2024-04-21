use crate::blake3::blake3_hash;
use crate::buffer_writer::BufferWriter;
use ndarray::{Array1, Array2};
// use std::time::Instant;

pub struct Matmul {
    source: [u8; 32],
}

impl Matmul {
    pub fn new(source: [u8; 32]) -> Self {
        Matmul { source }
    }

    pub fn generate_u8_vec(&self, len: usize) -> Vec<u8> {
        let mut vec = Vec::new();
        for _ in 0..len {
            vec.push(rand::random::<u8>());
        }
        vec
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

    pub fn gen_vector_1024_u8(&self) -> [u8; 1024] {
        let mut hash = blake3_hash(&self.source);
        let mut hashes: Vec<[u8; 32]> = Vec::new();

        for _ in 0..32 {
            hash = blake3_hash(&hash);
            hashes.push(hash);
        }

        let mut vec = Vec::new();
        for h in hashes.iter() {
            vec.extend_from_slice(h);
        }

        vec.try_into().unwrap()
    }

    pub fn gen_vector_1024_u32(&self) -> [u32; 1024] {
        let hash0 = self.gen_vector_1024_u8();
        let vec_u8 = hash0.to_vec();
        let vec_u32 = vec_u8.iter().map(|x| *x as u32).collect::<Vec<u32>>();
        vec_u32.try_into().unwrap()
    }

    pub fn gen_vector_1024(&self) -> Array1<u32> {
        let vec_u32 = self.gen_vector_1024_u32().to_vec();
        Array1::from_vec(vec_u32)
    }

    pub fn gen_matrix_1024x1024(&self) -> Array2<u32> {
        // let start = Instant::now();

        let mut hash = blake3_hash(&self.source);
        let mut hashes: Vec<[u8; 32]> = Vec::new();

        for _ in 0..(32 * 1024) {
            hash = blake3_hash(&hash);
            hashes.push(hash);
        }

        // let duration = start.elapsed();
        // println!("Time elapsed in matmul_1024_buf is: {:?}", duration);

        let ndarray_hashes = Array2::from_shape_vec((1024, 1024), hashes.concat()).unwrap();

        ndarray_hashes.mapv(|x| x as u32)
    }

    pub fn matmul_1024_arr(&self) -> Array2<u32> {
        let matrix = self.gen_matrix_1024x1024();
        let vector = self.gen_vector_1024();
        let result = matrix.dot(&vector);
        result.into_shape((1024, 1)).unwrap()
    }

    pub fn matmul_1024_buf(&self) -> [u8; 4096] {
        let arr = self.matmul_1024_arr();
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
    //use std::time::Instant;

    #[test]
    fn test_matmul_32() {
        let source = [0u8; 32];
        let matmul = Matmul { source };

        //let start = Instant::now();
        let res_buf = matmul.matmul_32_buf();
        //let duration = start.elapsed();
        //println!("Time elapsed in matmul_1024_buf is: {:?}", duration);

        let res_hex = hex::encode(res_buf);
        assert_eq!(res_hex, "0007e0dd0007de0a00081c4a00078b3e00080020000a82af00086a210008a2c400070c5c00076ac40008a083000991fd000841ae0008d8210007d8f30007a43c00094a9f000846d30006f7e100079bb8000770190008b8a50007cf8a000866fe000a72d40008979b000aac220009a7720009072600088234000763ab00094c04");
    }

    #[test]
    fn test_matmul_1024() {
        let source = [0u8; 32];
        let matmul = Matmul { source };

        //let start = Instant::now();
        let res_buf = matmul.matmul_1024_buf();
        //let duration = start.elapsed();
        //println!("Time elapsed in matmul_1024_buf is: {:?}", duration);

        let res_hex = hex::encode(res_buf);

        assert_eq!(res_hex, "014ab5bb00fe586600fae7cc00fd291400f50f0500f480090101a99a00fefea200f91300010682be00f8677f00ec1dbe0101535700fc835000f3906000fa1ddd00f69db200f5f5c100f96d4a00f7070800fa9b8500f5672100fee42800f675dd00ff584b00f845bc00f5507d00faea1600fb18d600f5951a00fc780b00fa68ee00f04f3900f3173d00fbd22600fda23200f7aff800f6994b00fcd7bb00fec68700fb901200f7bb0700f9c96d00f88c3d00f9b30f00f6cebd00fca62f00f664d300fe76ff00f7539500f2d52800f690f500fd860b00f829f600f9c4a700fab09800f3c8db0101142f00fb0d4600fc6b9400f9536700f4977600f9dfa800f7ed5200fc1d3600f69c9600f2c70d00fe51df00f8aedf00f6329400f2ade900fb262000fbb60a0104051b00f3197300f81acd00fb611e00f4ce7e00f6e8b900f9b9ad00fed17f01007f7300fe673900f6150500fa63a600f716c800fcd8b100f7db7c00fe305400fd9d3700f6972800f8f5da00f0849d00f5700600f443fb00f99f2b00ffc01700fcbfbb00fa3bd100f4d81d00fe756d00f81f6c00fcef5d00fa502400fb48fe00ffc3f200f2655b00fef12000f6ebea00fbdb4e0103d65b00fab14000f6785700f5a37200f816fd00fcf0a800ebfb1200f12a3b00f78bda00f0693b0101161c00faccfe00f67e2500fbe57300f8ff2d0103b3dc00fa45b100f0a8ca00f2606100fcc5860100ad2700f7952400fe4eef00fc325b00f142ea00f4e4df00fa1e5c00f6601500fda02900ff51a700f888b200faee6200fb9b1f00ecfec300f7c6ec00fd063400f0bc6b00f9841c0103232a00f4babf00ffa82900f6ec7b01017fca00f122230100c40500fab93c00fc999300f0ae3d00f8f9f400f73f7800fe557200fa9cfe00faec4300f49a0e00f8d2e000f9713b00f4b58400fbf35900ff7b4a00f9a7ed00fa484b00fc2de200fdf21801004d5b00f9c04b00f7c6e100f415fa00fd7a3700f8ecbd00fe3f1700eec06900fc40bf00f7aab900fcc94e00fd190200f9130900f6bedf00ffcc0100ff807400f643b600f8ca8f00ff03c800f2090a00f937aa00f510c300f9b36a0101650000f6203900f7d58000f9517300fd3eac00f9497400f1c3f700f4baa400f50d0a00f9b95600fd5eb700f55d2400f5a0a700efbbd600f5365b00f441ae0106fb5c00f8e12700eece3a00f4dcb800fd62ce00fcd2a200f5f9d10100fc8f00f0002a00f1bdd500f5d06e00f2ce8800f33b5900fc5b5600f19a1200f0697d01040de000f8e2b800f6399300f4088400f64a8c00f0b66200fe235700f5692c00fbf33e0105c81900f8579100f3be2e00fca5ef00f8f85d01007e1b00f9eb9400feea8600f6495a0103bc7900f9f13500f86ad700f72a3600f615a100fc36c700fab16d00fde11700f7894000fc421600f62f1600ff94cd00eb19c100f56e4900f9504100fdccaf01046e7300f8eea900fa0de600f4838b00f1534b00ef601900f034b4010088df00f8fb0100fc93c200fd82f400f6c72a00f11fd200f975d600f616b800f74f6300f6ccfe00f83d6700fb3b8d00f60cc600f531a400f4f1b000fb408000ee585700f7b1d500fccdbf00fa50de00f68cf500f6ee1b00f5dfe400fbaab300fdbb5d00fdacde00f4c89500fbe5b000fd64aa00f32df200f7828400f77ad100ff08e700fd89fb00fa0a5800f0ea9300fa87a800f5737000fadbbd00fca8ae00f4f3720105895900f6570f00fd4d3200fa1cd100f4f7dc00f8d8f200fa856700f630a60100b36d00fbc94200f6d86500f4f85b00f96ddb00f9b07600f45a4f00f9718101001ef000fc7d9c00fd51f800f8689800ef7dc600fb807300f303e700f520ad00f05f5700fd9e6400f2682e00fdeeda0108ec6400f6007600fa18ff00f940f300f7626b00f3e41d00fe930b00f757b600f4b66800fdbc6900f9545500f9185200f769fa00f3b74400f5645200fc67ca00f0bc5700fa535500fb3dbc00fe271500fac3a600f59f0400f5ad3000f2cc7b00fc6b0c00f7eb9100f7b30200f8bacf00fa749f00f0180e00ff10d100f0a93b01030ba100fa9c6200f88fc000f8b7380100509e00f57cdd00f4836700f3345200f937cb00ff981500f3ce9200f8281500f904d900f24b7a00fc1bec00f7e4630100a94000f4acb000f5459500f474cd00f5bc3800fceffc00f4bcb200f2c29900fdaba90102071000f8d7f200ed64cd00f1d04800f7626d00f9fbdf00fbb0f900f5c43000fce3d6010116eb00fc5e9000f90c9200fd25ad00f6c2a800feab4100f99baa00f728d200fce72c010180ea00f9be4c00fa3ebc00f6a4df00f9d81000fe423b00f39c3400ed51f90101210700fb112e00fc3ad5010447250102820e00eff69400fc529200f7041300fb038400fbf34000f7e1bd00f5d5e400eb5ea500fcbfa100f4ef2100f5bc9c00f9421800fe7d0300fd725100f42c1c00f8693000f79f57010249f600fe5d5e00fa77c200fc510f00f9c0d200f92cae01025c9200fde5df00f1fc6200fc308400f606c900fb2cd500f9d8b000f6cdb600f50a8900f68c4b01005ca300ff896700f4b8cc00f7c8af00f9c93500f79a4100f28d6c00f470ea00f93bd601019faf00f3a2310100be3d00f5422f0101ca1e00f8d38c00f76cbb00f605f700f3e51000fc92480104afb200f7a54500ebd1e700fa408800f195f800fd39af00fbf95c00f9d3e000f3751300f7412700f0962f00f6700500f9dc580101160300f7bf5900f606190102c25e00fc304f00f5f3db00f4ff2300f6ea2a00f4346c00f4e42800f4079e00fda59500f5839400fb52f100f63f3d00f98aed00f332d300fe1b5100ede1b900fba31100f44a7900f4dfe300fd35b800fa4be900f67d790105b47100f67c8a00f77ae700f8cea700f6801200f78b7c00fb319500f65d4300f9e10500fdf93a00f6d71d00fcc49100fb5e8000eea2a400f68d8500fa60df0101aba500fee249010041d100f6f4e800ef4d7d00f86d4c00f1951c00f6638600fc844500f5c82a00ff295b00ff9f4a00fe056800fa214d00f710f000f9070100f25c9800f4f76c00f9336d00ff439500f27d3d00fb0db600f7cb9d00f0b95400fd5ccf00f94fc300f8281600f735ad01020eae00fbebac00f68a6c00f8d97800f282e000f6d07400fa75a200f6125c00f7494900fb3db000f4917b00fb684500f02b0b00f631f000f16d600100066c00f22ec100f780de00f40c3900f8398800f9e77900f6882000f9457700f8eaba00f8fbe500f72f7200f38e5a00f60deb00f14ad800f3ad4d00f7075400f7de8300f52ff400f8398800fecdf100f3e61200fbb9a600fbb16200f74e9e0107c4cc0101f335010047a800f6a88400feb50a00f23d6c00fb39db00fc2e9500f9f7ec00eda1af00f9f5d700f7de3600fbcf9d00f3593300f681bd00fff45500f8eb3900f53b6b00f7c61200fed77c00f73e6200f8fa0000fa099000fdebaa00f9616d00f3d34600fc5a3300f782bb00f90a3800fe57340100142f00f47fed00f24ef300f1b37300fabaa600f9060500f8e21000f89b6d0102d0b300ec025500fa943a00f740090102325b00ebb25d00fed02e00ff9d2800fe2ae400f9811f00f92d6900fb843800fcd82800f7efa200f8235100f928ee00f5627500f8d7cf0101274c00fab44600fa75f000faedc000f9bda700f888c800fff5c400fa698500f56d2200f223f400fe419b00f7e90300fa85e100f3ac0f00f9963b00fc568100f8f7e500f4245600fe6aa800fb02650102261a00f578af00fb136700f63e5700fe702800fa2f4e00f9d17600f90eb800fbce0100f2c78200f77be900fb95f700f737f100f3a56200f3e39500f6149200f64fc800f2c01c00f62ef000f3d9e000fec90400f02d9700f36a4d00fa7aac0101173e00fee46c00f4d78700f765ab00f928510104938e00fb91d100fd1bc200f23de000f08d5b00f50e9c00f66c4f00fbd8fa00f6441c00fa3f8700f95c9400faf35600fc9cd700f930ba00ffce3800f49a0d00fbf3c300f3e3c800fbfbb000eb67e100fcd33a0103563f010201f200f9ff4300f7501100f5fcc700fbcde400fe31a500fcf5db00fc742c0102b7e400fec64e00fe395100fc706500f95cdf00fdfea000f6fc9d00f3ad7300f8654b00facd7900f7611600fb0b6700f2f1b400fc2e6600f6aae900f398a400f5ad3100f7b70400fab2f200f8563f01022c8e00fbfea800f948f200f6948700fb64a200f0f2010101b01900fa4f2600fddb3c00fc522300f97cb300f3e18400faa4ca00ffca8600f2f9c600fd91b101016bb800fc982e00f723e800fdea8d00fda59e00f2465800f5f16c00e9185300fce9f600f42dee010382e000f6296100f8b02600fa70c300fb724c00fc31fd00fcafa600f38c7f00fecebc00f954a600fdc3e300f95eba00f9cbfb00f8e23c00ffc43200f35ed900f693d700fbd4f500f863e900f962db00f623ac010303cf00f371fc0101926c00f8913400f8c12f00f8183200fb765200f528c600ef78c600fd70ef00ec7b6c0101de2a00fb608c0102179a0103862900f7bafa00f80bc000f7ff9a00fa794700f68c6b00fb9f2b00ffd90c0100325400f8523400f0672900e9c5af00ff2e7c00fa8ed401017a8000f6a6d400f45b7a0104df4200fcac1900f1ad5a00f598c500f190ce00f7df870102212f00f675e500fbe1420106e54300f9e10900f4b47700f9379d00f9cdc800f325bd00fcf4b400f126320101228100f9f2e900fb9430010156ae00fe46ae00fb022b00fc05af00fad0ac01005be700fc6ede00fab8cc00f516a800fcdc610101dd6900fa327f00f5059a01008e1f00f942a10102868c00f84b2600f92fe70101dd3500f7d11100f8856b00f8321900f85e4900f8475100fae75f00f2acdf00f68cb100fada9700fd024c00ffb48300fea31800fe032e00f82cd000f292ba00f8ad4800f3d2e000fd4e1a00ee464400f5edbe00f8500f00f801bb00f27df600f81c8e00f8350000f1a1de00f1a94a00f4738f00ff203700f3a13900f2e90900faa91400f71e370102b6ff00f84ca400f4ec2f00f52cf800f44d0400f9632100fcdf6a00fc069400f485e800fe4db200fcf1b500f6eb7600fa033f00f6266000fc6f7e00f982bd00f0961e00fa621e00fa829500f7984a00f837ad00fbbdcb00f912d400fc337e0104726700f6d71b00f69d6a00fd328300efd19800f630a00101899000f60e1200f9328d00ebbb150100cd9800f50bcd00ebd66800f2d08d00fd64d200fceb6500fc67aa00f7418100ff55d100fe11a600eef8b800f1a24600fc3ac900e9d56500f7a61700f613c100f6d60600f1b19b00ff65ee00fa212c00f9b0f700f7f72f00f3d59d00f587a400f3f7ec00faefd000fc63fb01000e4600f990bf00f9f4e800f82dfb00f97bcb00ef25f1010124dd00fdbf5800faf90600f218580102c25000f6633c00fd3b7a00f9dd2300f82ee600f7563600f3002400f9e36f00f5a98301005fc800fc850300fbb2d600fa386a00ff419e00ffc78f00fbca3100f6a08500f8e3b800f8f23d00f7c9e500f5d46700ff779d00fb16ff01009d2700f9249500fbefe301013b1e00fec1780101609900f83e2a00f590d900f7948801020ee800f66b9600fc6baa00fc7b3200f521d40100eb7c00f828cb00fde01a00f8ac7300f2b6e300f9c13f00f94a7900fc559600fccee100f6fbc400f4b41100fcb2eb");
    }
}
