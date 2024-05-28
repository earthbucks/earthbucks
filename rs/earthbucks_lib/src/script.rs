use crate::ebx_error::EbxError;
use crate::iso_buf_reader::IsoBufReader;
use crate::opcode::Opcode;
use crate::pub_key::PubKey;
use crate::script_chunk::ScriptChunk;
use crate::script_num::ScriptNum;
use crate::tx_signature::TxSignature;

#[derive(PartialEq, Debug, Clone, Default)]
pub struct Script {
    pub chunks: Vec<ScriptChunk>,
}

impl Script {
    pub fn new(chunks: Vec<ScriptChunk>) -> Self {
        Self { chunks }
    }

    pub fn from_empty() -> Self {
        Self::new(Vec::new())
    }

    pub fn from_iso_str(s: &str) -> Result<Self, EbxError> {
        // use from_iso_str
        if s.is_empty() {
            return Ok(Self::new(Vec::new()));
        }
        let chunks: Result<Vec<ScriptChunk>, _> = s
            .split_whitespace()
            .map(|s| ScriptChunk::from_iso_str(s.to_string()))
            .collect();
        Ok(Self::new(chunks?))
    }

    pub fn to_iso_str(&self) -> Result<String, EbxError> {
        let chunks: Result<Vec<String>, _> =
            self.chunks.iter().map(|chunk| chunk.to_iso_str()).collect();
        Ok(chunks?.join(" "))
    }

    pub fn to_iso_buf(&self) -> Vec<u8> {
        let mut buf = Vec::new();
        for chunk in &self.chunks {
            buf.extend(chunk.to_iso_buf());
        }
        buf
    }

    pub fn from_iso_buf(arr: &[u8]) -> Result<Self, EbxError> {
        let mut reader = IsoBufReader::new(arr.to_vec());
        Self::from_iso_buf_reader(&mut reader)
    }

    pub fn from_iso_buf_reader(reader: &mut IsoBufReader) -> Result<Self, EbxError> {
        let mut script = Self::new(Vec::new());

        while !reader.eof() {
            let chunk = ScriptChunk::from_iso_buf_reader(reader)?;
            script.chunks.push(chunk);
        }
        Result::Ok(script)
    }

    pub fn from_multi_sig_output(m: u8, pub_keys: Vec<Vec<u8>>) -> Self {
        let mut script = Self::new(Vec::new());
        script.chunks.push(ScriptChunk::from_small_number(m as i8));
        for pub_key in pub_keys.clone() {
            script.chunks.push(ScriptChunk::from_data(pub_key));
        }
        script
            .chunks
            .push(ScriptChunk::from_small_number(pub_keys.len() as i8));
        script
            .chunks
            .push(ScriptChunk::new(Opcode::OP_CHECKMULTISIG, None));
        script
    }

    pub fn from_multi_sig_input(sigs: Vec<Vec<u8>>) -> Self {
        let mut script = Self::new(Vec::new());
        for sig in sigs {
            script.chunks.push(ScriptChunk::from_data(sig));
        }
        script
    }

    pub fn from_pkh_output(pkh: &[u8; 32]) -> Self {
        Self::new(vec![
            ScriptChunk::new(Opcode::OP_DUP, None),
            ScriptChunk::new(Opcode::OP_DOUBLEBLAKE3, None),
            ScriptChunk::from_data(pkh.to_vec()),
            ScriptChunk::new(Opcode::OP_EQUALVERIFY, None),
            ScriptChunk::new(Opcode::OP_CHECKSIG, None),
        ])
    }

    pub fn is_pkh_output(&self) -> bool {
        self.chunks.len() == 5
            && self.chunks[0].opcode == Opcode::OP_DUP
            && self.chunks[1].opcode == Opcode::OP_DOUBLEBLAKE3
            && self.chunks[2].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[2].buffer.is_some()
            && self.chunks[2].buffer.as_ref().unwrap().len() == 32
            && self.chunks[3].opcode == Opcode::OP_EQUALVERIFY
            && self.chunks[4].opcode == Opcode::OP_CHECKSIG
    }

    pub fn from_pkh_input(signature: &[u8], pub_key: &[u8]) -> Self {
        let mut script = Self::new(Vec::new());
        script
            .chunks
            .push(ScriptChunk::from_data(signature.to_vec()));
        script.chunks.push(ScriptChunk::from_data(pub_key.to_vec()));
        script
    }

    pub fn is_pkh_input(&self) -> bool {
        self.chunks.len() == 2
            && self.chunks[0].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[0].buffer.is_some()
            && self.chunks[0].buffer.as_ref().unwrap().len() == TxSignature::SIZE
            && self.chunks[1].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[1].buffer.is_some()
            && self.chunks[1].buffer.as_ref().unwrap().len() == PubKey::SIZE
    }

    pub fn from_pkh_input_placeholder() -> Self {
        let sig_buf = vec![0; TxSignature::SIZE];
        let pub_key = vec![0; PubKey::SIZE];
        Self::from_pkh_input(&sig_buf, &pub_key)
    }

    // PKHX 90D = PubKey Hash with Expiry: 90 Days
    // 13104 blocks = 2016 blocks / 14 * 90
    pub const PKHX_90D_LOCK_REL: u32 = 12960;

    pub fn from_pkhx_90d_output(pkh: &[u8; 32]) -> Self {
        Self::new(vec![
            ScriptChunk::new(Opcode::OP_IF, None),
            ScriptChunk::new(Opcode::OP_DUP, None),
            ScriptChunk::new(Opcode::OP_DOUBLEBLAKE3, None),
            ScriptChunk::from_data(pkh.to_vec()),
            ScriptChunk::new(Opcode::OP_EQUALVERIFY, None),
            ScriptChunk::new(Opcode::OP_CHECKSIG, None),
            ScriptChunk::new(Opcode::OP_ELSE, None),
            ScriptChunk::from_data(ScriptNum::from_u32(Script::PKHX_90D_LOCK_REL).to_iso_buf()),
            ScriptChunk::new(Opcode::OP_CHECKLOCKRELVERIFY, None),
            ScriptChunk::new(Opcode::OP_DROP, None),
            ScriptChunk::new(Opcode::OP_1, None),
            ScriptChunk::new(Opcode::OP_ENDIF, None),
        ])
    }

    pub fn is_pkhx_90d_output(&self) -> bool {
        self.chunks.len() == 12
            && self.chunks[0].opcode == Opcode::OP_IF
            && self.chunks[1].opcode == Opcode::OP_DUP
            && self.chunks[2].opcode == Opcode::OP_DOUBLEBLAKE3
            && self.chunks[3].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[3].buffer.is_some()
            && self.chunks[3].buffer.as_ref().unwrap().len() == 32
            && self.chunks[4].opcode == Opcode::OP_EQUALVERIFY
            && self.chunks[5].opcode == Opcode::OP_CHECKSIG
            && self.chunks[6].opcode == Opcode::OP_ELSE
            && self.chunks[7].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[7].buffer.is_some()
            && self.chunks[7].buffer.as_ref().unwrap().len() == 2
            && u16::from_be_bytes([
                self.chunks[7].buffer.as_ref().unwrap()[0],
                self.chunks[7].buffer.as_ref().unwrap()[1],
            ]) == Script::PKHX_90D_LOCK_REL as u16
            && self.chunks[8].opcode == Opcode::OP_CHECKLOCKRELVERIFY
            && self.chunks[9].opcode == Opcode::OP_DROP
            && self.chunks[10].opcode == Opcode::OP_1
            && self.chunks[11].opcode == Opcode::OP_ENDIF
    }

    pub fn is_pkhx_90d_expired(new_block_num: u64, prev_block_num: u64) -> bool {
        new_block_num >= prev_block_num + Script::PKHX_90D_LOCK_REL as u64
    }

    // PKHXR 90D 60D = PubKey Hash with Expiry: 90 Days
    // And recovery: 60 Days
    // 13104 blocks = 2016 blocks / 14 * 90
    pub const PKHXR_90D_60D_X_LOCK_REL: u32 = 12960;
    pub const PKHXR_90D_60D_R_LOCK_REL: u32 = 8640;

    pub fn from_pkhxr_90d_60d_output(pkh: &[u8; 32], rpkh: &[u8; 32]) -> Self {
        Self::new(vec![
            // if simple pkh
            ScriptChunk::new(Opcode::OP_IF, None),
            ScriptChunk::new(Opcode::OP_DUP, None),
            ScriptChunk::new(Opcode::OP_DOUBLEBLAKE3, None),
            ScriptChunk::from_data(pkh.to_vec()),
            ScriptChunk::new(Opcode::OP_EQUALVERIFY, None),
            ScriptChunk::new(Opcode::OP_CHECKSIG, None),
            // else
            ScriptChunk::new(Opcode::OP_ELSE, None),
            // if recovery pkh
            ScriptChunk::new(Opcode::OP_IF, None),
            ScriptChunk::from_data(
                ScriptNum::from_u32(Script::PKHXR_90D_60D_R_LOCK_REL).to_iso_buf(),
            ),
            ScriptChunk::new(Opcode::OP_CHECKLOCKRELVERIFY, None),
            ScriptChunk::new(Opcode::OP_DROP, None),
            ScriptChunk::new(Opcode::OP_DUP, None),
            ScriptChunk::new(Opcode::OP_DOUBLEBLAKE3, None),
            ScriptChunk::from_data(rpkh.to_vec()),
            ScriptChunk::new(Opcode::OP_EQUALVERIFY, None),
            ScriptChunk::new(Opcode::OP_CHECKSIG, None),
            // else expiry
            ScriptChunk::new(Opcode::OP_ELSE, None),
            ScriptChunk::from_data(
                ScriptNum::from_u32(Script::PKHXR_90D_60D_X_LOCK_REL).to_iso_buf(),
            ),
            ScriptChunk::new(Opcode::OP_CHECKLOCKRELVERIFY, None),
            ScriptChunk::new(Opcode::OP_DROP, None),
            ScriptChunk::new(Opcode::OP_1, None),
            ScriptChunk::new(Opcode::OP_ENDIF, None),
            ScriptChunk::new(Opcode::OP_ENDIF, None),
        ])
    }

    pub fn is_pkhxr_90d_60d_output(&self) -> bool {
        self.chunks.len() == 23
            && self.chunks[0].opcode == Opcode::OP_IF
            && self.chunks[1].opcode == Opcode::OP_DUP
            && self.chunks[2].opcode == Opcode::OP_DOUBLEBLAKE3
            && self.chunks[3].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[3].buffer.is_some()
            && self.chunks[3].buffer.as_ref().unwrap().len() == 32
            && self.chunks[4].opcode == Opcode::OP_EQUALVERIFY
            && self.chunks[5].opcode == Opcode::OP_CHECKSIG
            && self.chunks[6].opcode == Opcode::OP_ELSE
            && self.chunks[7].opcode == Opcode::OP_IF
            && self.chunks[8].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[8].buffer.is_some()
            && self.chunks[8].buffer.as_ref().unwrap().len() == 2
            && u16::from_be_bytes([
                self.chunks[8].buffer.as_ref().unwrap()[0],
                self.chunks[8].buffer.as_ref().unwrap()[1],
            ]) == Script::PKHXR_90D_60D_R_LOCK_REL as u16
            && self.chunks[9].opcode == Opcode::OP_CHECKLOCKRELVERIFY
            && self.chunks[10].opcode == Opcode::OP_DROP
            && self.chunks[11].opcode == Opcode::OP_DUP
            && self.chunks[12].opcode == Opcode::OP_DOUBLEBLAKE3
            && self.chunks[13].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[13].buffer.is_some()
            && self.chunks[13].buffer.as_ref().unwrap().len() == 32
            && self.chunks[14].opcode == Opcode::OP_EQUALVERIFY
            && self.chunks[15].opcode == Opcode::OP_CHECKSIG
            && self.chunks[16].opcode == Opcode::OP_ELSE
            && self.chunks[17].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[17].buffer.is_some()
            && self.chunks[17].buffer.as_ref().unwrap().len() == 2
            && u16::from_be_bytes([
                self.chunks[17].buffer.as_ref().unwrap()[0],
                self.chunks[17].buffer.as_ref().unwrap()[1],
            ]) == Script::PKHXR_90D_60D_X_LOCK_REL as u16
            && self.chunks[18].opcode == Opcode::OP_CHECKLOCKRELVERIFY
            && self.chunks[19].opcode == Opcode::OP_DROP
            && self.chunks[20].opcode == Opcode::OP_1
            && self.chunks[21].opcode == Opcode::OP_ENDIF
            && self.chunks[21].opcode == Opcode::OP_ENDIF
    }

    pub fn is_pkhxr_90d_60d_expired(new_block_num: u64, prev_block_num: u64) -> bool {
        new_block_num >= prev_block_num + Script::PKHXR_90D_60D_X_LOCK_REL as u64
    }

    pub fn is_pkhxr_90d_60d_recoverable(new_block_num: u64, prev_block_num: u64) -> bool {
        new_block_num >= prev_block_num + Script::PKHXR_90D_60D_R_LOCK_REL as u64
    }

    // PKHX 1H = PubKey Hash Expiry: 1 Hour
    // 6 blocks = 1 hour for 10 min blocks
    pub const PKHX_1H_LOCK_REL: u32 = 6;

    pub fn from_pkhx_1h_output(pkh: &[u8; 32]) -> Self {
        Self::new(vec![
            ScriptChunk::new(Opcode::OP_IF, None),
            ScriptChunk::new(Opcode::OP_DUP, None),
            ScriptChunk::new(Opcode::OP_DOUBLEBLAKE3, None),
            ScriptChunk::from_data(pkh.to_vec()),
            ScriptChunk::new(Opcode::OP_EQUALVERIFY, None),
            ScriptChunk::new(Opcode::OP_CHECKSIG, None),
            ScriptChunk::new(Opcode::OP_ELSE, None),
            ScriptChunk::new(Opcode::OP_6, None),
            ScriptChunk::new(Opcode::OP_CHECKLOCKRELVERIFY, None),
            ScriptChunk::new(Opcode::OP_DROP, None),
            ScriptChunk::new(Opcode::OP_1, None),
            ScriptChunk::new(Opcode::OP_ENDIF, None),
        ])
    }

    pub fn is_pkhx_1h_output(&self) -> bool {
        self.chunks.len() == 12
            && self.chunks[0].opcode == Opcode::OP_IF
            && self.chunks[1].opcode == Opcode::OP_DUP
            && self.chunks[2].opcode == Opcode::OP_DOUBLEBLAKE3
            && self.chunks[3].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[3].buffer.is_some()
            && self.chunks[3].buffer.as_ref().unwrap().len() == 32
            && self.chunks[4].opcode == Opcode::OP_EQUALVERIFY
            && self.chunks[5].opcode == Opcode::OP_CHECKSIG
            && self.chunks[6].opcode == Opcode::OP_ELSE
            && self.chunks[7].opcode == Opcode::OP_6 // lock_rel
            && self.chunks[8].opcode == Opcode::OP_CHECKLOCKRELVERIFY
            && self.chunks[9].opcode == Opcode::OP_DROP
            && self.chunks[10].opcode == Opcode::OP_1
            && self.chunks[11].opcode == Opcode::OP_ENDIF
    }

    pub fn is_pkhx_1h_expired(new_block_num: u64, prev_block_num: u64) -> bool {
        new_block_num >= prev_block_num + Script::PKHX_1H_LOCK_REL as u64
    }

    // PKHXR 1h 40m = PubKey Hash with Expiry: 1 Hour
    // and Recovery: 40 Minutes
    // 6 blocks = 1 hour for 10 min blocks
    pub const PKHXR_1H_40M_X_LOCK_REL: u32 = 6;
    pub const PKHXR_1H_40M_R_LOCK_REL: u32 = 4;

    pub fn from_pkhxr_1h_40m_output(pkh: &[u8; 32], rpkh: &[u8; 32]) -> Self {
        Self::new(vec![
            // if simple pkh
            ScriptChunk::new(Opcode::OP_IF, None),
            ScriptChunk::new(Opcode::OP_DUP, None),
            ScriptChunk::new(Opcode::OP_DOUBLEBLAKE3, None),
            ScriptChunk::from_data(pkh.to_vec()),
            ScriptChunk::new(Opcode::OP_EQUALVERIFY, None),
            ScriptChunk::new(Opcode::OP_CHECKSIG, None),
            // else
            ScriptChunk::new(Opcode::OP_ELSE, None),
            // if recovery pkh
            ScriptChunk::new(Opcode::OP_IF, None),
            ScriptChunk::new(Opcode::OP_4, None),
            ScriptChunk::new(Opcode::OP_CHECKLOCKRELVERIFY, None),
            ScriptChunk::new(Opcode::OP_DROP, None),
            ScriptChunk::new(Opcode::OP_DUP, None),
            ScriptChunk::new(Opcode::OP_DOUBLEBLAKE3, None),
            ScriptChunk::from_data(rpkh.to_vec()),
            ScriptChunk::new(Opcode::OP_EQUALVERIFY, None),
            ScriptChunk::new(Opcode::OP_CHECKSIG, None),
            // else expiry
            ScriptChunk::new(Opcode::OP_ELSE, None),
            ScriptChunk::new(Opcode::OP_6, None),
            ScriptChunk::new(Opcode::OP_CHECKLOCKRELVERIFY, None),
            ScriptChunk::new(Opcode::OP_DROP, None),
            ScriptChunk::new(Opcode::OP_1, None),
            ScriptChunk::new(Opcode::OP_ENDIF, None),
            ScriptChunk::new(Opcode::OP_ENDIF, None),
        ])
    }

    pub fn is_pkhxr_1h_40m_output(&self) -> bool {
        self.chunks.len() == 23
            && self.chunks[0].opcode == Opcode::OP_IF
            && self.chunks[1].opcode == Opcode::OP_DUP
            && self.chunks[2].opcode == Opcode::OP_DOUBLEBLAKE3
            && self.chunks[3].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[3].buffer.is_some()
            && self.chunks[3].buffer.as_ref().unwrap().len() == 32
            && self.chunks[4].opcode == Opcode::OP_EQUALVERIFY
            && self.chunks[5].opcode == Opcode::OP_CHECKSIG
            && self.chunks[6].opcode == Opcode::OP_ELSE
            && self.chunks[7].opcode == Opcode::OP_IF
            && self.chunks[8].opcode == Opcode::OP_4
            && self.chunks[9].opcode == Opcode::OP_CHECKLOCKRELVERIFY
            && self.chunks[10].opcode == Opcode::OP_DROP
            && self.chunks[11].opcode == Opcode::OP_DUP
            && self.chunks[12].opcode == Opcode::OP_DOUBLEBLAKE3
            && self.chunks[13].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[13].buffer.is_some()
            && self.chunks[13].buffer.as_ref().unwrap().len() == 32
            && self.chunks[14].opcode == Opcode::OP_EQUALVERIFY
            && self.chunks[15].opcode == Opcode::OP_CHECKSIG
            && self.chunks[16].opcode == Opcode::OP_ELSE
            && self.chunks[17].opcode == Opcode::OP_6
            && self.chunks[18].opcode == Opcode::OP_CHECKLOCKRELVERIFY
            && self.chunks[19].opcode == Opcode::OP_DROP
            && self.chunks[20].opcode == Opcode::OP_1
            && self.chunks[21].opcode == Opcode::OP_ENDIF
            && self.chunks[21].opcode == Opcode::OP_ENDIF
    }

    pub fn is_pkhxr_1h_40m_expired(new_block_num: u64, prev_block_num: u64) -> bool {
        new_block_num >= prev_block_num + Script::PKHXR_1H_40M_X_LOCK_REL as u64
    }

    pub fn is_pkhxr_1h_40m_recoverable(new_block_num: u64, prev_block_num: u64) -> bool {
        new_block_num >= prev_block_num + Script::PKHXR_1H_40M_R_LOCK_REL as u64
    }

    pub fn from_expired_pkhx_input() -> Self {
        Self::new(vec![ScriptChunk::new(Opcode::OP_0, None)])
    }

    pub fn is_expired_pkhx_input(&self) -> bool {
        self.chunks.len() == 1 && self.chunks[0].opcode == Opcode::OP_0
    }

    pub fn from_unexpired_pkhx_input(
        sig_buf: &[u8; TxSignature::SIZE],
        pub_key_buf: &[u8; PubKey::SIZE],
    ) -> Self {
        Self::new(vec![
            ScriptChunk::from_data(sig_buf.to_vec()),
            ScriptChunk::from_data(pub_key_buf.to_vec()),
            ScriptChunk::new(Opcode::OP_1, None),
        ])
    }

    pub fn is_unexpired_pkhx_input(&self) -> bool {
        self.chunks.len() == 3
            && self.chunks[0].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[0].buffer.is_some()
            && self.chunks[0].buffer.as_ref().unwrap().len() == TxSignature::SIZE
            && self.chunks[1].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[1].buffer.is_some()
            && self.chunks[1].buffer.as_ref().unwrap().len() == PubKey::SIZE
            && self.chunks[2].opcode == Opcode::OP_1
    }

    pub fn from_unexpired_pkhx_input_placeholder() -> Self {
        let sig_buf = vec![0; TxSignature::SIZE];
        let pub_key_buf = vec![0; PubKey::SIZE];
        Self::from_unexpired_pkhx_input(
            &sig_buf.try_into().unwrap(),
            &pub_key_buf.try_into().unwrap(),
        )
    }

    pub fn from_expired_pkhxr_input() -> Self {
        Self::new(vec![
            ScriptChunk::new(Opcode::OP_0, None),
            ScriptChunk::new(Opcode::OP_0, None),
        ])
    }

    pub fn is_expired_pkhxr_input(&self) -> bool {
        self.chunks.len() == 2
            && self.chunks[0].opcode == Opcode::OP_0
            && self.chunks[1].opcode == Opcode::OP_0
    }

    pub fn from_recovery_pkhxr_input(
        sig_buf: &[u8; TxSignature::SIZE],
        pub_key_buf: &[u8; PubKey::SIZE],
    ) -> Self {
        Self::new(vec![
            ScriptChunk::from_data(sig_buf.to_vec()),
            ScriptChunk::from_data(pub_key_buf.to_vec()),
            ScriptChunk::new(Opcode::OP_1, None),
            ScriptChunk::new(Opcode::OP_0, None),
        ])
    }

    pub fn from_recovery_pkhxr_input_placeholder() -> Self {
        let sig_buf = vec![0; TxSignature::SIZE];
        let pub_key_buf = vec![0; PubKey::SIZE];
        Self::from_recovery_pkhxr_input(
            &sig_buf.try_into().unwrap(),
            &pub_key_buf.try_into().unwrap(),
        )
    }

    pub fn is_recovery_pkhxr_input(&self) -> bool {
        self.chunks.len() == 4
            && self.chunks[0].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[0].buffer.is_some()
            && self.chunks[0].buffer.as_ref().unwrap().len() == TxSignature::SIZE
            && self.chunks[1].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[1].buffer.is_some()
            && self.chunks[1].buffer.as_ref().unwrap().len() == PubKey::SIZE
            && self.chunks[2].opcode == Opcode::OP_1
            && self.chunks[3].opcode == Opcode::OP_0
    }

    pub fn from_unexpired_pkhxr_input(
        sig_buf: &[u8; TxSignature::SIZE],
        pub_key_buf: &[u8; PubKey::SIZE],
    ) -> Self {
        Self::new(vec![
            ScriptChunk::from_data(sig_buf.to_vec()),
            ScriptChunk::from_data(pub_key_buf.to_vec()),
            ScriptChunk::new(Opcode::OP_1, None),
        ])
    }

    pub fn is_unexpired_pkhxr_input(&self) -> bool {
        self.chunks.len() == 3
            && self.chunks[0].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[0].buffer.is_some()
            && self.chunks[0].buffer.as_ref().unwrap().len() == TxSignature::SIZE
            && self.chunks[1].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[1].buffer.is_some()
            && self.chunks[1].buffer.as_ref().unwrap().len() == PubKey::SIZE
            && self.chunks[2].opcode == Opcode::OP_1
    }

    pub fn from_unexpired_pkhxr_input_placeholder() -> Self {
        let sig_buf = vec![0; TxSignature::SIZE];
        let pub_key_buf = vec![0; PubKey::SIZE];
        Self::from_unexpired_pkhxr_input(
            &sig_buf.try_into().unwrap(),
            &pub_key_buf.try_into().unwrap(),
        )
    }

    pub fn is_push_only(&self) -> bool {
        for chunk in &self.chunks {
            if chunk.opcode > Opcode::OP_16 {
                return false;
            }
        }
        true
    }

    pub fn is_coinbase_input(&self) -> bool {
        // TODO: Add more checks
        self.is_push_only()
    }

    pub fn is_standard_input(&self) -> bool {
        self.is_push_only() && (self.is_unexpired_pkhx_input() || self.is_expired_pkhx_input())
    }

    pub fn is_standard_output(&self) -> bool {
        self.is_pkhx_90d_output() || self.is_pkhx_1h_output()
    }
}
