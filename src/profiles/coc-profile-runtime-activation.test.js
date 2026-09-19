import {
  describe,
  expect,
  it
} from 'vitest'

import {
  activateCocProfileRuntime
} from './coc-profile-runtime-activation.js'

import {
  createActiveProfileRuntime
} from './active-profile-runtime.js'

import {
  resolveEmbeddedProfileRuntime
} from './embedded-profile-resolver.js'

import {
  experimentalACocConfiguration
} from '../configuration/experimental-a-coc-configuration.js'

import {
  experimentalBCocConfiguration
} from '../configuration/experimental-b-coc-configuration.js'


const cocConfigurations = [
  experimentalACocConfiguration,
  experimentalBCocConfiguration
]


describe(
  'CoC profile runtime activation',
  () => {

    it(
      'activates the ProfileRuntime selected by CoCConfiguration',
      async () => {

        const runtimeA =
          await resolveEmbeddedProfileRuntime({
            profileRef:
              experimentalACocConfiguration.profileRef
          })


        const activeProfileRuntime =
          createActiveProfileRuntime(
            runtimeA
          )


        const result =
          await activateCocProfileRuntime({

            cocId:
              experimentalBCocConfiguration.id,

            cocConfigurations,

            resolveProfileRuntime:
              resolveEmbeddedProfileRuntime,

            activeProfileRuntime
          })


        expect(
          result.cocConfiguration
        ).toBe(
          experimentalBCocConfiguration
        )

        expect(
          result.profileRuntime.profile.id
        ).toBe(
          'experimental-b'
        )

        expect(
          activeProfileRuntime.get()
        ).toBe(
          result.profileRuntime
        )
      }
    )


    it(
      'can switch the same ActiveProfileRuntime from A to B',
      async () => {

        const runtimeA =
          await resolveEmbeddedProfileRuntime({
            profileRef:
              experimentalACocConfiguration.profileRef
          })


        const activeProfileRuntime =
          createActiveProfileRuntime(
            runtimeA
          )


        expect(
          activeProfileRuntime
            .get()
            .profile
            .id
        ).toBe(
          'experimental-a'
        )


        await activateCocProfileRuntime({

          cocId:
            experimentalBCocConfiguration.id,

          cocConfigurations,

          resolveProfileRuntime:
            resolveEmbeddedProfileRuntime,

          activeProfileRuntime
        })


        expect(
          activeProfileRuntime
            .get()
            .profile
            .id
        ).toBe(
          'experimental-b'
        )
      }
    )


    it(
      'keeps distinct CoC configurations when they select the same profile',
      async () => {

        const firstConfiguration = {
          id:
            'shared-profile-coc-a',

          profileRef:
            'experimental-a'
        }


        const secondConfiguration = {
          id:
            'shared-profile-coc-b',

          profileRef:
            'experimental-a'
        }


        const sharedProfileConfigurations = [
          firstConfiguration,
          secondConfiguration
        ]


        const initialRuntime =
          await resolveEmbeddedProfileRuntime({
            profileRef:
              firstConfiguration.profileRef
          })


        const activeProfileRuntime =
          createActiveProfileRuntime(
            initialRuntime
          )


        const firstResult =
          await activateCocProfileRuntime({

            cocId:
              firstConfiguration.id,

            cocConfigurations:
              sharedProfileConfigurations,

            resolveProfileRuntime:
              resolveEmbeddedProfileRuntime,

            activeProfileRuntime
          })


        const secondResult =
          await activateCocProfileRuntime({

            cocId:
              secondConfiguration.id,

            cocConfigurations:
              sharedProfileConfigurations,

            resolveProfileRuntime:
              resolveEmbeddedProfileRuntime,

            activeProfileRuntime
          })


        expect(
          firstResult.cocConfiguration
        ).toBe(
          firstConfiguration
        )


        expect(
          secondResult.cocConfiguration
        ).toBe(
          secondConfiguration
        )


        expect(
          firstResult.cocConfiguration.id
        ).not.toBe(
          secondResult.cocConfiguration.id
        )


        expect(
          firstResult.profileRuntime.profile.id
        ).toBe(
          'experimental-a'
        )


        expect(
          secondResult.profileRuntime.profile.id
        ).toBe(
          'experimental-a'
        )


        expect(
          firstResult.profileRuntime.profile.id
        ).toBe(
          secondResult.profileRuntime.profile.id
        )


        expect(
          activeProfileRuntime.get()
        ).toBe(
          secondResult.profileRuntime
        )
      }
    )


    it(
      'does not replace the active runtime for an unknown CoC',
      async () => {

        const runtimeA =
          await resolveEmbeddedProfileRuntime({
            profileRef:
              experimentalACocConfiguration.profileRef
          })


        const activeProfileRuntime =
          createActiveProfileRuntime(
            runtimeA
          )


        const result =
          await activateCocProfileRuntime({

            cocId:
              'unknown',

            cocConfigurations,

            resolveProfileRuntime:
              resolveEmbeddedProfileRuntime,

            activeProfileRuntime
          })


        expect(
          result
        ).toBeNull()

        expect(
          activeProfileRuntime.get()
        ).toBe(
          runtimeA
        )
      }
    )


    it(
      'preserves the active runtime when profile resolution fails',
      async () => {

        const runtimeA =
          await resolveEmbeddedProfileRuntime({
            profileRef:
              experimentalACocConfiguration.profileRef
          })


        const activeProfileRuntime =
          createActiveProfileRuntime(
            runtimeA
          )


        const failingConfiguration = {
          id:
            'failing',

          profileRef:
            'unknown'
        }


        await expect(
          activateCocProfileRuntime({

            cocId:
              failingConfiguration.id,

            cocConfigurations: [
              failingConfiguration
            ],

            resolveProfileRuntime:
              resolveEmbeddedProfileRuntime,

            activeProfileRuntime
          })
        ).rejects.toThrow(
          'Unknown embedded BPMNSM profile: unknown'
        )


        expect(
          activeProfileRuntime.get()
        ).toBe(
          runtimeA
        )
      }
    )
  }
)
