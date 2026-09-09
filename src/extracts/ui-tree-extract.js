export function createUiTreeExtract(
  nodes
) {

  const treeLines =
    formatTreeNodes(
      Array.isArray(nodes)
        ? nodes
        : []
    )


  return [
    'SemArch Extract',
    'Type: UI Tree',
    'Description: w2ui navigation projection — not the BPMN model',
    '',
    ...treeLines
  ].join('\n')
}


function formatTreeNodes(
  nodes,
  prefix = ''
) {

  const lines =
    []


  for (
    let index = 0;
    index < nodes.length;
    index += 1
  ) {

    const node =
      nodes[index]


    const isLast =
      index ===
      nodes.length - 1


    lines.push(
      `${prefix}${
        isLast
          ? '└─ '
          : '├─ '
      }${getNodeText(node)}`
    )


    const children =
      Array.isArray(
        node?.nodes
      )
        ? node.nodes
        : []


    if (
      children.length >
      0
    ) {

      lines.push(
        ...formatTreeNodes(
          children,
          prefix +
            (
              isLast
                ? '   '
                : '│  '
            )
        )
      )
    }
  }


  return lines
}


function getNodeText(
  node
) {

  if (
    typeof node?.text ===
    'string'
  ) {

    return node.text
  }


  if (
    node?.text ===
    null ||
    node?.text ===
    undefined
  ) {

    return ''
  }


  return String(
    node.text
  )
}