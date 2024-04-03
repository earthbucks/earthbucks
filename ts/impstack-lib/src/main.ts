import Key from './key'
import PubKeyHash from './pub-key-hash'

function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Please provide an argument: --key or --pubKeyHash')
    return
  }

  switch (args[0]) {
    case '--key':
      {
        const key = Key.fromRandom()
        const privateKeyHex = Buffer.from(key.privateKey).toString('hex')
        const publicKeyHex = Buffer.from(key.publicKey).toString('hex')

        console.log(`Private key: ${privateKeyHex}`)
        console.log(`Public key: ${publicKeyHex}`)
      }
      break
    case '--pubKeyHash':
      {
        // Generate a new private key
        const key = Key.fromRandom()
        const publicKey = key.publicKey

        // Get the corresponding pubKeyHash
        const pubKeyHash = new PubKeyHash(publicKey)

        // Print them out
        const privateKeyHex = Buffer.from(key.privateKey).toString('hex')
        const publicKeyHex = Buffer.from(publicKey).toString('hex')
        const pubKeyHashHex = Buffer.from(pubKeyHash.pubKeyHash).toString('hex')
        console.log(`Private key: ${privateKeyHex}`)
        console.log(`Public key: ${publicKeyHex}`)
        console.log(`PubKeyHash: ${pubKeyHashHex}`)
      }
      break
    default:
      console.log('Invalid argument. Please provide --key or --pubKeyHash')
      break
  }
}

main()
