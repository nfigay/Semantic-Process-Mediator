export function createDiagramActions({
  modeler,
  layout,
  linter,

  importBpmn,
  exportBpmnXml,
  exportBpmnSvg,
  download,

  extractPalette,

  readRepositoryContext,
  applyLintContext,

  alert
}) {

  async function loadDiagram(xml) {

    try {

      await importBpmn(
        modeler,
        xml
      )


      extractPalette({
        layout
      })


      const context =
        readRepositoryContext?.() || {}


      if (applyLintContext) {

        applyLintContext(
          context
        )

      } else {

        // Compatibility fallback.
        linter.setCoc(
          context.cocOwner || null
        )

        linter.setProfile(
          context.maturity || 'L1'
        )
      }


      linter.run()

    } catch (err) {

      console.error(
        'loadDiagram error:',
        err
      )

      alert?.(
        'Unable to import BPMN diagram'
      )
    }
  }


  async function exportXML() {

    try {

      const result =
        await exportBpmnXml(
          modeler
        )


      download(
        result.xml,
        'process.bpmn',
        'application/xml'
      )

    } catch (err) {

      console.error(
        'exportXML error:',
        err
      )

      alert?.(
        'Unable to export BPMN XML'
      )
    }
  }


  async function exportSVG() {

    try {

      const result =
        await exportBpmnSvg(
          modeler
        )


      download(
        result.svg,
        'process.svg',
        'image/svg+xml'
      )

    } catch (err) {

      console.error(
        'exportSVG error:',
        err
      )

      alert?.(
        'Unable to export BPMN SVG'
      )
    }
  }


  return {
    loadDiagram,
    exportXML,
    exportSVG
  }
}