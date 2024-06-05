# earthbucks_pow

Website: [earthbucks.com](https://earthbucks.com)

## Overview

This library includes proof-of-work (PoW) methods for EarthBucks, including
generating and verifying PoW. It depends primarily on TensorFlow to provide GPU
calculations, and also uses ndarray for CPU calculations.

## Building on macOS

To build earthbucks_pow, you will first need to install and build TensorFlow.

To do this, you will need to:
- Install homebrew
- Install python-setuptools from homebrew
- Install bazelisk from homebrew
- Install numpy from homebrew
- "brew doctor" to fix numpy
  - brew link --overwrite numpy
- Install libtensorflow with homebrew
- Install pkg-config with homebrew
- Create a new file called:

`~/.pkg_configs/tensorflow.pc`

Containing:

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

And then run:

```zsh
PKG_CONFIG_PATH=~/.pkg_configs/ cargo build
```

...to build earthbucks_pow.

Please see [docs/tensorflow.md](docs/tensorflow.md) for more information about building TensorFlow.
