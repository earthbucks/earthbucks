import { createTRPCProxyClient } from "@trpc/client";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./trpc-router-types.js";
import { Header } from "@earthbucks/lib";
import { Domain } from "@earthbucks/lib";
import type { FixedBuf, WorkPack } from "@earthbucks/lib";

export const createTRPCClient = (DOMAIN: string, apiKey: string) => {
  let headers: Record<string, string> = {};
  if (typeof document !== "undefined") {
    // browser
    document.cookie = `authSession=${apiKey}`;
  } else {
    // node.js
    headers = {
      cookie: `authSession=${apiKey}`,
    };
  }
  const trpc = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${Domain.domainToBaseUrl(DOMAIN)}/trpc`,
        headers,
      }),
    ],
  });
  return trpc;
};

export const createPVClient = (DOMAIN: string, apiKey: string) => {
  const trpc = createTRPCClient(DOMAIN, apiKey);
  return {
    testQuery: async () => {
      const res = await trpc.testQuery.query();
      return res;
    },
    powValidator: {
      getHeader: async (): Promise<Header> => {
        const res = await trpc.powValidator.getHeader.query();
        return Header.fromHex(res);
      },

      validateWorkPackPow: async (input: {
        workPack: WorkPack;
      }) => {
        const { workPack } = input;
        const res = await trpc.powValidator.validateWorkPackPow.mutate({
          workPack: workPack.toHex(),
        });
        return res;
      },
    },
  };
};
