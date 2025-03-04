import { signal } from "@preact/signals-react";
import { format } from "date-fns";

export const messages = signal<string[]>([]);

export function addMessage(message: string) {
  const time = format(new Date(), "pp");
  const msg = `[${time}] ${message}`;
  console.log(msg);
  //messages.value = messages.value.slice(-200).concat(msg);
}

export const currentDifficulty = signal(2000);
export const gpu = signal("");

export const found = signal(0);
export const accepted = signal(0);
export const rejected = signal(0);
export const blocks = signal(0);
export const hashRate = signal(0);
