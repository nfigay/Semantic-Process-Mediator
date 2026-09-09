export function getRepositoryContext(modeler) {
  const defs = modeler.getDefinitions()
  const ext = defs?.extensionElements

  return (
    ext?.values?.find(
      value =>
        value.$type === 'semarch:RepositoryContext'
    ) || {}
  )
}


export function setRepositoryContext(modeler, values) {
  const moddle = modeler.get('moddle')
  const defs = modeler.getDefinitions()

  if (!defs.extensionElements) {
    defs.extensionElements = moddle.create(
      'bpmn:ExtensionElements',
      {
        values: []
      }
    )
  }

  defs.extensionElements.values =
    (defs.extensionElements.values || [])
      .filter(
        value =>
          value.$type !== 'semarch:RepositoryContext'
      )

  const context = moddle.create(
    'semarch:RepositoryContext',
    values
  )

  defs.extensionElements.values.push(context)

  return context
}