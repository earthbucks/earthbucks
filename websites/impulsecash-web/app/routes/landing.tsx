import type { MetaFunction } from '@remix-run/node'
import { ChevronDoubleRightIcon } from '@heroicons/react/20/solid'
import { useEffect, useRef, useState } from 'react'
import { classNames } from '~/util'

export const meta: MetaFunction = () => {
  return [
    { title: "ImpulseCash" },
    { name: 'description', content: 'Welcome to ImpulseCash!' },
  ]
}

function Spinner() {
  return (
    <div role="status" className={'h-[36px] w-[36px]'}>
      <svg
        aria-hidden="true"
        className={`mr-2 h-[36px] w-[36px] animate-spin fill-black/50 text-[#fef8d6]`}
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

function Slider() {
  const sliderStates = ['initial', 'dragging', 'processing', 'success', 'error']

  const [sliderState, setSliderState] = useState(sliderStates[0])
  const [startX, setStartX] = useState(0)
  const [buttonX, setButtonX] = useState(0) // Track button's X position

  const handleMouseDown = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>,
  ) => {
    e.preventDefault()
    if (sliderState !== 'initial') return
    setSliderState('dragging')
    setStartX(e.clientX - buttonX) // Capture initial position minus current button position to allow for drag continuation
  }

  const maxButtonX = 208 // Maximum X position for the button, adjust based on the position of the dotted circle

  const handleMouseMove = (e: { clientX: number }) => {
    if (sliderState !== 'dragging') return
    let newButtonX = e.clientX - startX

    // Apply constraints
    newButtonX = Math.max(0, newButtonX) // Prevent moving to the left of the starting point
    newButtonX = Math.min(newButtonX, maxButtonX) // Prevent moving beyond the dotted circle

    setButtonX(newButtonX)
  }

  const handleMouseUp = () => {
    // Snap to the center of the dotted circle or return to start
    if (buttonX >= maxButtonX) {
      setSliderState('processing')
      setButtonX(maxButtonX) // Adjust this value to be the center of the dotted circle

      // After 5 seconds, transition to the "success" state
      setTimeout(() => {
        setSliderState('success')
      }, 2000)
    } else {
      setSliderState('initial')
      setButtonX(0) // Return to the starting point
    }
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault() // Prevents the default action to ensure smooth behavior
    e.stopPropagation() // Prevents the event from bubbling up the DOM tree
    if (sliderState !== 'initial') return
    setSliderState('dragging')
    // Use touches[0] to get the first touch point
    const clientX = e.touches[0]?.clientX || 0
    setStartX(clientX - buttonX)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault() // Prevents the default action to ensure smooth behavior
    e.stopPropagation() // Prevents the event from bubbling up the DOM tree
    if (sliderState !== 'dragging') return
    const clientX = e.touches[0]?.clientX || 0
    let newButtonX = clientX - startX

    // Apply constraints
    newButtonX = Math.max(0, newButtonX)
    newButtonX = Math.min(newButtonX, maxButtonX)

    setButtonX(newButtonX)
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    // Snap to the center of the dotted circle or return to start
    if (buttonX >= maxButtonX) {
      setSliderState('processing')
      setButtonX(maxButtonX) // Adjust this value to be the center of the dotted circle

      // After 2 seconds, transition to the "success" state
      setTimeout(() => {
        setSliderState('success')
      }, 2000)
    } else {
      setSliderState('initial')
      setButtonX(0) // Return to the starting point
    }
  }

  const buttonRef = useRef<HTMLDivElement>(null)

  // Combine useEffect hooks for mouse and touch events to avoid duplication
  useEffect(() => {
    const buttonElement = buttonRef.current
    // Define the native event handler
    const handleNativeTouchStart = (e: TouchEvent) => {
      // Create a React TouchEvent
      handleTouchStart(e as unknown as React.TouchEvent<HTMLDivElement>)
    }
    if (buttonElement) {
      buttonElement.addEventListener('touchstart', handleNativeTouchStart, {
        passive: false,
      })
    }

    if (sliderState === 'dragging') {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      // Add touchmove and touchend listeners for mobile support
      window.addEventListener('touchmove', handleTouchMove as any, {
        passive: false,
      })
      window.addEventListener('touchend', handleTouchEnd as any)
    } else {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      // Remove touchmove and touchend listeners
      window.removeEventListener('touchmove', handleTouchMove as any)
      window.removeEventListener('touchend', handleTouchEnd as any)
    }

    return () => {
      if (buttonElement) {
        buttonElement.removeEventListener('touchstart', handleNativeTouchStart)
      }

      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      // Cleanup for touch events
      window.removeEventListener('touchmove', handleTouchMove as any)
      window.removeEventListener('touchend', handleTouchEnd as any)
    }
  }, [sliderState, startX, buttonX, maxButtonX])

  return (
    <div className="h-full w-full p-[8px]">
      <div className="h-full w-full rounded-full bg-black/60 ring-2 ring-[#f09825]/70">
        <div className="flex h-full">
          <div className="relative h-full flex-shrink">
            <div
              className={classNames(
                'absolute z-40 m-[-8px] h-[52px] w-[52px] p-[8px]',
                sliderState === 'dragging'
                  ? 'rounded-full outline outline-4 outline-[#fef8d6]'
                  : '',
              )}
              ref={buttonRef}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              style={{
                animation:
                  buttonX === 0 ? 'manyButtonBounce 1s infinite' : undefined,
                transform: `translateX(${buttonX}px)`, // Use translateX to move the button along X-axis
                cursor:
                  sliderState === 'initial'
                    ? 'grab'
                    : sliderState === 'dragging'
                      ? 'grabbing'
                      : undefined,
              }}
            >
              <img
                src="/imp-logo.png"
                alt=""
                className="h-[36px] w-[36px]"
              />
            </div>
            <div
              className={classNames(
                sliderState === 'processing'
                  ? 'absolute top-0 block h-[36px] w-[36px]'
                  : 'hidden',
              )}
            >
              <Spinner />
            </div>
            <div
              className={classNames(
                sliderState === 'success'
                  ? 'absolute top-0 flex h-[36px] w-[36px] items-center'
                  : 'hidden',
              )}
            >
              <div className="relative h-[36px] w-[36px]">
                <img src="/heart-96.png" alt="" className="h-[36px] w-[36px]" />
                <img
                  src="/heart-96.png"
                  alt=""
                  className="absolute top-0 h-[36px] w-[36px] animate-ping"
                />
              </div>
            </div>
            <div
              className={classNames(
                sliderState === 'error'
                  ? 'absolute top-0 flex h-[36px] w-[36px] items-center'
                  : 'hidden',
              )}
            >
              <div className="relative h-[36px] w-[36px]">
                <img
                  src="/error-2-96.png"
                  alt=""
                  className="h-[36px] w-[36px]"
                />
                <img
                  src="/error-2-96.png"
                  alt=""
                  className="absolute top-0 h-[36px] w-[36px] animate-ping"
                />
              </div>
            </div>
          </div>
          <div className="flex h-full flex-grow items-center overflow-x-hidden">
            <div
              className={classNames(
                sliderState === 'initial' || sliderState === 'dragging'
                  ? 'flex items-center'
                  : 'hidden',
              )}
            >
              <ChevronDoubleRightIcon className="ml-[34px] inline-block h-6 w-6 text-[#f09825]" />
              <span className="align-middle text-sm font-semibold text-white">
                Begin
              </span>
              <ChevronDoubleRightIcon className="inline-block h-6 w-6 text-[#f09825]" />
            </div>

            <div
              className={classNames(
                sliderState === 'processing'
                  ? 'flex animate-pulse items-center'
                  : 'hidden',
              )}
            >
              <span className="ml-[40px] align-middle text-sm font-semibold text-white">
                Processing...
              </span>
            </div>
            <div
              className={classNames(
                sliderState === 'success'
                  ? 'flex animate-pulse items-center'
                  : 'hidden',
              )}
            >
              <span className="ml-[40px] align-middle text-sm font-semibold text-white">
                Success!
              </span>
            </div>
            <div
              className={classNames(
                sliderState === 'error'
                  ? 'flex animate-pulse items-center'
                  : 'hidden',
              )}
            >
              <span className="ml-[40px] align-middle text-sm font-semibold text-white">
                Error!
              </span>
            </div>
          </div>
          <div className="relative z-30 h-full flex-shrink">
            <div
              className={classNames(
                'aspect-square h-full rounded-full',
                sliderState === 'initial'
                  ? 'outline-dotted outline-2 outline-[#f09825]'
                  : sliderState === 'dragging'
                    ? 'outline-dashed outline-4 outline-[#fef8d6]'
                    : 'hidden',
              )}
              style={{
                animation:
                  sliderState === 'initial' || sliderState === 'dragging'
                    ? 'manyButtonSpin 10s linear infinite'
                    : undefined,
              }}
            ></div>
            <div
              className={classNames(
                'aspect-square h-full rounded-full',
                sliderState === 'error'
                  ? 'outline-dashed outline-2 outline-black'
                  : 'hidden',
              )}
              style={{
                animation:
                  sliderState === 'error'
                    ? 'manyButtonSpin 10s linear infinite'
                    : undefined,
              }}
            ></div>
            <img
              src="/imp-logo.png"
              alt=""
              className={classNames(
                'relative z-[35] h-full',
                sliderState === 'processing' ? 'block animate-ping' : 'hidden',
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Button({ gender }: { gender?: 'male' | 'female' | 'ninja' | 'treasurechest' }) {
  gender = gender || 'treasurechest'
  const maleSrc = '/shirt-white-male-cropped.png'
  const femaleSrc = '/shirt-white-female-cropped.png'
  const ninjaSrc = '/shirt-ninja-cropped.png'
  const treasurechestSrc = '/treasure-chest-cropped.png'

  let shirtSrc
  switch (gender) {
    case 'treasurechest':
      shirtSrc = treasurechestSrc
      break
    case 'ninja':
      shirtSrc = ninjaSrc
      break
    case 'male':
      shirtSrc = maleSrc
      break
    default:
      shirtSrc = femaleSrc
  }

  return (
    <div className="flex h-[60px] w-[320px]">
      <div className="mx-auto h-[60px] w-[320px] rounded-full bg-[#556489] p-[1px] shadow-lg shadow-[#556489]">
        <div className="h-full w-full rounded-full bg-[#fef8d6] p-[3px]">
          <div className="relative h-full w-full rounded-full bg-[#f09825] shadow-[inset_5px_5px_10px_#556489]">
            <img
              src={shirtSrc}
              alt=""
              className="absolute left-[168px] z-10 h-[52px]"
            />
            <div className="absolute z-20 h-full w-full">
              <div className="flex h-full">
                <div className="h-full flex-grow">
                  <Slider />
                </div>
                <div className="h-full flex-shrink-0">
                  <img
                    src="/imp-avatar-bw.png"
                    alt=""
                    className="h-[52px] w-[52px] rounded-full outline outline-1 outline-[#fef8d6]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="">
      <div className="mb-4 mt-4 flex">
        <div className="mx-auto">
          <div className="inline-block align-middle">
            <img
              src="/imp-logo.png"
              alt=""
              className="mx-auto mb-4 block h-[200px] w-[200px]"
            />
            <div className="hidden dark:block">
              <img
                src="/impulsecash-text-white.png"
                alt="ImpulseCash"
                className="mx-auto block h-[50px]"
              />
            </div>
            <div className="block dark:hidden">
              <img
                src="/impulsecash-text-black.png"
                alt="ImpulseCash"
                className="mx-auto block h-[50px]"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="h-[80px]">
        <div className="mx-auto w-[320px]">
          <Button />
        </div>
      </div>
    </div>
  )
}
