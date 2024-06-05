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
...
│ ModuleNotFoundError: No module named 'distutils'
...
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

#### TensorFlow for rust on macOS

Attempting [simple instructions](https://github.com/tensorflow/rust) first.

The first error I get is this:

```zsh
cargo:error=Bazel must be installed at version 3.7.2 or greater. (Error: No such file or directory (os error 2))
```

Now I will attempt to install Bazel. [Instructions for installing bazel are here.](https://bazel.build/install/os-x)

[Bazelisk is recommended](https://bazel.build/install/bazelisk) so I'm trying that first.

Installation instructions:

```zsh
brew install bazelisk
```

Cargo.toml:

```zsh
tensorflow = "0.21.0"
```

That worked. Trying build:

```zsh
cargo build
```

It doesn't work. Some errors:

```zsh
ModuleNotFoundError: No module named 'numpy'
Is numpy installed?
```

Note that numpy is indeed listed as a depdendency. Python dependencies include:
- Python Dependencies numpy, dev, pip and wheel

Let's try to install all these with homebrew

```zsh
brew install numpy
```

dev: can't find this package. skipping for now.

pip: already installed

wheel: can't find this package. skipping for now.

Trying again:

```zsh
cargo build
```

Error:

```zsh
AttributeError: module 'numpy' has no attribute 'get_include'
```

Searching reveals to attempt this:

```zsh
brew doctor
```

Indeed, this reveals an issue:

```zsh
Warning: You have unlinked kegs in your Cellar.
Leaving kegs unlinked can lead to build-trouble and cause formulae that depend on
those kegs to fail to run properly once built. Run `brew link` on these:
  numpy
```

Trying this:

```zsh
brew link --overwrite numpy
```

Trying again:
```zsh
cargo build
```

Error:

```zsh
...
  ERROR: /Users/ryan/.cargo/registry/src/index.crates.io-6f17d22bba15001f/tensorflow-sys-0.24.0/target/source-v2.13.0/tensorflow/BUILD:1134:21: declared output 'tensorflow/libtensorflow_framework.2.dylib' was not created by genrule. This is probably because the genrule actually didn't create this output, or because the output was a directory and the genrule was run remotely (note that only the contents of declared file outputs are copied from genrules run remotely)
  ERROR: /Users/ryan/.cargo/registry/src/index.crates.io-6f17d22bba15001f/tensorflow-sys-0.24.0/target/source-v2.13.0/tensorflow/BUILD:1134:21: Executing genrule //tensorflow:libtensorflow_framework.2.dylib_sym [for host] failed: not all outputs were created or valid
...
```

No clear error message here.

I'm going to try to build tensorflow myself, [as suggested by this gist here](https://gist.github.com/lnshi/eb3dea05d99daba5c932bbc786cc3701).

By building it myself first and installing it on my system, supposedly the rust tensorflow library will be able to find it and use it.

... wait. I occurs to me if I can build it and install it, that there might be a build available already. Indeed, there is one on homebrew;

```zsh
$ brew info libtensorflow
==> libtensorflow: stable 2.16.1 (bottled)
C interface for Google's OS library for Machine Intelligence
https://www.tensorflow.org/
Not installed
From: https://github.com/Homebrew/homebrew-core/blob/HEAD/Formula/lib/libtensorflow.rb
License: Apache-2.0
==> Dependencies
Build: bazelisk ✔, numpy ✔, python@3.12 ✔, gnu-getopt ✘
==> Analytics
install: 987 (30 days), 2,051 (90 days), 5,748 (365 days)
install-on-request: 987 (30 days), 2,045 (90 days), 5,709 (365 days)
build-error: 48 (30 days)
```

I'll try installing this:

```zsh
brew install libtensorflow
```

That seems to have worked. Let's try building the rust tensorflow library again:

```zsh
cargo build
```

That didn't work. But re-reading documentation, I should run this instead:

```zsh
cargo build -j 1
```

No. That took longer, but it still didn't work. Errors:

```zsh
ERROR: /Users/ryan/.cargo/registry/src/index.crates.io-6f17d22bba15001f/tensorflow-sys-0.24.0/target/source-v2.13.0/tensorflow/BUILD:1134:21: declared output 'tensorflow/libtensorflow_framework.2.dylib' was not created by genrule. This is probably because the genrule actually didn't create this output, or because the output was a directory and the genrule was run remotely (note that only the contents of declared file outputs are copied from genrules run remotely)
  ERROR: /Users/ryan/.cargo/registry/src/index.crates.io-6f17d22bba15001f/tensorflow-sys-0.24.0/target/source-v2.13.0/tensorflow/BUILD:1134:21: Executing genrule //tensorflow:libtensorflow_framework.2.dylib_sym [for host] failed: not all outputs were created or valid
  realpath: illegal option -- -
  usage: realpath [-q] [path ...]
  Target //tensorflow:libtensorflow.dylib failed to build
  Use --verbose_failures to see the command lines of failed build steps.
  INFO: Elapsed time: 425.315s, Critical Path: 10.52s
  INFO: 946 processes: 232 internal, 714 local.
  FAILED: Build did NOT complete successfully
  FAILED: Build did NOT complete successfully
  thread 'main' panicked at /Users/ryan/.cargo/registry/src/index.crates.io-6f17d22bba15001f/tensorflow-sys-0.24.0/build.rs:428:9:
  failed to execute cd "/Users/ryan/.cargo/registry/src/index.crates.io-6f17d22bba15001f/tensorflow-sys-0.24.0/target/source-v2.13.0" && "bazel" "build" "--jobs=1" "--compilation_mode=opt" "--copt=-march=native" "tensorflow:libtensorflow.dylib"
  note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

It looks to me like it is not able to find the libtensorflow package that I have installed with homebrew.

Trying again in a new terminal just to see if some sort of PATH issue is at cause:

```zsh
cargo build
```

No. Failed again. Same errors.

I found the homebrew libraries:
```zsh
$ ls /opt/homebrew/lib/libtensorflow*
/opt/homebrew/lib/libtensorflow.2.16.1.dylib           /opt/homebrew/lib/libtensorflow.dylib                  /opt/homebrew/lib/libtensorflow_framework.2.dylib
/opt/homebrew/lib/libtensorflow.2.dylib                /opt/homebrew/lib/libtensorflow_framework.2.16.1.dylib /opt/homebrew/lib/libtensorflow_framework.dylib
```

I may need to execute this:
```zsh
export LDFLAGS="-L/opt/homebrew/lib"
export CPPFLAGS="-I/opt/homebrew/include"
```

Trying to build again:

```zsh
$ echo $LDFLAGS
-L/opt/homebrew/lib
$ echo $CPPFLAGS
-I/opt/homebrew/include
$ cargo build
...
```

Re-reading [this git](https://gist.github.com/lnshi/eb3dea05d99daba5c932bbc786cc3701), it seems I may need to use pkg-config to get the C++ build process to actually see the tensorflow library.

I'm going to try this before building tensorflow myself, since it does seem to actually be installed by homebrew.

First

```zsh
brew install pkg-config
```

Now, create tensorflow.pc:
```
libdir=/opt/homebrew/lib
includedir=/opt/homebrew/include/tensorflow

Name: TensorFlow
Version: 2.8.0
Description: Library for computation using data flow graphs for scalable machine learning
Requires:
Libs: -L${libdir} -ltensorflow -ltensorflow_framework
Cflags: -I${includedir}
```

Now put that file in:
```
~/.pkg_configs/tensorflow.pc
```

Now you should be able to run this:

```zsh
$ PKG_CONFIG_PATH=~/.pkg_configs/ pkg-config --list-all | grep tensorflow
tensorflow               TensorFlow - Library for computation using data flow graphs for scalable machine learning
```

Now set this before running "cargo build":

```zsh
export PKG_CONFIG_PATH=~/.pkg_configs/
```

To my shock, this actually worked!

```zsh
$ cargo build
   Compiling libz-sys v1.1.18
   Compiling bzip2-sys v0.1.11+1.0.8
   Compiling curl-sys v0.4.72+curl-8.6.0
   Compiling curl v0.4.46
   Compiling bzip2 v0.4.4
   Compiling zip v0.6.6
   Compiling tensorflow-sys v0.24.0
   Compiling tensorflow v0.21.0
   Compiling earthbucks_pow v0.1.0 (/Users/ryan/dev/earthbucks/rs/earthbucks_pow)
    Finished dev [unoptimized + debuginfo] target(s) in 14.03s
```

It compiled with no errors!

Confirmed I am able to re-build with:

```zsh
cargo clean
```

```zsh
PKG_CONFIG_PATH=~/.pkg_configs/ cargo build
```

Now to test it.
