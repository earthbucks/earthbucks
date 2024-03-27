import { Blake3Hasher } from '@napi-rs/blake-hash'

export default function blake3 (data: Uint8Array): Uint8Array {
  const hasher = new Blake3Hasher()
  hasher.update(Buffer.from(data))
  const hex = hasher.digest('hex')
  return new Uint8Array(Buffer.from(hex, 'hex'))
}
