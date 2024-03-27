import Key from './key';

function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log("Please provide an argument: --key or --address");
        return;
    }

    switch (args[0]) {
        case "--key":
            const key = Key.fromRandom();
            const privateKeyHex = Buffer.from(key.privateKey).toString('hex');
            const publicKeyHex = Buffer.from(key.publicKey).toString('hex');

            console.log(`Private key: ${privateKeyHex}`);
            console.log(`Public key: ${publicKeyHex}`);
            break;
        case "--address":
            console.log("Address functionality is not implemented yet.");
            break;
        default:
            console.log("Invalid argument. Please provide --key or --address");
            break;
    }
}

main();