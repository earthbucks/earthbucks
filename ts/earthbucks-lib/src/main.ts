import { KeyPair } from "./key-pair.js";
import { Pkh } from "./pkh.js";
import { Buffer } from "buffer";

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
        const privateKeyHex = Buffer.from(key.privKey.toIsoBuf()).toString(
          "hex",
        );
        const publicKeyHex = Buffer.from(key.pubKey.toIsoBuf()).toString("hex");

        console.log(`Private key: ${privateKeyHex}`);
        console.log(`Public key: ${publicKeyHex}`);
      }
      break;
    case "pkh":
      {
        // Generate a new private key
        const key = KeyPair.fromRandom();
        const publicKey = key.pubKey.toIsoBuf();

        // Get the corresponding pkh
        const pkh = Pkh.fromPubKeyBuf(publicKey);

        // Print them out
        const privateKeyHex = Buffer.from(key.privKey.toIsoBuf()).toString(
          "hex",
        );
        const publicKeyHex = Buffer.from(publicKey).toString("hex");
        const pkhHex = Buffer.from(pkh.buf).toString("hex");
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
