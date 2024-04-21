import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "EarthBucks" },
    { name: "description", content: "Welcome to EarthBucks!" },
  ];
};

export default function Index() {
  return (
    <div className="">
      <div className="mb-4 mt-4 flex">
        <div className="mx-auto">
          <div className="inline-block align-middle">
            <img
              src="/earthbucks-coin.png"
              alt=""
              className="mx-auto mb-4 block h-[200px] w-[200px]"
            />
            <div className="hidden dark:block">
              <img
                src="/earthbucks-text-white.png"
                alt="EarthBucks"
                className="mx-auto block h-[50px]"
              />
            </div>
            <div className="block dark:hidden">
              <img
                src="/earthbucks-text-black.png"
                alt="EarthBucks"
                className="mx-auto block h-[50px]"
              />
            </div>
            <div className="mb-4 text-center text-black dark:text-white">
              42 trillion EBX. No pre-mine. GPUs. Big blocks. Script.
              <br />
              <br />
              Genesis block in 2024.
              <br />
              <br />
              <a
                href="https://t.me/+e-PoBNNgdDU3MDUx"
                target="_blank"
                className="underline"
              >
                Telegram
              </a>{" "}
              &middot;{" "}
              <a
                href="https://discord.gg/dZfyrFk6uh"
                target="_blank"
                className="underline"
              >
                Discord
              </a>{" "}
              &middot;{" "}
              <a
                href="https://x.com/earthbucks_com"
                target="_blank"
                className="underline"
              >
                X (Twitter)
              </a>{" "}
              &middot;{" "}
              <a
                href="https://github.com/earthbucks/earthbucks"
                target="_blank"
                className="underline"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
