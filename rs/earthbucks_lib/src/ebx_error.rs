use std::{error::Error, fmt};

#[derive(Debug)]
pub enum EbxError {
    TooLittleDataError { source: Option<Box<EbxError>> },
    TooMuchDataError { source: Option<Box<EbxError>> },
    NonMinimalEncodingError { source: Option<Box<EbxError>> },
    InsufficientPrecisionError { source: Option<Box<EbxError>> },
    InvalidOpcodeError { source: Option<Box<EbxError>> },
    InvalidHexError { source: Option<Box<EbxError>> },
    InvalidEncodingError { source: Option<Box<EbxError>> },
    InvalidKeyError { source: Option<Box<EbxError>> },
    InvalidChecksumError { source: Option<Box<EbxError>> },
}

impl Error for EbxError {
    fn source(&self) -> Option<&(dyn Error + 'static)> {
        match self {
            EbxError::TooLittleDataError { source } => {
                source.as_deref().map(|s| s as &(dyn Error + 'static))
            }
            EbxError::TooMuchDataError { source } => {
                source.as_deref().map(|s| s as &(dyn Error + 'static))
            }
            EbxError::NonMinimalEncodingError { source } => {
                source.as_deref().map(|s| s as &(dyn Error + 'static))
            }
            EbxError::InsufficientPrecisionError { source } => {
                source.as_deref().map(|s| s as &(dyn Error + 'static))
            }
            EbxError::InvalidOpcodeError { source } => {
                source.as_deref().map(|s| s as &(dyn Error + 'static))
            }
            EbxError::InvalidHexError { source } => {
                source.as_deref().map(|s| s as &(dyn Error + 'static))
            }
            EbxError::InvalidEncodingError { source } => {
                source.as_deref().map(|s| s as &(dyn Error + 'static))
            }
            EbxError::InvalidKeyError { source } => {
                source.as_deref().map(|s| s as &(dyn Error + 'static))
            }
            EbxError::InvalidChecksumError { source } => {
                source.as_deref().map(|s| s as &(dyn Error + 'static))
            }
        }
    }
}

impl fmt::Display for EbxError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            EbxError::TooLittleDataError { .. } => {
                write!(f, "not enough bytes in the buffer to read")
            }
            EbxError::TooMuchDataError { .. } => {
                write!(f, "too many bytes in the buffer to read")
            }
            EbxError::NonMinimalEncodingError { .. } => {
                write!(f, "non-minimal encoding")
            }
            EbxError::InsufficientPrecisionError { .. } => {
                write!(f, "number too large to retain precision")
            }
            EbxError::InvalidOpcodeError { .. } => {
                write!(f, "invalid opcode")
            }
            EbxError::InvalidHexError { .. } => {
                write!(f, "invalid hex")
            }
            EbxError::InvalidEncodingError { .. } => {
                write!(f, "invalid encoding")
            }
            EbxError::InvalidKeyError { .. } => {
                write!(f, "invalid private key")
            }
            EbxError::InvalidChecksumError { .. } => {
                write!(f, "invalid checksum")
            }
        }
    }
}
