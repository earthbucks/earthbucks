use crate::ebx_error::EbxError;
use crate::pkh_key_map::PkhKeyMap;
use crate::script::Script;
use crate::tx::Tx;
use crate::tx_out_bn_map::TxOutBnMap;
use crate::tx_signature::TxSignature;

pub struct TxSigner {
    pub tx: Tx,
    pub pkh_key_map: PkhKeyMap,
    pub tx_out_bn_map: TxOutBnMap,
    pub working_block_num: u64,
}

impl TxSigner {
    pub fn new(
        tx: Tx,
        tx_out_bn_map: &TxOutBnMap,
        pkh_key_map: &PkhKeyMap,
        working_block_num: u64,
    ) -> Self {
        Self {
            tx,
            tx_out_bn_map: tx_out_bn_map.clone(),
            pkh_key_map: pkh_key_map.clone(),
            working_block_num,
        }
    }

    pub fn sign_input(&mut self, n_in: usize) -> Result<Tx, EbxError> {
        let mut tx_clone = self.tx.clone();

        let tx_input = &mut self.tx.inputs[n_in];
        let tx_out_hash = &tx_input.input_tx_id;
        let output_index = tx_input.input_tx_out_num;
        let tx_out_bn = match self.tx_out_bn_map.get(tx_out_hash, output_index) {
            Some(tx_out_bn) => tx_out_bn.clone(),
            None => {
                return Err(EbxError::GenericError {
                    source: None,
                    message: "tx_out not found".to_string(),
                })
            }
        };
        let tx_out = tx_out_bn.tx_out;
        let prev_block_num = tx_out_bn.block_num;

        if tx_out.script.is_pkh_output() {
            let pkh_buf = tx_out.script.chunks[2]
                .buffer
                .clone()
                .expect("pkh not found");
            let input_script = &mut tx_input.script;
            if !input_script.is_pkh_input() {
                return Err(EbxError::GenericError {
                    source: None,
                    message: "expected pkh input placeholder".to_string(),
                });
            }
            let key_pair = match self.pkh_key_map.get(&pkh_buf) {
                Some(key) => key,
                None => {
                    return Err(EbxError::GenericError {
                        source: None,
                        message: "key not found".to_string(),
                    })
                }
            };
            let pub_key_buf = &key_pair.pub_key.buf.to_vec();
            let output_script_buf = tx_out.script.to_iso_buf();
            let output_amount = tx_out.value;
            let priv_key_buf = key_pair.priv_key.buf;
            let sig = tx_clone.sign_no_cache(
                n_in,
                priv_key_buf,
                output_script_buf.to_vec(),
                output_amount,
                TxSignature::SIGHASH_ALL,
            );
            let sig_buf = sig.to_iso_buf();

            input_script.chunks[0].buffer = Some(sig_buf.to_vec());
            input_script.chunks[1].buffer = Some(pub_key_buf.clone());
        } else if tx_out.script.is_pkhx_1h_output() {
            let pkh_buf = tx_out.script.chunks[3]
                .buffer
                .clone()
                .expect("pkh not found");
            let expired = Script::is_pkhx_1h_expired(self.working_block_num, prev_block_num);
            let input_script = &mut tx_input.script;
            if expired {
                if input_script.is_expired_pkhx_input() {
                    // no need to sign expired pkhx
                    return Ok(self.tx.clone());
                } else {
                    return Err(EbxError::GenericError {
                        source: None,
                        message: "expected expired pkhx input".to_string(),
                    });
                }
            }
            if !input_script.is_unexpired_pkhx_input() {
                return Err(EbxError::GenericError {
                    source: None,
                    message: "expected unexpired pkhx input placeholder".to_string(),
                });
            }
            let key_pair = match self.pkh_key_map.get(&pkh_buf) {
                Some(key) => key,
                None => {
                    return Err(EbxError::GenericError {
                        source: None,
                        message: "key not found".to_string(),
                    })
                }
            };
            let pub_key_buf = &key_pair.pub_key.buf.to_vec();
            let output_script_buf = tx_out.script.to_iso_buf();
            let output_amount = tx_out.value;
            let priv_key_buf = key_pair.priv_key.buf;
            let sig = tx_clone.sign_no_cache(
                n_in,
                priv_key_buf,
                output_script_buf.to_vec(),
                output_amount,
                TxSignature::SIGHASH_ALL,
            );
            let sig_buf = sig.to_iso_buf();

            input_script.chunks[0].buffer = Some(sig_buf.to_vec());
            input_script.chunks[1].buffer = Some(pub_key_buf.clone());
        } else if tx_out.script.is_pkhx_90d_output() {
            let pkh_buf = tx_out.script.chunks[3]
                .buffer
                .clone()
                .expect("pkh not found");
            let expired = Script::is_pkhx_90d_expired(self.working_block_num, prev_block_num);
            let input_script = &mut tx_input.script;
            if expired {
                if input_script.is_expired_pkhx_input() {
                    // no need to sign expired pkhx
                    return Ok(self.tx.clone());
                } else {
                    return Err(EbxError::GenericError {
                        source: None,
                        message: "expected expired pkhx input".to_string(),
                    });
                }
            }
            if !input_script.is_unexpired_pkhx_input() {
                return Err(EbxError::GenericError {
                    source: None,
                    message: "expected unexpired pkhx input placeholder".to_string(),
                });
            }
            let key_pair = match self.pkh_key_map.get(&pkh_buf) {
                Some(key) => key,
                None => {
                    return Err(EbxError::GenericError {
                        source: None,
                        message: "key not found".to_string(),
                    })
                }
            };
            let pub_key_buf = &key_pair.pub_key.buf.to_vec();
            let output_script_buf = tx_out.script.to_iso_buf();
            let output_amount = tx_out.value;
            let private_key_array = key_pair.priv_key.buf;
            let sig = tx_clone.sign_no_cache(
                n_in,
                private_key_array,
                output_script_buf.to_vec(),
                output_amount,
                TxSignature::SIGHASH_ALL,
            );
            let sig_buf = sig.to_iso_buf();

            input_script.chunks[0].buffer = Some(sig_buf.to_vec());
            input_script.chunks[1].buffer = Some(pub_key_buf.clone());
        } else if tx_out.script.is_pkhxr_1h_40m_output() {
            let pkh_buf = tx_out.script.chunks[3]
                .buffer
                .clone()
                .expect("pkh not found");
            let rpkh_buf = tx_out.script.chunks[13]
                .buffer
                .clone()
                .expect("rpkh not found");
            let expired = Script::is_pkhxr_1h_40m_expired(self.working_block_num, prev_block_num);
            let input_script = &mut tx_input.script;
            if expired {
                if input_script.is_expired_pkhxr_input() {
                    // no need to sign expired pkhx
                    return Ok(self.tx.clone());
                } else {
                    return Err(EbxError::GenericError {
                        source: None,
                        message: "expected expired pkhx input".to_string(),
                    });
                }
            }

            let key_pair = if input_script.is_recovery_pkhxr_input() {
                let recoverable =
                    Script::is_pkhxr_1h_40m_recoverable(self.working_block_num, prev_block_num);
                if !recoverable {
                    return Err(EbxError::GenericError {
                        source: None,
                        message: "expected recoverable pkhx input".to_string(),
                    });
                }
                match self.pkh_key_map.get(&rpkh_buf) {
                    Some(key) => key,
                    None => {
                        return Err(EbxError::GenericError {
                            source: None,
                            message: "key not found".to_string(),
                        })
                    }
                }
            } else if input_script.is_unexpired_pkhxr_input() {
                match self.pkh_key_map.get(&pkh_buf) {
                    Some(key) => key,
                    None => {
                        return Err(EbxError::GenericError {
                            source: None,
                            message: "key not found".to_string(),
                        })
                    }
                }
            } else {
                return Err(EbxError::GenericError {
                    source: None,
                    message: "expected unexpired pkhx input placeholder".to_string(),
                });
            };

            let pub_key_buf = &key_pair.pub_key.buf.to_vec();
            let output_script_buf = tx_out.script.to_iso_buf();
            let output_amount = tx_out.value;
            let priv_key_buf = key_pair.priv_key.buf;
            let sig = tx_clone.sign_no_cache(
                n_in,
                priv_key_buf,
                output_script_buf.to_vec(),
                output_amount,
                TxSignature::SIGHASH_ALL,
            );
            let sig_buf = sig.to_iso_buf();

            input_script.chunks[0].buffer = Some(sig_buf.to_vec());
            input_script.chunks[1].buffer = Some(pub_key_buf.clone());
        } else if tx_out.script.is_pkhxr_90d_60d_output() {
            let pkh_buf = tx_out.script.chunks[3]
                .buffer
                .clone()
                .expect("pkh not found");
            let rpkh_buf = tx_out.script.chunks[13]
                .buffer
                .clone()
                .expect("rpkh not found");
            let expired = Script::is_pkhxr_90d_60d_expired(self.working_block_num, prev_block_num);
            let input_script = &mut tx_input.script;
            if expired {
                if input_script.is_expired_pkhxr_input() {
                    // no need to sign expired pkhx
                    return Ok(self.tx.clone());
                } else {
                    return Err(EbxError::GenericError {
                        source: None,
                        message: "expected expired pkhx input".to_string(),
                    });
                }
            }

            let key_pair = if input_script.is_recovery_pkhxr_input() {
                let recoverable =
                    Script::is_pkhxr_90d_60d_recoverable(self.working_block_num, prev_block_num);
                if !recoverable {
                    return Err(EbxError::GenericError {
                        source: None,
                        message: "expected recoverable pkhx input".to_string(),
                    });
                }
                match self.pkh_key_map.get(&rpkh_buf) {
                    Some(key) => key,
                    None => {
                        return Err(EbxError::GenericError {
                            source: None,
                            message: "key not found".to_string(),
                        })
                    }
                }
            } else if input_script.is_unexpired_pkhxr_input() {
                match self.pkh_key_map.get(&pkh_buf) {
                    Some(key) => key,
                    None => {
                        return Err(EbxError::GenericError {
                            source: None,
                            message: "key not found".to_string(),
                        })
                    }
                }
            } else {
                return Err(EbxError::GenericError {
                    source: None,
                    message: "expected unexpired pkhx input placeholder".to_string(),
                });
            };

            let pub_key_buf = &key_pair.pub_key.buf.to_vec();
            let output_script_buf = tx_out.script.to_iso_buf();
            let output_amount = tx_out.value;
            let priv_key_buf = key_pair.priv_key.buf;
            let sig = tx_clone.sign_no_cache(
                n_in,
                priv_key_buf,
                output_script_buf.to_vec(),
                output_amount,
                TxSignature::SIGHASH_ALL,
            );
            let sig_buf = sig.to_iso_buf();

            input_script.chunks[0].buffer = Some(sig_buf.to_vec());
            input_script.chunks[1].buffer = Some(pub_key_buf.clone());
        } else {
            return Err(EbxError::GenericError {
                source: None,
                message: "unsupported script type".to_string(),
            });
        }

        Ok(self.tx.clone())
    }

    pub fn sign(&mut self) -> Result<Tx, EbxError> {
        for i in 0..self.tx.inputs.len() {
            self.sign_input(i)?;
        }
        Ok(self.tx.clone())
    }
}
