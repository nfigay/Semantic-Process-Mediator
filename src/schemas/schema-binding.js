export function createTypeBinding({
  semanticType,
  schemaType,
  bpmnAnchor = null
}) {

  if (!semanticType) {
    throw new Error(
      'TypeBinding requires semanticType'
    )
  }

  if (!schemaType) {
    throw new Error(
      'TypeBinding requires schemaType'
    )
  }

  return {
    semanticType,
    schemaType,
    bpmnAnchor
  }
}


export function findTypeBinding(
  bindings,
  semanticType
) {

  return bindings.find(
    binding =>
      binding.semanticType === semanticType
  ) || null
}


export function findTypeBindingsBySchemaType(
  bindings,
  schemaType
) {

  if (!schemaType) {
    return []
  }

  return bindings.filter(
    binding =>
      binding.schemaType === schemaType
  )
}


export function resolveSchemaType(
  bindings,
  semanticType
) {

  const binding =
    findTypeBinding(
      bindings,
      semanticType
    )

  return binding
    ? binding.schemaType
    : null
}