export async function importBpmn(modeler, xml) {
  await modeler.importXML(xml)
  modeler.get('canvas').zoom('fit-viewport')
}

export async function exportBpmnXml(modeler) {
  return modeler.saveXML({ format: true })
}

export async function exportBpmnSvg(modeler) {
  return modeler.saveSVG()
}

export function download(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const a = document.createElement('a')

  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()

  URL.revokeObjectURL(a.href)
}