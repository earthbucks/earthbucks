use std::fmt;

#[derive(Debug)]
pub enum IsobufError {
    GenericError {
        source: Option<Box<IsobufError>>,
        message: String,
    },
    NotEnoughDataError {
        source: Option<Box<IsobufError>>,
    },
    TooMuchDataError {
        source: Option<Box<IsobufError>>,
    },
    NonMinimalEncodingError {
        source: Option<Box<IsobufError>>,
    },
    InsufficientPrecisionError {
        source: Option<Box<IsobufError>>,
    },
    InvalidHexError {
        source: Option<Box<IsobufError>>,
    },
    InvalidEncodingError {
        source: Option<Box<IsobufError>>,
    },
}

impl fmt::Display for IsobufError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            IsobufError::GenericError { message, .. } => {
                write!(f, "isobuf error: {}", message)
            }
            IsobufError::NotEnoughDataError { .. } => {
                write!(f, "not enough bytes in the buffer to read")
            }
            IsobufError::TooMuchDataError { .. } => {
                write!(f, "too many bytes in the buffer to read")
            }
            IsobufError::NonMinimalEncodingError { .. } => {
                write!(f, "non-minimal encoding")
            }
            IsobufError::InsufficientPrecisionError { .. } => {
                write!(f, "number too large to retain precision")
            }
            IsobufError::InvalidHexError { .. } => {
                write!(f, "invalid hex")
            }
            IsobufError::InvalidEncodingError { .. } => {
                write!(f, "invalid encoding")
            }
        }
    }
}
