import {
  describe,
  expect,
  it,
  vi
} from 'vitest'

import {
  installBeforeUnloadProtection
} from './install-beforeunload-protection.js'


describe(
  'beforeunload protection',
  () => {

    it(
      'protects the BPMNSM editor against accidental unload',
      () => {

        const listeners =
          new Map()

        const target = {
          addEventListener:
            vi.fn(
              (
                type,
                listener
              ) => {

                listeners.set(
                  type,
                  listener
                )
              }
            ),

          removeEventListener:
            vi.fn()
        }


        const protection =
          installBeforeUnloadProtection(
            target
          )


        expect(
          target.addEventListener
        ).toHaveBeenCalledWith(
          'beforeunload',
          expect.any(Function)
        )


        const event = {
          preventDefault:
            vi.fn(),

          returnValue:
            undefined
        }


        listeners
          .get(
            'beforeunload'
          )(
            event
          )


        expect(
          event.preventDefault
        ).toHaveBeenCalledOnce()

        expect(
          event.returnValue
        ).toBe('')


        protection.destroy()


        expect(
          target.removeEventListener
        ).toHaveBeenCalledWith(
          'beforeunload',
          listeners.get(
            'beforeunload'
          )
        )
      }
    )
  }
)
