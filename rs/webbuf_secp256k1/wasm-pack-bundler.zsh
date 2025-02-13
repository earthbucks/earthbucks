#!/bin/zsh

wasm-pack build --target bundler --out-dir build/bundler --release -- --features wasm
rm build/bundler/.gitignore
rm build/bundler/README.md
rm build/bundler/LICENSE
rm build/bundler/package.json
