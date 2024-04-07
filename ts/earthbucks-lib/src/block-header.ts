export default class BlockHeader {
  version: number // uint32
  previousBlockHash: Uint8Array // 256 bits
  merkleRoot: Uint8Array // 256 bits
  timestamp: number // uint32
  difficulty: number // 32 bits
  nonce: Uint8Array // 256 bits
  domain: Uint8Array // 256 bits

  constructor(
    version: number,
    previousBlockHash: Uint8Array,
    merkleRoot: Uint8Array,
    timestamp: number,
    difficulty: number,
    nonce: Uint8Array,
    domain: Uint8Array,
  ) {
    this.version = version
    this.previousBlockHash = previousBlockHash
    this.merkleRoot = merkleRoot
    this.timestamp = timestamp
    this.difficulty = difficulty
    this.nonce = nonce
    this.domain = domain
  }

  calculateTarget() {
    const difficulty = this.difficulty
    const exponent = BigInt(difficulty >> 24)
    const coefficient = BigInt(difficulty & 0xffffff)
    let target
    if (exponent <= 3) {
      target = coefficient >> (8n * (3n - exponent))
    } else {
      target = coefficient << (8n * (exponent - 3n))
    }
    return target
  }

  static domainIsValid(domain: Uint8Array): boolean {
    const domainString = Buffer.from(domain).toString()
    if (domainString.length < 4) {
      return false
    }
    if (domainString.startsWith('.')) {
      return false
    }
    if (domainString.endsWith('.')) {
      return false
    }
    if (!domainString.includes('.')) {
      return false
    }
    if (domainString.includes('..')) {
      return false
    }
    const domainParts = domainString.split('.')
    if (domainParts.length < 2) {
      return false
    }
    if (domainParts.length > 4) {
      return false
    }
    if (domainParts.some((part) => part.length > 63)) {
      return false
    }
    if (domainParts.some((part) => !part.match(/^[a-z0-9]+$/))) {
      return false
    }
    if (domainParts.some((part) => part.startsWith('-'))) {
      return false
    }
    if (domainParts.some((part) => part.endsWith('-'))) {
      return false
    }
    if (domainParts.some((part) => part.includes('--'))) {
      return false
    }
    return true
  }
}
