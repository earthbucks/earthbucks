#!/bin/zsh

wasm-pack build --target bundler --out-dir build/bundler --release
rm build/bundler/.gitignore
