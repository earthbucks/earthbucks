import type {
  ActionFunctionArgs,
  LoaderFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect, useLoaderData, useNavigate } from "@remix-run/react";
import Button from "~/button";
import Footer from "~/components/footer";
import { Buffer } from "buffer";
import { blake3PowAsync, blake3Sync } from "earthbucks-blake3/src/blake3-async";
import Header from "~/components/header";
import { signout } from "./api.auth.$method";
import PrivKey from "earthbucks-lib/src/priv-key";
import PubKey from "earthbucks-lib/src/pub-key";
import { getSession, getUserPubKey } from "~/.server/session";
import { DOMAIN, DOMAIN_PUB_KEY } from "~/.server/config";

export async function loader({ request }: LoaderFunctionArgs) {
  const DOMAIN_PUB_KEY_STR = DOMAIN_PUB_KEY.toStringFmt();

  let userPubKey = await getUserPubKey(request);
  if (!userPubKey) {
    return redirect("/signin");
  }

  return json({
    DOMAIN,
    DOMAIN_PUB_KEY_STR,
    userPubKeyStr: userPubKey.toStringFmt(),
  });
}

export const meta: MetaFunction = () => {
  return [
    { title: "Home | Compubutton" },
    { name: "description", content: "Welcome to Compubutton!" },
  ];
};

export default function Landing() {
  const { DOMAIN, DOMAIN_PUB_KEY_STR, userPubKeyStr } =
    useLoaderData<typeof loader>();

  const navigate = useNavigate();

  async function onSignin() {
    navigate("/signin");
  }

  async function onRegister() {
    navigate("/new");
  }
  return (
    <div className="">
      <Header />
      <hr className="mx-auto my-4 max-w-[40px] border-gray-400 dark:border-gray-600" />
      <div className="mx-auto max-w-[400px]">
        <div className="my-4 text-center text-black dark:text-white">
          You are signed in as:
          <br />
          {userPubKeyStr}
        </div>

        <div className="mx-auto text-center">
          <button
            onClick={async (e) => {
              await signout(DOMAIN);
              navigate("/");
            }}
            className="border-button-blue-700 bg-button-blue-700 hover:bg-primary-blue-500 w-[100px] rounded-full border-[3px] p-2 font-bold text-white hover:border-white hover:outline hover:outline-2 hover:outline-black hover:dark:border-white"
          >
            Sign out
          </button>
        </div>
      </div>
      <hr className="mx-auto my-4 max-w-[40px] border-gray-400 dark:border-gray-600" />
      <Footer />
    </div>
  );
}
