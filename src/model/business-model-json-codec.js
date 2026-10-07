/*
 * ------------------------------------------------------------
 * BPMNSM Business Model JSON Codec
 *
 * Physical JSON encoding for the format-neutral
 * BusinessModelDocument boundary.
 *
 * formatVersion belongs to this physical envelope. It is not a
 * Business Model domain fact and is therefore not projected into
 * BusinessModelResource.
 * ------------------------------------------------------------
 */

import {
  createBusinessModelResourceFromDocument,
  projectBusinessModelDocument
} from './business-model-document.js'


export const BUSINESS_MODEL_JSON_FORMAT_VERSION = '1'


export function serializeBusinessModelDocumentJson(
  document
) {

  const normalizedDocument =
    normalizeBusinessModelDocument(
      document
    )

  return `${JSON.stringify({
    formatVersion:
      BUSINESS_MODEL_JSON_FORMAT_VERSION,
    ...normalizedDocument
  }, null, 2)}\n`
}


export function parseBusinessModelDocumentJson(
  source
) {

  if (typeof source !== 'string') {
    throw new Error(
      'Business Model JSON source must be a string'
    )
  }

  let parsed

  try {
    parsed = JSON.parse(source)
  } catch (error) {
    throw new Error(
      `Invalid Business Model JSON: ${error.message}`
    )
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    Array.isArray(parsed)
  ) {
    throw new Error(
      'Business Model JSON requires an object'
    )
  }

  if (
    typeof parsed.formatVersion !== 'string' ||
    !parsed.formatVersion.trim()
  ) {
    throw new Error(
      'Business Model JSON requires formatVersion'
    )
  }

  if (
    parsed.formatVersion !==
      BUSINESS_MODEL_JSON_FORMAT_VERSION
  ) {
    throw new Error(
      `Unsupported Business Model JSON formatVersion: ${parsed.formatVersion}`
    )
  }

  return normalizeBusinessModelDocument({
    identityOrigins:
      parsed.identityOrigins,
    businessObjects:
      parsed.businessObjects,
    businessRelations:
      parsed.businessRelations,
    businessObjectExternalIdentities:
      parsed.businessObjectExternalIdentities
  })
}


function normalizeBusinessModelDocument(
  document
) {

  const resource =
    createBusinessModelResourceFromDocument(
      document
    )

  return projectBusinessModelDocument(
    resource
  )
}
