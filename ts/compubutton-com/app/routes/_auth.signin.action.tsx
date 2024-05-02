import type {
  ActionFunctionArgs,
} from "@remix-run/node";
import { Link, json, useFetcher } from "@remix-run/react";
import {
  createNewAuthSigninToken,
  getAuthSigninToken,
} from "earthbucks-db/src/models/auth-signin-token";

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const method = `${formData.get("method")}`;
  if (method === "new-auth-signin-token") {
    let tokenId = await createNewAuthSigninToken();
    console.log(tokenId.toString("hex"));
    let token = await getAuthSigninToken(tokenId);
    console.log(token?.id.toString("hex"));
    console.log(token);
    return json({ tokenId: tokenId.toString("hex") });
  } else {
    throw new Response("Method not allowed", { status: 405 });
  }
}
