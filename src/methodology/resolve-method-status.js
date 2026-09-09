import {
  resolveMethodConfiguration
} from './resolve-method-configuration.js'


const COMPARED_FIELDS = [
  'profileId',
  'profileVersion',
  'cocOwner',
  'maturity'
]


function buildDifferences({
  storedConfiguration,
  currentConfiguration
}) {

  return COMPARED_FIELDS
    .filter(
      field =>
        storedConfiguration[field] !==
        currentConfiguration[field]
    )
    .map(
      field => ({
        field,

        previous:
          storedConfiguration[field] ??
          null,

        current:
          currentConfiguration[field] ??
          null
      })
    )
}


export function resolveMethodStatus({
  context = {},
  storedConfiguration = {}
} = {}) {

  const currentConfiguration =
    resolveMethodConfiguration(
      context
    )


  if (
    !storedConfiguration.profileId ||
    !storedConfiguration.profileVersion ||
    !storedConfiguration.validatedAt
  ) {

    return {
      status:
        'NOT_VALIDATED',

      differences:
        [],

      currentConfiguration,
      storedConfiguration
    }
  }


  const differences =
    buildDifferences({
      storedConfiguration,
      currentConfiguration
    })


  if (
    differences.length === 0
  ) {

    return {
      status:
        'CURRENT',

      differences,
      currentConfiguration,
      storedConfiguration
    }
  }


  return {
    status:
      'OUTDATED',

    differences,
    currentConfiguration,
    storedConfiguration
  }
}