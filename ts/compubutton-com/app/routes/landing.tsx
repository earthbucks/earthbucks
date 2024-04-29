import type { MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import Button from "~/button";

export const meta: MetaFunction = () => {
  return [
    { title: "Compubutton" },
    { name: "description", content: "Welcome to Compubutton!" },
  ];
};

export default function Landing() {
  const navigate = useNavigate();
  const onLogin = async () => {
    console.log("login");
    navigate("/login");
  };
  const onRegister = async () => {
    console.log("register");
    navigate("/register");
  };
  return (
    <div className="">
      <div className="mb-4 mt-4 flex">
        <div className="mx-auto">
          <div className="inline-block align-middle">
            <img
              src="/button-logo.png"
              alt=""
              className="mx-auto mb-4 block aspect-square w-[120px] rounded-full bg-[#020a2c] p-[1px] shadow-lg shadow-[#04408d]"
            />
            <div className="hidden dark:block">
              <img
                src="/compubutton-text-white.png"
                alt="Compubutton"
                className="mx-auto block w-[300px]"
              />
            </div>
            <div className="block dark:hidden">
              <img
                src="/compubutton-text-black.png"
                alt="Compubutton"
                className="mx-auto block w-[300px]"
              />
            </div>
            <div className="mt-4 text-center text-black dark:text-white">
              The most advanced button in the world!
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4 mt-4">
        <div className="mx-auto w-[320px]">
          <Button initialText="Log in" onSuccess={onLogin} />
          <br />
          <Button initialText="Register" onSuccess={onRegister} />
        </div>
      </div>
      <div className="mb-4 mt-4 flex">
        <div className="mx-auto">
          <div className="inline-block align-middle">
            <div className="text-center text-black dark:text-white">
              Copyright &copy; 2024 Ryan X. Charles LLC
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
