import {
  createEngineeringProfileRuntime
} from './engineering-embedded-profile.js'

import {
  createAvionicsProfileRuntime
} from './avionics-embedded-profile.js'

import {
  createExperimentalAProfileRuntime
} from './experimental-a-embedded-profile.js'

import {
  createExperimentalBProfileRuntime
} from './experimental-b-embedded-profile.js'


export async function resolveEmbeddedProfileRuntime({
  profileRef
} = {}) {

  if (
    typeof profileRef !==
      'string' ||
    !profileRef.trim()
  ) {

    throw new Error(
      'Embedded profile resolver requires profileRef'
    )
  }


  const normalizedProfileRef =
    profileRef.trim()


  if (
    normalizedProfileRef ===
      'engineering'
  ) {

    return createEngineeringProfileRuntime()
  }


  if (
    normalizedProfileRef ===
      'avionics'
  ) {

    return createAvionicsProfileRuntime()
  }


  if (
    normalizedProfileRef ===
      'experimental-a'
  ) {

    return createExperimentalAProfileRuntime()
  }


  if (
    normalizedProfileRef ===
      'experimental-b'
  ) {

    return createExperimentalBProfileRuntime()
  }


  throw new Error(
    `Unknown embedded BPMNSM profile: ${normalizedProfileRef}`
  )
}
