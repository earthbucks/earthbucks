import { EbxBuf } from "./buf.js";
import { KeyPair } from "./key-pair.js";
import { Pkh } from "./pkh.js";

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Please provide an argument: key, pkh, entropy");
    return;
  }

  switch (args[0]) {
    case "key":
      {
        const key = KeyPair.fromRandom();
        const privKeyStr = key.privKey.toString();
        const pubKeyStr = key.pubKey.toString();

        console.log(`Private key: ${privKeyStr}`);
        console.log(`Public key: ${pubKeyStr}`);
      }
      break;
    case "pkh":
      {
        const key = KeyPair.fromRandom();
        const pkh = Pkh.fromPubKey(key.pubKey);
        const privKeyStr = key.privKey.toString();
        const pubKeyStr = key.pubKey.toString();
        const pkhStr = pkh.toString();

        console.log(`Private key: ${privKeyStr}`);
        console.log(`Public key: ${pubKeyStr}`);
        console.log(`Address: ${pkhStr}`);
      }
      break;
    case "entropy":
      {
        const entropyBuf = EbxBuf.fromRandom(32);
        const entropyHex = entropyBuf.buf.toString("hex");

        console.log(`Entropy: ${entropyHex}`);
      }
      break;
    default:
      console.log("Invalid argument. Please provide key or pkh");
      break;
  }
}

main();
