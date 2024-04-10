import type { MetaFunction } from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    { title: 'OpenEBX' },
    { name: 'description', content: 'Welcome to OpenEBX!' },
  ]
}

export default function Index() {
  return (
    <div className="">
      <div className="mb-4 mt-4 flex">
        <div className="mx-auto">
          <div className="inline-block align-middle">
            <img
              src="/openebx-logo.png"
              alt=""
              className="mx-auto mb-4 block h-[200px] w-[200px]"
            />
            <div className="hidden dark:block">
              <img
                src="/openebx-text-white.png"
                alt="OpenEBX"
                className="mx-auto block h-[50px]"
              />
            </div>
            <div className="block dark:hidden">
              <img
                src="/openebx-text-black.png"
                alt="OpenEBX"
                className="mx-auto block h-[50px]"
              />
            </div>
            <div className="mb-4 text-center text-black dark:text-white">
            Open-source implementation of EBX blockchain.
              <br />
              <br />
              <a
                href="https://github.com/openebx/openebx"
                target="_blank"
                className="underline"
              >
                GitHub
              </a>{' '}
              &middot;{' '}
              <a
                href="https://x.com/openebx"
                target="_blank"
                className="underline"
              >
                X (Twitter)
              </a>
              <br />
              <br />
              Sponsored by{' '}
              <a
                href="https://earthbucks.com"
                target="_blank"
                className="underline"
              >
                EarthBucks
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
