import esbuild from "esbuild";

export const metadata = `// ==UserScript==
// @name         EBX WebGPU Miner
// @namespace    http://tampermonkey.net/
// @version      2024-12-20
// @description  EBX WebGPU Miner
// @author       You
// @match        https://earthbucks.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=earthbucks.com
// @grant        none
// ==/UserScript==`;

esbuild.build({
  entryPoints: ["src/web.tsx"],
  bundle: true,
  minify: true,
  outfile: "dist-web/ebxminer.user.js",
  banner: {
    js: metadata,
  },
});
