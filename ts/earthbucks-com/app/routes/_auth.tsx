import type { MetaFunction } from "@remix-run/node";
import Footer from "~/components/footer";
import { Outlet } from "@remix-run/react";
import { Buffer } from "buffer";
import Logo from "~/components/logo";

export const meta: MetaFunction = () => {
  return [
    { title: "EarthBucks" },
    { name: "description", content: "Welcome to EarthBucks!" },
  ];
};

export default function Auth() {
  return (
    <div className="">
      <div className="mx-auto my-4">
        <Logo />
      </div>
      <Outlet />
      <hr className="mx-auto my-4 max-w-[40px] border-gray-400 dark:border-gray-600" />
      <Footer />
    </div>
  );
}
