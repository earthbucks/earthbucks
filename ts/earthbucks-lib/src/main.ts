import Key from './key'
import Address from './address'

function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Please provide an argument: --key or --address')
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
    case '--address':
      {
        // Generate a new private key
        const key = Key.fromRandom()
        const publicKey = key.publicKey

        // Get the corresponding address
        const address = new Address(publicKey)

        // Print them out
        const privateKeyHex = Buffer.from(key.privateKey).toString('hex')
        const publicKeyHex = Buffer.from(publicKey).toString('hex')
        const addressHex = Buffer.from(address.address).toString('hex')
        console.log(`Private key: ${privateKeyHex}`)
        console.log(`Public key: ${publicKeyHex}`)
        console.log(`Address: ${addressHex}`)
      }
      break
    default:
      console.log('Invalid argument. Please provide --key or --address')
      break
  }
}

main()
