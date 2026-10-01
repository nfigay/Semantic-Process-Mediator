import {
  resolveHostedProcessPublicationPackageUrl,
  resolveHostedProcessPublicationUrl
} from './hosted-publication-url.js'

import {
  resolvePublicationPackageRuntime
} from './publication-package.js'


export async function loadHostedProcessPublication({
  baseUrl,
  publicationId,
  fetchImpl = fetch
} = {}) {
  const packageUrl = resolveHostedProcessPublicationPackageUrl({
    baseUrl,
    publicationId
  })

  const packageResponse = await fetchImpl(packageUrl, {
    cache: 'no-store'
  })

  if (packageResponse.ok) {
    const publicationPackage = await packageResponse.json()
    const runtime = await resolvePublicationPackageRuntime(publicationPackage)

    return {
      ...runtime,
      format: 'bpmnsm-publication-package'
    }
  }

  if (packageResponse.status !== 404) {
    throw new Error(
      `${packageResponse.status} ${packageResponse.statusText}`
    )
  }

  const legacyUrl = resolveHostedProcessPublicationUrl({
    baseUrl,
    publicationId
  })

  const legacyResponse = await fetchImpl(legacyUrl, {
    cache: 'no-store'
  })

  if (!legacyResponse.ok) {
    throw new Error(
      `${legacyResponse.status} ${legacyResponse.statusText}`
    )
  }

  return {
    format: 'legacy-bpmn',
    bpmnXml: await legacyResponse.text(),
    publicationContext: {},
    profileRuntime: null,
    businessView: null
  }
}
