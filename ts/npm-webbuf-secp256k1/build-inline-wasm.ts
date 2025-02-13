import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { dirname } from "path";
import { fileURLToPath } from "url";

// Define constants for filenames
const NAME = "webbuf_secp256k1";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("Current directory:", __dirname);

// First: Convert WASM to Base64 and write to a JS file
const wasmPath = join(
  __dirname,
  "src",
  `rs-${NAME}-bundler`,
  `${NAME}_bg.wasm`,
);
const wasmBase64 = readFileSync(wasmPath).toString("base64");

const wasmJsCode = `
import * as ${NAME}_bg from './${NAME}_bg.js';
const wasmBase64 = "${wasmBase64}";
const wasmBinary = Uint8Array.from(atob(wasmBase64), c => c.charCodeAt(0));
const wasmModule = new WebAssembly.Module(wasmBinary);
const importObject = { './${NAME}_bg.js': ${NAME}_bg };
const wasm = new WebAssembly.Instance(wasmModule, importObject).exports;
export { wasm };
`;

const wasmJsOutputPath = join(
  __dirname,
  "src",
  `rs-${NAME}-inline-base64`,
  `${NAME}_bg.wasm.js`,
);
writeFileSync(wasmJsOutputPath, wasmJsCode);

// Second: Write the .d.ts file for the WASM JS file
const wasmDTsCode = `declare const wasm: string;
export { wasm };
`;

const wasmDTsOutputPath = join(
  __dirname,
  "src",
  `rs-${NAME}-inline-base64`,
  `${NAME}_bg.wasm.d.ts`,
);
writeFileSync(wasmDTsOutputPath, wasmDTsCode);

// Third: Modify the original JS file to import the new WASM JS file
const originalFilePath = join(
  __dirname,
  "src",
  `rs-${NAME}-bundler`,
  `${NAME}.js`,
);
const originalCode = readFileSync(originalFilePath, "utf-8");

// Define the expected import line
const expectedImport = `import * as wasm from "./${NAME}_bg.wasm";`;

// Check for the presence of the expected import
if (!originalCode.startsWith(expectedImport)) {
  throw new Error(
    `Expected original JS file to start with '${expectedImport}'`,
  );
}

// New Check: Ensure no other .wasm imports exist
const wasmImportRegex = /import .* from ['"].*\.wasm['"];?/g;
const matches = originalCode.match(wasmImportRegex);

// If there are any other .wasm imports, throw an error
// biome-ignore lint:
if (matches && matches.some((line) => line !== expectedImport)) {
  throw new Error(
    `Unexpected .wasm import detected:\n${matches.filter((line) => line !== expectedImport).join("\n")}`,
  );
}

// Replace the import line with the new import
const modifiedCode = originalCode.replace(
  expectedImport,
  `import { wasm } from "./${NAME}_bg.wasm.js";`,
);

// Write the modified code to the output file
const outputFilePath = join(
  __dirname,
  "src",
  `rs-${NAME}-inline-base64`,
  `${NAME}.js`,
);
writeFileSync(outputFilePath, modifiedCode);

console.log(`Modified WASM code written to ${outputFilePath}`);
