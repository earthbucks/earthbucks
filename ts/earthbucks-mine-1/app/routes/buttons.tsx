import type { MetaFunction } from "@remix-run/node";
import Button from "../button";
import { $image } from "~/util";

export const meta: MetaFunction = () => {
  return [
    { title: "Button Modes Demonstration | EarthBucks Mine 1" },
    { name: "description", content: "Welcome to EarthBucks Mine 1!" },
  ];
};

export default function Landing() {
  return (
    <div className="">
      <div className="mx-auto my-4 text-center text-black dark:text-white">
        Button modes demonstration.
      </div>
      <div className="mx-auto my-4 w-[320px]">
        <Button initialText="Standard" />
      </div>
      <div className="mx-auto my-4 w-[320px]">
        <Button initialText="EarthBucks" mode="pay" />
      </div>
      <div className="mx-auto my-4 w-[320px]">
        <Button initialText="Computcha" mode="computcha" />
      </div>
      <div className="mx-auto my-4 w-[320px]">
        <Button initialText="Computcha" mode="mine" />
      </div>
      <div className="mx-auto my-4 w-[320px]">
        <Button initialText="Compusecret" mode="secret" />
      </div>
      <div className="mx-auto my-4 w-[320px]">
        <Button initialText="Compucredits" mode="credits" />
      </div>
      <div className="mx-auto my-4 w-[320px]">
        <Button initialText="Artintellica" mode="ai" />
      </div>
    </div>
  );
}
