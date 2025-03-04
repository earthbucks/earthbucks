import { effect } from "@preact/signals-react";
import chalk from "chalk";
import { initMiner, miningLoop } from "./miner.js";
import {
  accepted,
  blocks,
  currentDifficulty,
  hashRate,
  rejected,
} from "./signals.js";
import { formatNumber, g } from "./utils.js";
import { BlockchainClient } from "./blockchain.js";

declare global {
  function startMining(delay?: number): void;
}

console.log(g("Welcome to EBX Miner. Type startMining(); to start the miner."));

initMiner(0);

globalThis.startMining = () => {
  miningLoop(new BlockchainClient());
  document.body.innerHTML = "";
  document.documentElement.style.backgroundColor = "black";
  effect(() => {
    document.body.innerHTML = `
<div style="display: flex; flex-direction: column; width: 100vw; height: 100vh; align-items: center; justify-content: center">
  <div style="font-size: 3rem; color: white;">${formatNumber(hashRate.value)} w/s</div>
  <div style="margin-top: 1rem; font-size: 1.5rem; color: white;">Accepted: ${formatNumber(accepted.value)} | Rejected: ${formatNumber(rejected.value)} | Blocks: ${formatNumber(blocks.value)}</div>
</div>`;
  });
  setInterval(() => {
    console.log(
      `${chalk.blue("Hash rate")}: %s ${chalk.blue("Difficulty")} %s`,
      formatNumber(hashRate.value),
      currentDifficulty.value,
    );
  }, 30000);
};
