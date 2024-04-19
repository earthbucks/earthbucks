import type { MetaFunction } from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    { title: 'EarthBucks Pool' },
    { name: 'description', content: 'Welcome to EarthBucks Pool!' },
  ]
}

export default function Index() {
  return (
    <div className="">
      <div className="mb-4 mt-4 flex">
        <div className="mx-auto">
          <div className="inline-block align-middle">
            <img
              src="/earthbucks-pool-logo.png"
              alt=""
              className="mx-auto mb-4 block h-[200px] w-[200px]"
            />
            <div className="hidden dark:block">
              <img
                src="/earthbucks-pool-text-white.png"
                alt="EarthBucks Pool"
                className="mx-auto block h-[50px]"
              />
            </div>
            <div className="block dark:hidden">
              <img
                src="/earthbucks-pool-text-black.png"
                alt="EarthBucks Pool"
                className="mx-auto block h-[50px]"
              />
            </div>
            <div className="mb-4 text-center text-black dark:text-white">
              Mining pool for EBX blockchain.
              <br />
              <br />
              <a
                href="https://github.com/earthbucks/openebx"
                target="_blank"
                className="underline"
              >
                GitHub
              </a>{' '}
              | Sponsored by{' '}
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
