import Key from './key'
import Pkh from './pkh'
import { Buffer } from 'buffer'

function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Please provide an argument: key or pkh')
    return
  }

  switch (args[0]) {
    case 'key':
      {
        const key = Key.fromRandom()
        const privateKeyHex = Buffer.from(key.privateKey).toString('hex')
        const publicKeyHex = Buffer.from(key.publicKey).toString('hex')

        console.log(`Private key: ${privateKeyHex}`)
        console.log(`Public key: ${publicKeyHex}`)
      }
      break
    case 'pkh':
      {
        // Generate a new private key
        const key = Key.fromRandom()
        const publicKey = key.publicKey

        // Get the corresponding pkh
        const pkh = new Pkh(publicKey)

        // Print them out
        const privateKeyHex = Buffer.from(key.privateKey).toString('hex')
        const publicKeyHex = Buffer.from(publicKey).toString('hex')
        const pkhHex = Buffer.from(pkh.pkh).toString('hex')
        console.log(`Private key: ${privateKeyHex}`)
        console.log(`Public key: ${publicKeyHex}`)
        console.log(`Address: ${pkhHex}`)
      }
      break
    default:
      console.log('Invalid argument. Please provide key or pkh')
      break
  }
}

main()
