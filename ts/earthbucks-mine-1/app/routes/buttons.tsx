import type { MetaFunction } from "@remix-run/node";
import Button from "../components/button";

export const meta: MetaFunction = () => {
  return [
    { title: "Button Modes Demonstration | EarthBucks Mine 1" },
    { name: "description", content: "Welcome to EarthBucks Mine 1!" },
  ];
};

export default function Buttons() {
  return (
    <div className="">
      <div className="mx-auto my-4 text-center text-black dark:text-white">
        Button modes demonstration.
      </div>
      <div className="mx-auto my-4 w-[320px]">
        <Button initialText="Standard" delayComputedMs={200} />
      </div>
      <div className="mx-auto my-4 w-[320px]">
        <Button initialText="EarthBucks" mode="pay" delayComputedMs={200} />
      </div>
      <div className="mx-auto my-4 w-[320px]">
        <Button
          initialText="Computcha"
          mode="computcha"
          delayComputedMs={200}
        />
      </div>
      <div className="mx-auto my-4 w-[320px]">
        <Button initialText="Computcha" mode="mine" delayComputedMs={200} />
      </div>
      <div className="mx-auto my-4 w-[320px]">
        <Button initialText="Compusecret" mode="secret" delayComputedMs={200} />
      </div>
      <div className="mx-auto my-4 w-[320px]">
        <Button
          initialText="Compucredits"
          mode="credits"
          delayComputedMs={200}
        />
      </div>
      <div className="mx-auto my-4 w-[320px]">
        <Button initialText="Artintellica" mode="ai" delayComputedMs={200} />
      </div>
    </div>
  );
}
