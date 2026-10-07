/*
 * BPMNSM Repository Resource Kind Resolver
 *
 * Responsibility:
 *
 *   Recognize repository resource kinds from established,
 *   unambiguous file-name conventions only.
 *
 * XML is intentionally not classified here because .xml is
 * accepted by both BPMN and ArchiMate precedents. Content-based
 * recognition belongs to a later experiment.
 */

export function resolveRepositoryResourceKind(
  fileName
) {

  if (
    typeof fileName !==
      'string' ||
    !fileName.trim()
  ) {

    return 'unknown'
  }


  const normalizedFileName =
    fileName
      .trim()
      .toLowerCase()


  if (
    normalizedFileName.endsWith(
      '.business.json'
    )
  ) {

    return 'business-model'
  }


  if (
    normalizedFileName.endsWith(
      '.archimate'
    )
  ) {

    return 'archimate'
  }


  if (
    normalizedFileName.endsWith(
      '.bpmn'
    )
  ) {

    return 'bpmn'
  }


  return 'unknown'
}
