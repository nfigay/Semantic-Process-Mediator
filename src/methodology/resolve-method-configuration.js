import {
  resolveMethodProfile
} from './method-profiles.js'


export function resolveMethodConfiguration(
  context = {}
) {
  const profile =
    resolveMethodProfile(
      context
    )

  return {
    profileId:
      profile.id,

    profileVersion:
      profile.version,

    cocOwner:
      context.cocOwner || '',

    maturity:
      context.maturity || 'L1',

    validatedAt:
      null,

    configHash:
      null
  }
}