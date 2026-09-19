export function normalizeCocConfiguration(
  configuration
) {

  if (
    !configuration ||
    typeof configuration !==
      'object'
  ) {

    throw new TypeError(
      'CoC configuration must be an object'
    )
  }


  const id =
    typeof configuration.id ===
      'string'
      ? configuration.id.trim()
      : ''


  if (
    !id
  ) {

    throw new Error(
      'CoC configuration requires an id'
    )
  }


  const label =
    typeof configuration.label ===
      'string' &&
    configuration.label.trim()
      ? configuration.label.trim()
      : id


  let profileRef =
    null


  if (
    configuration.profileRef !==
      undefined &&
    configuration.profileRef !==
      null
  ) {

    if (
      typeof configuration.profileRef !==
        'string' ||
      !configuration.profileRef.trim()
    ) {

      throw new Error(
        'CoC configuration profileRef must be a non-empty string'
      )
    }


    profileRef =
      configuration.profileRef.trim()
  }


  let publicationRef =
    null


  if (
    configuration.publicationRef !==
      undefined &&
    configuration.publicationRef !==
      null
  ) {

    if (
      typeof configuration.publicationRef !==
        'string' ||
      !configuration.publicationRef.trim()
    ) {

      throw new Error(
        'CoC configuration publicationRef must be a non-empty string'
      )
    }


    publicationRef =
      configuration.publicationRef.trim()
  }


  let defaultMaturity =
    null


  if (
    configuration.defaultMaturity !==
      undefined &&
    configuration.defaultMaturity !==
      null
  ) {

    if (
      typeof configuration.defaultMaturity !==
        'string' ||
      !configuration.defaultMaturity.trim()
    ) {

      throw new Error(
        'CoC configuration defaultMaturity must be a non-empty string'
      )
    }


    defaultMaturity =
      configuration.defaultMaturity.trim()
  }


  return {
    id,
    label,
    profileRef,
    publicationRef,
    defaultMaturity
  }
}