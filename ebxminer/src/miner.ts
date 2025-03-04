import { Buffer } from "buffer";
import { FixedBuf, Header, U256, WorkPack } from "@earthbucks/lib";
import { blake3 } from "@noble/hashes/blake3";
import chalk from "chalk";
import { WebBuf } from "webbuf";
import { BlockchainClient } from "./blockchain.js";
import { success } from "./icon.js";
import createAlgo1627, { Algo1627 } from "./algo1627.js";
import {
  accepted,
  addMessage,
  blocks,
  found,
  hashRate,
  rejected,
  gpu,
} from "./signals.js";
import { formatNumber, g } from "./utils.js";
import { getNavigator } from "./navigator.js";

let algo1627: Algo1627;

export function initMiner(deviceNum: number) {
  const nav = getNavigator();
  nav.gpu.requestAdapter().then((adapter: GPUAdapter | null) => {
    if (adapter) {
      gpu.value =
        adapter.info.device ||
        adapter.info.vendor ||
        adapter.info.architecture ||
        "Unknown GPU";
      console.log(`Found GPU %d: %s`, deviceNum, chalk.cyanBright(gpu.value));
    }
  });
}

export async function miningLoop(blockchain: BlockchainClient) {
  if (!gpu.value) {
    addMessage("No GPU found");
    return;
  }
  addMessage("Starting miner");
  algo1627 = await createAlgo1627();

  while (true) {
    const { shareId, shareTarget, workPack } = await blockchain.getWorkPack();
    const header = workPack.header;
    if (
      header.workSerAlgoStr() !== "blake3_3" ||
      header.workParAlgoStr() !== "algo1627"
    ) {
      throw new Error("Unsupported PoW algorithms");
    }
    let workingHeader = header.toWorkingHeader();

    const start = Date.now();
    let count = 0;
    let foundNonce = false;
    for (;;) {
      count++;
      workingHeader = workingHeader.toWorkingHeader();
      const workingBlockId = workingHeader.id().buf;

      const lch10Ids = [...workPack.lch10Ids.ids].reverse().map((id) => id.buf);
      const inputData = WebBuf.concat([
        workingBlockId,
        ...lch10Ids,
        workingBlockId,
      ]);

      const parHash = WebBuf.from(await algo1627(inputData));
      workingHeader.workParHash = new FixedBuf(
        32,
        Buffer.from(parHash.buffer, 0, 32),
      );
      workingHeader.workSerHash = new FixedBuf(
        32,
        Buffer.from(blake3(blake3(blake3(workingBlockId))).buffer, 0, 32),
      );
      const idNum = workingHeader.idNum();
      if (idNum.bn < shareTarget.bn) {
        const diff = Header.difficultyFromTarget(idNum);
        addMessage(`[${shareId}] nonce found diff ${formatNumber(diff.n)}`);
        foundNonce = true;
        break;
      }
      if (Date.now() - start > 10000) {
        addMessage("Timed out, no nonce found");
        break;
      }
      workingHeader.nonce = workingHeader.nonce.add(new U256(1));
    }

    const end = Date.now();
    const duration = end - start;

    hashRate.value = (count / duration) * 1000;
    if (!foundNonce) {
      continue;
    }
    const resWorkPack = new WorkPack(workingHeader, workPack.lch10Ids);
    found.value += 1;
    blockchain
      .postWorkPack(shareId, resWorkPack, count, duration)
      .then((response) => {
        if (response.isValidBlock) {
          addMessage(`[${shareId}] ${g(`block found! ${success}`)}`);
          accepted.value += 1;
          blocks.value += 1;
        } else if (response.isValidShare) {
          addMessage(
            `[${shareId}] ${chalk.green(`share accepted ${success}`)}`,
          );
          accepted.value += 1;
        } else {
          addMessage(`[${shareId}] ${chalk.red("share rejected")}`);
          addMessage(JSON.stringify(response));
          rejected.value += 1;
        }
      });
  }
}
