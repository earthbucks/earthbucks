export function isValidDomain(domain: Uint8Array): boolean {
  const domainString = Buffer.from(domain).toString().trim()
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

export function domainFromString(domain: string): Uint8Array {
  const domainBuf = Buffer.from(' '.repeat(32))
  domainBuf.write(domain)
  return Uint8Array.from(domainBuf)
}
