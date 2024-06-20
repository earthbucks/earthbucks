import { KeyPair } from "./key-pair.js";
import { Pkh } from "./pkh.js";
import { SysBuf } from "./buf.js";

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Please provide an argument: key or pkh");
    return;
  }

  switch (args[0]) {
    case "key":
      {
        const key = KeyPair.fromRandom();
        const privateKeyHex = SysBuf.from(key.privKey.toBuf().buf).toString(
          "hex",
        );
        const publicKeyHex = SysBuf.from(key.pubKey.toBuf().buf).toString(
          "hex",
        );

        console.log(`Private key: ${privateKeyHex}`);
        console.log(`Public key: ${publicKeyHex}`);
      }
      break;
    case "pkh":
      {
        // Generate a new private key
        const key = KeyPair.fromRandom();
        const publicKey = key.pubKey.toBuf();

        // Get the corresponding pkh
        const pkh = Pkh.fromPubKeyBuf(publicKey);

        // Print them out
        const privateKeyHex = SysBuf.from(key.privKey.toBuf().buf).toString(
          "hex",
        );
        const publicKeyHex = SysBuf.from(publicKey.buf).toString("hex");
        const pkhHex = SysBuf.from(pkh.buf.buf).toString("hex");
        console.log(`Private key: ${privateKeyHex}`);
        console.log(`Public key: ${publicKeyHex}`);
        console.log(`Address: ${pkhHex}`);
      }
      break;
    default:
      console.log("Invalid argument. Please provide key or pkh");
      break;
  }
}

main();
