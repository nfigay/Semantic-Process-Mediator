/*
 * BPMNSM Technical Introspection
 * Read-only query facade and declarative source catalog.
 */

export function createTechnicalIntrospection({
  repositoryDocumentStore,
  businessObjectStore,
  businessObjectRepresentationStore,
  activeRepository
} = {}) {
  const sources = new Map()

  function resolveRepositoryStore(
    repositoryProperty,
    directStore
  ) {
    return (
      activeRepository?.get?.()?.[repositoryProperty] ||
      directStore ||
      null
    )
  }

  function addSource({ id, label, read, hiddenTableFields = [] }) {
    if (!id || !label || typeof read !== 'function') {
      throw new Error('Technical introspection source requires id, label and read')
    }
    sources.set(id, { id, label, read, hiddenTableFields: [ ...hiddenTableFields ] })
  }

  addSource({
    id: 'repositoryDocuments',
    label: 'Repository Documents',
    read: () =>
      resolveRepositoryStore(
        'documents',
        repositoryDocumentStore
      )?.getDocuments?.() || [],
    hiddenTableFields: [ 'content' ]
  })
  addSource({
    id: 'businessObjects',
    label: 'Business Objects',
    read: () =>
      resolveRepositoryStore(
        'businessObjectStore',
        businessObjectStore
      )?.getBusinessObjects?.() || []
  })
  addSource({
    id: 'businessObjectRepresentations',
    label: 'Business Object Representations',
    read: () =>
      resolveRepositoryStore(
        'businessObjectRepresentationStore',
        businessObjectRepresentationStore
      )?.getBusinessObjectRepresentations?.() || []
  })

  function getSources() {
    return Array.from(sources.values(), ({ read, ...definition }) => ({
      ...definition,
      hiddenTableFields: [ ...definition.hiddenTableFields ]
    }))
  }

  function query({ source, filters = {} } = {}) {
    const definition = sources.get(source)
    if (!definition) throw new Error(`Unknown technical introspection source: ${source}`)
    return definition.read()
      .filter(value => Object.entries(filters).every(([ field, expectedValue ]) => value?.[field] === expectedValue))
      .map(value => ({ ...value }))
  }

  return { addSource, getSources, query }
}
