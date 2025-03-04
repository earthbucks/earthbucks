import { WorkPack, U256 } from "@earthbucks/lib";
import { addMessage, currentDifficulty } from "./signals.js";

type WorkPackResponse = {
  shareId: number;
  retryTarget: U256;
  shareTarget: U256;
  workPack: WorkPack;
};

type PostWorkPackResponse = {
  shareId: number;
  isValidShare: boolean;
  isValidBlock: boolean;
};

export class BlockchainClient {
  sessionId?: string;
  workPackQueue: WorkPackResponse[] = [];

  constructor(sessionId?: string) {
    this.sessionId = sessionId;
  }

  async getNewWorkPack(): Promise<WorkPackResponse> {
    const response = await fetch(
      "https://earthbucks.com/trpc/miningButton.getNewWorkPack?batch=1&input=%7B%7D",
      this.sessionId
        ? {
            headers: {
              Cookie: `__session=${this.sessionId}`,
            },
          }
        : undefined,
    );
    const data = (await response.json())[0].result.data;
    return {
      shareId: data.shareId,
      retryTarget: U256.fromHex(data.retryTarget),
      shareTarget: U256.fromHex(data.shareTarget),
      workPack: WorkPack.fromHex(data.workPack),
    };
  }

  async postWorkPack(
    shareId: number,
    workPack: WorkPack,
    count: number,
    duration: number,
  ): Promise<PostWorkPackResponse> {
    const data = { count, duration, shareId, workPack: workPack.toHex() };
    const response = await fetch(
      "https://earthbucks.com/trpc/miningButton.postWorkPack",
      {
        method: "POST",
        headers: {
          ...(this.sessionId
            ? {
                Cookie: `__session=${this.sessionId}`,
              }
            : undefined),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );
    const result = await response.json();
    return result.result.data;
  }

  async queueWorkPack() {
    const newWorkPack = await this.getNewWorkPack();
    currentDifficulty.value = newWorkPack.workPack.header.difficulty().n;
    this.workPackQueue.push(newWorkPack);
    if (this.workPackQueue.length > 3) {
      this.workPackQueue.shift();
    }
  }

  async getWorkPack() {
    const workPack = this.workPackQueue.shift();

    if (!workPack) {
      const newWorkPack = await this.getNewWorkPack();
      currentDifficulty.value = newWorkPack.workPack.header.difficulty().n;
      return newWorkPack;
    }

    return workPack;
  }

  start() {
    setInterval(() => {
      if (this.workPackQueue.length < 3) {
        this.queueWorkPack();
      }
    }, 5000);
  }
}
