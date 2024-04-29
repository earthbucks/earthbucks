import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Computcha" },
    { name: "description", content: "Welcome to Computcha!" },
  ];
};

export default function Index() {
  return (
    <div className="">
      <div className="mb-4 mt-4 flex">
        <div className="mx-auto">
          <div className="inline-block align-middle">
            <img
              src="/computcha-logo.png"
              alt=""
              className="mx-auto mb-4 block aspect-square w-[120px] rounded-full bg-[#020a2c] p-[1px] shadow-lg shadow-[#04408d]"
            />
            <div className="hidden dark:block">
              <img
                src="/computcha-text-white.png"
                alt="Computcha"
                className="mx-auto block w-[300px]"
              />
            </div>
            <div className="block dark:hidden">
              <img
                src="/computcha-text-black.png"
                alt="Computcha"
                className="mx-auto block w-[300px]"
              />
            </div>
            <div className="mt-4 text-center text-black dark:text-white">
              Proof-of-GPU in a web browser.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
