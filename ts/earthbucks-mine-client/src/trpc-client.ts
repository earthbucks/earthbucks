import { createTRPCProxyClient } from "@trpc/client";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./trpc-router-types.js";
import {
  BlockMessageHeader,
  BufReader,
  CompuchaChallenge,
  Header,
  PubKey,
  SigninChallenge,
  SysBuf,
  U256,
  U64,
  Domain,
} from "@earthbucks/lib";
import { FixedBuf, PrivKey, SigninResponse } from "@earthbucks/lib";

export const createTRPCClient = (domain: string, sessionToken?: string) => {
  let headers: Record<string, string> = {};
  if (sessionToken) {
    if (typeof document !== "undefined") {
      // browser
      document.cookie = `__session=${sessionToken}`;
    } else {
      // node.js
      headers = {
        cookie: `__session=${sessionToken}`,
      };
    }
  }
  const trpcClient = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${Domain.domainToBaseUrl(domain)}/trpc`,
        headers,
      }),
    ],
  });
  return trpcClient;
};

export const createMineClient = (domain: string, sessionToken?: string) => {
  const trpcClient = createTRPCClient(domain, sessionToken);
  return {
    auth: {
      getSigninChallenge: async () => {
        const res = await trpcClient.auth.getSigninChallenge.query();
        const signinChallenge = SigninChallenge.fromHex(res, domain);
        return signinChallenge;
      },
      postSigninResponse: async (signinResponse: SigninResponse) => {
        const sessionToken = await trpcClient.auth.postSigninResponse.mutate(
          signinResponse.toHex(),
        );
        return sessionToken;
      },
      signout: async () => {
        await trpcClient.auth.signout.mutate();
      },
    },
    blockMessage: {
      getLatest: async () => {
        const res = await trpcClient.blockMessage.getLatest.query();
        if (!res.id || !res.num) {
          return null;
        }
        return {
          id: FixedBuf.fromHex(32, res.id),
          num: new U64(res.num),
        };
      },
      postNew: async (
        blockMessageHeader: BlockMessageHeader,
        message: string,
      ) => {
        await trpcClient.blockMessage.postNew.mutate({
          blockMessageHeader: blockMessageHeader.toHex(),
          message,
        });
      },
    },
    miningTestButton: {
      getNewHeader: async () => {
        const res = await trpcClient.miningTestButton.getNewHeader.query();
        return {
          shareId: res.shareId,
          shareTarget: U256.fromHex(res.shareTarget),
          header: Header.fromHex(res.header),
          lch10Ids: res.lch10Ids.map((idHex: string) =>
            FixedBuf.fromHex(32, idHex),
          ),
        };
      },
      postHeader: async (
        shareId: number,
        header: Header,
        count: number,
        duration: number,
      ) => {
        await trpcClient.miningTestButton.postHeader.mutate({
          shareId,
          header: header.toHex(),
          count,
          duration,
        });
      },
    },
    userAvatar: {
      uploadAvatar: async (avatarBuf: SysBuf) => {
        const avatar = avatarBuf.toString("base64");
        await trpcClient.userAvatar.uploadAvatar.mutate(avatar);
      },
    },
    userChallenge: {
      getCompuchaChallenge: async () => {
        const res = await trpcClient.userChallenge.getCompuchaChallenge.query();
        return CompuchaChallenge.fromHex(res);
      },
      postCompuchaResponse: async (compuchaChallenge: CompuchaChallenge) => {
        await trpcClient.userChallenge.postCompuchaResponse.mutate(
          compuchaChallenge.toHex(),
        );
      },
    },
    userName: {
      isUserNameAvailable: async (userName: string) => {
        const res =
          await trpcClient.userName.isUserNameAvailable.query(userName);
        return res;
      },
      setUserName: async (userName: string) => {
        await trpcClient.userName.setUserName.mutate(userName);
      },
    },
  };
};

export async function signin(
  DOMAIN: string,
  DOMAIN_PUB_KEY_STR: string,
  userPrivKey: PrivKey,
) {
  const mineClient = createMineClient(DOMAIN);

  // get signin challenge
  const signinChallenge = await mineClient.auth.getSigninChallenge();

  // verify signin challenge
  const DOMAIN_PUB_KEY = PubKey.fromString(DOMAIN_PUB_KEY_STR);
  const isValidChallenge = signinChallenge.isValid(DOMAIN_PUB_KEY, DOMAIN);
  if (!isValidChallenge) {
    throw new Error("Invalid signin challenge");
  }

  // create signin response
  const signinResponse = SigninResponse.fromSigninChallenge(
    userPrivKey,
    DOMAIN,
    DOMAIN_PUB_KEY,
    signinChallenge,
  );

  const sessionToken = await mineClient.auth.postSigninResponse(signinResponse);
  return sessionToken;
}

export async function signout(DOMAIN: string) {
  const mineClient = createMineClient(DOMAIN);
  await mineClient.auth.signout();
}
