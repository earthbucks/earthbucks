# ebxminer

Ebxminer can be run from the command line or in browsers using a Tampermonkey script.

To run the CLI, [dawn node](https://dawn.googlesource.com/dawn/+/refs/heads/chromium/4959/src/dawn/node/) must be compiled and `dawn.node` copied to the miner directory.

## Build

```bash
$ pnpm install
$ pnpm build
```

CLI will be built to `dist/cli.js`.

## CLI

Log into earthbucks.com and copy your `__session` cookie. Provide to the miner using the `--session` parameter.

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

