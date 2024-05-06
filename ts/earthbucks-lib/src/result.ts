export default class Result<T, E> {
  constructor(private readonly successValue: T | null, private readonly errorValue: E | null) {}

  static ok<T, E>(value: T): Result<T, E> {
    return new Result<T, E>(value, null);
  }

  static err<T, E>(error: E): Result<T, E> {
    return new Result<T, E>(null, error);
  }

  isOk(): boolean {
    return this.successValue !== null;
  }

  isError(): boolean {
    return this.errorValue !== null;
  }

  unwrap(): T {
    if (this.isOk()) {
      return this.successValue as T;
    }
    throw new Error("Called unwrap on an Err value: " + this.errorValue);
  }

  unwrapErr(): E {
    if (this.isError()) {
      return this.errorValue as E;
    }
    throw new Error("Called unwrapErr on an Ok value");
  }

  map<U>(f: (value: T) => U): Result<U, E> {
    if (this.isOk()) {
      return Result.ok(f(this.successValue as T));
    }
    return Result.err(this.errorValue as E);
  }

  map_err<U>(f: (error: E) => U): Result<T, U> {
    if (this.isError()) {
      return Result.err(f(this.errorValue as E));
    }
    return Result.ok(this.successValue as T);
  }

  and_then<U>(f: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isOk()) {
      return f(this.successValue as T);
    }
    return Result.err(this.errorValue as E);
  }
}