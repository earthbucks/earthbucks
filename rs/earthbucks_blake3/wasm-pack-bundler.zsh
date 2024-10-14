#!/bin/zsh

wasm-pack build --target bundler --out-dir build/bundler --release -- --features wasm
rm build/bundler/.gitignore
