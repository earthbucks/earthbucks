import type { MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import Button from "~/button";

export const meta: MetaFunction = () => {
  return [
    { title: "Compubutton" },
    { name: "description", content: "Welcome to Compubutton!" },
  ];
};

function Footer() {
  return (
    <div className="mb-4 flex">
      <div className="mx-auto">
        <div className="inline-block align-middle">
          <div className="text-center text-sm text-black dark:text-white">
            Copyright &copy; 2024 Ryan X. Charles LLC
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const onAgree = async () => {
    console.log("login");
    navigate("/login");
  };
  return (
    <div className="">
      <div className="mt-4 flex">
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
              Welcome to the most advanced button in the world!
            </div>
            <hr className="mx-auto my-4 max-w-[40px] border-gray-400 dark:border-gray-600" />
          </div>
        </div>
      </div>
      <div className="overflow-auto">
        <div className="">
          <div className="mx-auto mb-4 max-w-[400px] text-center text-black dark:text-white">
            You must log in or register to proceed.
            <br />
            Do you agree to let us use cookies?
          </div>
          <div className="mx-auto w-[320px]">
            <Button
              initialText="Agree"
              successText="Agreed!"
              onSuccess={onAgree}
            />
          </div>
          <hr className="mx-auto my-4 max-w-[40px] border-gray-400 dark:border-gray-600" />
        </div>
        {messages.map((message, index) => (
          <div key={index} className="p-2 text-black dark:text-white">
            {message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <Footer />
    </div>
  );
}
