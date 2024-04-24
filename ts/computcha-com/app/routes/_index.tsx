import type { MetaFunction } from "@remix-run/node";

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
              src="/computcha-bottlecap.png"
              alt=""
              className="mx-auto mb-4 block w-[100px] aspect-square"
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
            <div className="mb-4 text-center text-black dark:text-white">
              Please prove compute to register or log in.
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
