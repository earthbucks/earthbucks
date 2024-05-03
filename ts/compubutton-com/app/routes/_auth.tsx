import type { MetaFunction } from "@remix-run/node";
import Footer from "~/components/footer";
import { Outlet } from "@remix-run/react";
import { Buffer } from "buffer";
import Logo from "~/components/logo";

export const meta: MetaFunction = () => {
  return [
    { title: "Compubutton" },
    { name: "description", content: "Welcome to Compubutton!" },
  ];
};

export default function Landing() {
  return (
    <div className="">
      <div className="my-4 flex">
        <div className="mx-auto">
          <div className="inline-block align-middle">
            <Logo />
          </div>
        </div>
      </div>

      <Outlet />

      <hr className="mx-auto my-4 max-w-[40px] border-gray-400 dark:border-gray-600" />
      <Footer />
    </div>
  );
}
