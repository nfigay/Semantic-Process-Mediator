import {
  createEmbeddedProfileRuntime
} from '../profiles/embedded-profile-runtime.js'

import {
  XsdSchemaAdapter
} from '../schemas/xsd-schema-adapter.js'


export const PUBLICATION_PACKAGE_VERSION = 1


function normalizeObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`)
  }
  return value
}


export function createPublicationPackage({
  subject,
  bpmnXml,
  publicationContext = {},
  profileSource,
  profileSources = {},
  businessView = null,
  presentation = {}
} = {}) {
  if (typeof bpmnXml !== 'string' || !bpmnXml.trim()) {
    throw new Error('Publication package requires bpmnXml')
  }

  if (profileSource === undefined || profileSource === null) {
    throw new Error('Publication package requires profileSource')
  }

  return {
    format: 'bpmnsm-publication-package',
    version: PUBLICATION_PACKAGE_VERSION,
    subject: normalizeObject(subject, 'Publication subject'),
    bpmnXml,
    publicationContext: normalizeObject(
      publicationContext,
      'Publication context'
    ),
    presentation: normalizeObject(
      presentation,
      'Publication presentation'
    ),
    semanticClosure: {
      profileSource,
      sources: normalizeObject(
        profileSources,
        'Publication profile sources'
      ),
      businessView
    }
  }
}


export async function resolvePublicationPackageRuntime(
  publicationPackage
) {
  const pkg = normalizeObject(
    publicationPackage,
    'Publication package'
  )

  if (
    pkg.format !== 'bpmnsm-publication-package' ||
    pkg.version !== PUBLICATION_PACKAGE_VERSION
  ) {
    throw new Error('Unsupported BPMNSM publication package')
  }

  const semanticClosure = normalizeObject(
    pkg.semanticClosure,
    'Publication semantic closure'
  )

  const profileSource = semanticClosure.profileSource
  const technologies = new Set(
    (profileSource?.schemas || []).map(schema => schema?.technology)
  )

  const unsupported = [ ...technologies ].filter(
    technology => technology && technology !== 'XSD'
  )

  if (unsupported.length) {
    throw new Error(
      `Unsupported publication schema technology: ${unsupported.join(', ')}`
    )
  }

  const adapters = technologies.has('XSD')
    ? [ new XsdSchemaAdapter() ]
    : []

  const profileRuntime = await createEmbeddedProfileRuntime({
    profileSource,
    sources: semanticClosure.sources || {},
    adapters
  })

  return {
    bpmnXml: pkg.bpmnXml,
    publicationContext: pkg.publicationContext || {},
    presentation: pkg.presentation || {},
    profileRuntime,
    businessView: semanticClosure.businessView || null
  }
}
