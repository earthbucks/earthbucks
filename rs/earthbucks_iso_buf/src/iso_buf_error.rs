use std::fmt;

#[derive(Debug)]
pub enum IsoBufError {
    GenericError {
        source: Option<Box<IsoBufError>>,
        message: String,
    },
    NotEnoughDataError {
        source: Option<Box<IsoBufError>>,
    },
    TooMuchDataError {
        source: Option<Box<IsoBufError>>,
    },
    NonMinimalEncodingError {
        source: Option<Box<IsoBufError>>,
    },
    InsufficientPrecisionError {
        source: Option<Box<IsoBufError>>,
    },
    InvalidHexError {
        source: Option<Box<IsoBufError>>,
    },
    InvalidEncodingError {
        source: Option<Box<IsoBufError>>,
    },
}

impl fmt::Display for IsoBufError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            IsoBufError::GenericError { message, .. } => {
                write!(f, "isobuf error: {}", message)
            }
            IsoBufError::NotEnoughDataError { .. } => {
                write!(f, "not enough bytes in the buffer to read")
            }
            IsoBufError::TooMuchDataError { .. } => {
                write!(f, "too many bytes in the buffer to read")
            }
            IsoBufError::NonMinimalEncodingError { .. } => {
                write!(f, "non-minimal encoding")
            }
            IsoBufError::InsufficientPrecisionError { .. } => {
                write!(f, "number too large to retain precision")
            }
            IsoBufError::InvalidHexError { .. } => {
                write!(f, "invalid hex")
            }
            IsoBufError::InvalidEncodingError { .. } => {
                write!(f, "invalid encoding")
            }
        }
    }
}
