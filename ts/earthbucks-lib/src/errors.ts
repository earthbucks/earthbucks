import { Result, Ok, Err } from "./ts-results/result";
import { Option, Some, None } from "./ts-results/option";

export abstract class EbxError extends Error {
  constructor() {
    super();
  }
}

export class InsufficientLengthError extends EbxError {
  constructor(public source: Option<Error>) {
    super();
  }

  toString(): string {
    return `not enough bytes in the buffer to read`;
  }
}

export class NonMinimalEncodingError extends EbxError {
  constructor(public source: Option<Error>) {
    super();
  }

  toString(): string {
    return `non-minimal varint encoding`;
  }
}

export class InsufficientPrecisionError extends EbxError {
  constructor(public source: Option<Error>) {
    super();
  }

  toString(): string {
    return `number too large to retain precision`;
  }
}
