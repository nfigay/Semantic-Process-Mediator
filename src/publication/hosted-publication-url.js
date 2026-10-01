export function resolveHostedProcessPublicationUrl({
  baseUrl,
  publicationId
} = {}) {

  const id =
    String(publicationId || '').trim()

  if (!id) {
    throw new Error(
      'Hosted Process Viewer requires a publication id'
    )
  }

  const base =
    String(baseUrl || '/')
      .replace(/\/+$/, '') + '/'

  return (
    `${base}publications/process/` +
    `${encodeURIComponent(id)}.bpmn`
  )
}


export function resolveHostedProcessPublicationPackageUrl({
  baseUrl,
  publicationId
} = {}) {
  const id = String(publicationId || '').trim()

  if (!id) {
    throw new Error(
      'Hosted Process Viewer requires a publication id'
    )
  }

  const base = String(baseUrl || '/')
    .replace(/\/+$/, '') + '/'

  return (
    `${base}publications/process/` +
    `${encodeURIComponent(id)}.json`
  )
}
