import type { MetaFunction } from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    { title: 'OpenSPV' },
    { name: 'description', content: 'Welcome to OpenSPV!' },
  ]
}

export default function Index() {
  return (
    <div className="">
      <div className="mb-4 mt-4 flex">
        <div className="mx-auto">
          <div className="inline-block align-middle">
            <img
              src="/openspv-logo.png"
              alt=""
              className="mx-auto mb-4 block h-[200px] w-[200px]"
            />
            <div className="hidden dark:block">
              <img
                src="/openspv-text-white.png"
                alt="OpenSPV"
                className="mx-auto block h-[50px]"
              />
            </div>
            <div className="block dark:hidden">
              <img
                src="/openspv-text-black.png"
                alt="OpenSPV"
                className="mx-auto block h-[50px]"
              />
            </div>
            <div className="mb-4 text-center text-black dark:text-white">
              Open-source blockchain generator.
              <br />
              <br />
              <a
                href="https://github.com/openspv/openspv"
                target="_blank"
                className="underline"
              >
                GitHub
              </a>{' '}
              &middot;{' '}
              <a
                href="https://x.com/openspv"
                target="_blank"
                className="underline"
              >
                X (Twitter)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
