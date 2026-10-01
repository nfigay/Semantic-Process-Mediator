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
    let publicationPackage = null

    try {
      publicationPackage = await packageResponse.json()
    } catch {
      // Vite's SPA fallback may answer a missing package URL with
      // index.html and HTTP 200. In that case the package is absent
      // and the legacy BPMN publication remains the authoritative
      // fallback.
    }

    if (publicationPackage !== null) {
      const runtime = await resolvePublicationPackageRuntime(
        publicationPackage
      )

      return {
        ...runtime,
        format: 'bpmnsm-publication-package'
      }
    }
  } else if (packageResponse.status !== 404) {
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
