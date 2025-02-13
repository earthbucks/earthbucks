#!/bin/zsh

wasm-pack build --target bundler --out-dir build/bundler --release -- --features wasm
rm build/bundler/.gitignore
rm build/bundler/package.json
rm build/bundler/README.md
