export type Result<T = void, U = string> =
  | { result: T; error: null }
  | { result: null; error: U };

export function Ok<T = void, U = string>(result: T): Result<T, U> {
  return { result, error: null };
}

export function Err<T = void, U = string>(error: U): Result<T, U> {
  return { result: null, error };
}

export function isOk<T = void, U = string>(
  res: Result<T, U>,
): res is { result: T; error: null } {
  return res.error === null;
}

export function isErr<T = void, U = string>(
  res: Result<T, U>,
): res is { result: null; error: U } {
  return res.error !== null;
}
