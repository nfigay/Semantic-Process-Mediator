/*
 * Workspace Tree text filtering.
 *
 * This is deliberately a UI-only projection step. It never mutates the
 * Environment projection or the input W2UI node graph.
 */

export function filterWorkspaceTreeNodes(
  nodes,
  query
) {

  const normalizedQuery =
    String(query || '')
      .trim()
      .toLocaleLowerCase()


  if (!normalizedQuery) {
    return nodes
  }


  return (nodes || [])
    .map(node => filterNode(node, normalizedQuery))
    .filter(Boolean)
}


function filterNode(
  node,
  normalizedQuery
) {

  const matches =
    String(node?.text || '')
      .toLocaleLowerCase()
      .includes(normalizedQuery)


  if (matches) {
    return node
  }


  const filteredChildren =
    (node?.nodes || [])
      .map(child => filterNode(child, normalizedQuery))
      .filter(Boolean)


  if (filteredChildren.length === 0) {
    return null
  }


  return {
    ...node,
    nodes: filteredChildren
  }
}
