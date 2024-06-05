# Installing TensorFlow

## @tensorflow/tfjs-node

Install setuptools from python with homebrew to install tfjs-node:

```zsh
brew install python-setuptools
```

Then:
  
```zsh
pnpm add @tensorflow/tfjs-node
```

## Log

### 2024-06-05

#### TensorFlow for Node.js on macOS

Attempted to install tensorflow for node.js on macOS:

```zsh
pnpm add @tensorflow/tfjs-node
```

Error:

```
.../node_modules/@tensorflow/tfjs-node install$ node scripts/install.js
│ CPU-darwin-4.20.0.tar.gz
│ * Building TensorFlow Node.js bindings
│ node-pre-gyp install failed with error: Error: Command failed: node-pre-gyp install -…
│ node-pre-gyp info it worked if it ends with ok
│ node-pre-gyp info using node-pre-gyp@1.0.9
│ node-pre-gyp info using node@20.8.1 | darwin | arm64
│ node-pre-gyp info check checked for "/Users/ryan/dev/earthbucks/ts/node_modules/.pnpm…
│ node-pre-gyp http GET https://storage.googleapis.com/tf-builds/pre-built-binary/napi-…
│ node-pre-gyp ERR! install response status 404 Not Found on https://storage.googleapis…
│ node-pre-gyp WARN Pre-built binaries not installable for @tensorflow/tfjs-node@4.20.0…
│ node-pre-gyp WARN Hit error response status 404 Not Found on https://storage.googleap…
│ gyp info it worked if it ends with ok
│ gyp info using node-gyp@9.4.1
│ gyp info using node@20.8.1 | darwin | arm64
│ gyp info ok 
│ gyp info it worked if it ends with ok
│ gyp info using node-gyp@9.4.1
│ gyp info using node@20.8.1 | darwin | arm64
│ gyp info find Python using Python version 3.12.3 found at "/opt/homebrew/opt/python@3…
│ gyp info spawn /opt/homebrew/opt/python@3.12/bin/python3.12
│ gyp info spawn args [
│ gyp info spawn args   '/Users/ryan/.cache/node/corepack/pnpm/8.15.4/dist/node_modules…
│ gyp info spawn args   'binding.gyp',
│ gyp info spawn args   '-f',
│ gyp info spawn args   'make',
│ gyp info spawn args   '-I',
│ gyp info spawn args   '/Users/ryan/dev/earthbucks/ts/node_modules/.pnpm/@tensorflow+t…
│ gyp info spawn args   '-I',
│ gyp info spawn args   '/Users/ryan/.cache/node/corepack/pnpm/8.15.4/dist/node_modules…
│ gyp info spawn args   '-I',
│ gyp info spawn args   '/Users/ryan/Library/Caches/node-gyp/20.8.1/include/node/common…
│ gyp info spawn args   '-Dlibrary=shared_library',
│ gyp info spawn args   '-Dvisibility=default',
│ gyp info spawn args   '-Dnode_root_dir=/Users/ryan/Library/Caches/node-gyp/20.8.1',
│ gyp info spawn args   '-Dnode_gyp_dir=/Users/ryan/.cache/node/corepack/pnpm/8.15.4/di…
│ gyp info spawn args   '-Dnode_lib_file=/Users/ryan/Library/Caches/node-gyp/20.8.1/<(t…
│ gyp info spawn args   '-Dmodule_root_dir=/Users/ryan/dev/earthbucks/ts/node_modules/.…
│ gyp info spawn args   '-Dnode_engine=v8',
│ gyp info spawn args   '--depth=.',
│ gyp info spawn args   '--no-parallel',
│ gyp info spawn args   '--generator-output',
│ gyp info spawn args   'build',
│ gyp info spawn args   '-Goutput_dir=.'
│ gyp info spawn args ]
│ Traceback (most recent call last):
│   File "/Users/ryan/.cache/node/corepack/pnpm/8.15.4/dist/node_modules/node-gyp/gyp/g…
│     import gyp  # noqa: E402
│     ^^^^^^^^^^
│   File "/Users/ryan/.cache/node/corepack/pnpm/8.15.4/dist/node_modules/node-gyp/gyp/p…
│     import gyp.input
│   File "/Users/ryan/.cache/node/corepack/pnpm/8.15.4/dist/node_modules/node-gyp/gyp/p…
│     from distutils.version import StrictVersion
│ ModuleNotFoundError: No module named 'distutils'
│ gyp ERR! configure error 
│ gyp ERR! stack Error: `gyp` failed with exit code: 1
│ gyp ERR! stack     at ChildProcess.onCpExit (/Users/ryan/.cache/node/corepack/pnpm/8.…
│ gyp ERR! stack     at ChildProcess.emit (node:events:514:28)
│ gyp ERR! stack     at ChildProcess._handle.onexit (node:internal/child_process:294:12)
│ gyp ERR! System Darwin 23.5.0
│ gyp ERR! command "/Users/ryan/.nvm/versions/node/v20.8.1/bin/node" "/Users/ryan/.cach…
│ gyp ERR! cwd /Users/ryan/dev/earthbucks/ts/node_modules/.pnpm/@tensorflow+tfjs-node@4…
│ gyp ERR! node -v v20.8.1
│ gyp ERR! node-gyp -v v9.4.1
│ gyp ERR! not ok 
│ node-pre-gyp ERR! build error 
│ node-pre-gyp ERR! stack Error: Failed to execute '/Users/ryan/.nvm/versions/node/v20.…
│ node-pre-gyp ERR! stack     at ChildProcess.<anonymous> (/Users/ryan/dev/earthbucks/t…
│ node-pre-gyp ERR! stack     at ChildProcess.emit (node:events:514:28)
│ node-pre-gyp ERR! stack     at maybeClose (node:internal/child_process:1105:16)
│ node-pre-gyp ERR! stack     at ChildProcess._handle.onexit (node:internal/child_proce…
│ node-pre-gyp ERR! System Darwin 23.5.0
│ node-pre-gyp ERR! command "/Users/ryan/.nvm/versions/node/v20.8.1/bin/node" "/Users/r…
│ node-pre-gyp ERR! cwd /Users/ryan/dev/earthbucks/ts/node_modules/.pnpm/@tensorflow+tf…
│ node-pre-gyp ERR! node -v v20.8.1
│ node-pre-gyp ERR! node-pre-gyp -v v1.0.9
│ node-pre-gyp ERR! not ok 
└─ Failed in 758ms at /Users/ryan/dev/earthbucks/ts/node_modules/.pnpm/@tensorflow+tfjs-node@4.20.0_seedrandom@3.0.5/node_modules/@tensorflow/tfjs-node
 ELIFECYCLE  Command failed with exit code 1.
```

Is this caused by missing distutils?

See [this stack overflow issue](https://stackoverflow.com/questions/77247893/modulenotfounderror-no-module-named-distutils-in-python-3-12) for more information.

Can I fix this?

>> install setuptools, which now also provides distutils

Tried installing via homebrew:

```zsh
brew install setuptools
```

That did not work:

```zsh
ModuleNotFoundError: No module named 'distutils'
```

Trying again with:
```zsh
brew install python-setuptools
```

That worked! For future reference, here is my version of python, installed with homebrew:

```zsh
ryan ~/dev/earthbucks/ts/earthbucks-pow $ python3 --version
Python 3.12.3
```