# earthbucks-lib

Website: [earthbucks.com](https://earthbucks.com)

## Overview

This library contains data structures and algorithms for EarthBucks. This library
is co-implemented in both Rust and TypeScript.

This TypeScript packages includes both the built JavaScript code and the
original TypeScript source code as well.

If you are using JavaScript, you will have to use the JavaScript version.

If you are using TypeScript, you should use the TypeScript source code rather
than the JavaScript version, because that way errors will go directly to the
TypeScript source code rather than the .d.ts files.

## Usage

The library is built from TyepScript to JavaScript and JavaScript is the default
because that is standard on NPM. However, it is recommended that you use the
TypeScript version if possible.

### In TypeScript

```ts
import { PrivKey } from "earthbucks-lib/src/lib.js";
```

Even though this is TypeScript, you must use the .js extension in order to make
sure that the imports continue to work when built to JavaScript.

### In JavasScript

```js
import { PrivKey } from "earthbucks-lib";
```

Notice that the JavaScript version is the default.

## Full Documentation

Please find all modules in the lib.ts (or lib.js) file.

Full documentation forth-coming.
