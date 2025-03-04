# ebxminer

**Ebxminer is not supported and does not work**. It used to work with the old
POW algorithm, but no longer. The purpose of open-sourcing Ebxminer is to
provide an example of using the API with multiple GPUs to mine EarthBucks.
Anyone who wants to use it should only use it to get an idea of what to do, but
it will need to be significantly modified to work with the current POW
algorithm.

---

Ebxminer can be run from the command line or in browsers using a Tampermonkey
script.

To run the CLI,
[dawn node](https://dawn.googlesource.com/dawn/+/refs/heads/chromium/4959/src/dawn/node/)
must be compiled and `dawn.node` copied to the miner directory.

## Build

```bash
$ pnpm install
$ pnpm build
```

CLI will be built to `dist/cli.js`.

## CLI

Log into earthbucks.com and copy your `__session` cookie. Provide to the miner
using the `--session` parameter.

Device selection requires `dawn-node-devicenum.patch` to be applied.

```bash
$ ebxminer --help

  Usage
    $ ebxminer

  Options
        --session earthbucks.com session
        --device Device
        --verbose, -v Verbose

  Examples
    $ ebxminer --session=YOUR_EARTHBUCKS_SESSION --device=0
```

## Required packages for Arch Linux docker image

```bash
# pacman -Sy openssl nodejs vulkan-icd-loader vulkan-tools
```

Verify GPU is working using `vulkaninfo`.

## Tampermonkey script

Build:

```bash
pnpm build:web
```

Open Tampermonkey and install `dist-web/ebxminer.user.js`.

Go to earthbucks.com. Open console and run `startMining();`
