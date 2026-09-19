import {
  engineeringPublicationConfiguration
} from './engineering-publication-configuration.js'


export function resolvePublicationConfiguration({
  publicationRef
} = {}) {

  if (
    typeof publicationRef !==
      'string' ||
    !publicationRef.trim()
  ) {

    throw new Error(
      'Publication configuration resolver requires publicationRef'
    )
  }


  const normalizedPublicationRef =
    publicationRef.trim()


  if (
    normalizedPublicationRef ===
      'engineering'
  ) {

    return engineeringPublicationConfiguration
  }


  throw new Error(
    `Unknown BPMNSM publication configuration: ${normalizedPublicationRef}`
  )
}