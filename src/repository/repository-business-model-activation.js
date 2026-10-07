import {
  parseBusinessModelDocumentJson
} from '../model/business-model-json-codec.js'


export function activateRepositoryBusinessModel({
  repositoryDocuments,
  businessObjectStore,
  businessRelationStore,
  identityOriginStore,
  businessObjectExternalIdentityStore
}) {

  if (!Array.isArray(repositoryDocuments)) {
    throw new Error(
      'Repository documents must be an array'
    )
  }


  requireStore(
    businessObjectStore,
    'Business Object store',
    'addBusinessObject'
  )

  requireStore(
    businessRelationStore,
    'Business Relation store',
    'addBusinessRelation'
  )

  requireStore(
    identityOriginStore,
    'Identity Origin store',
    'addIdentityOrigin'
  )

  requireStore(
    businessObjectExternalIdentityStore,
    'Business Object External Identity store',
    'attach'
  )


  const businessModelRepositoryDocuments =
    repositoryDocuments.filter(
      document =>
        document?.kind ===
          'business-model'
    )


  if (
    businessModelRepositoryDocuments.length >
    1
  ) {

    throw new Error(
      'Repository currently supports exactly one Business Model document'
    )
  }


  const businessModelRepositoryDocument =
    businessModelRepositoryDocuments[0] ||
    null


  if (!businessModelRepositoryDocument) {
    return null
  }


  const document =
    parseBusinessModelDocumentJson(
      businessModelRepositoryDocument.content
    )


  businessObjectStore.clear()
  businessRelationStore.clear()
  identityOriginStore.clear()
  businessObjectExternalIdentityStore.clear()


  for (const identityOrigin of document.identityOrigins) {
    identityOriginStore.addIdentityOrigin(identityOrigin)
  }

  for (const businessObject of document.businessObjects) {
    businessObjectStore.addBusinessObject(businessObject)
  }

  for (const businessRelation of document.businessRelations) {
    businessRelationStore.addBusinessRelation(businessRelation)
  }

  for (
    const externalIdentity
    of document.businessObjectExternalIdentities
  ) {
    businessObjectExternalIdentityStore.attach(externalIdentity)
  }


  return {
    repositoryDocumentId:
      businessModelRepositoryDocument.id,
    document
  }
}


function requireStore(
  store,
  storeName,
  addMethod
) {

  if (
    !store ||
    typeof store.clear !== 'function' ||
    typeof store[addMethod] !== 'function'
  ) {

    throw new Error(
      `${storeName} must expose clear() and ${addMethod}()`
    )
  }
}
