# @earthbucks/lib

Website: [earthbucks.com](https://earthbucks.com)

Source code: [github.com/earthbucks/earthbucks](https://github.com/earthbucks/earthbucks)

## Overview

This library contains data structures and algorithms for EarthBucks. This library
is co-implemented in both Rust and TypeScript.

This TypeScript packages includes both the built JavaScript code and the
original TypeScript source code as well.

If you are using JavaScript, you will have to use the JavaScript version.

If you are using TypeScript, you can still use the JavaScript version, because
the .d.ts files are included. However, you can also use the TypeScript source
code directly.

## Usage

The library is built from TyepScript to JavaScript and JavaScript is the default
because that is standard on NPM. However, we expose the TypeScript source code
as well, so you can use that if you find it preferable.

### In JavasScript

```js
import { PrivKey } from "@earthbucks/lib";
```

Notice that the JavaScript version is the default.

### In TypeScript

```ts
import { PrivKey } from "@earthbucks/lib/src/index.js";
```

Even though this is TypeScript, you must use the .js extension in order to make
sure that the imports continue to work when built to JavaScript.

## Full Documentation

Please find all modules in the index.ts (or index.js) file.

Full documentation forth-coming.
