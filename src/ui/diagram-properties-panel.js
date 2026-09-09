export function createDiagramPropertiesPanel({
  container,
  bpmnPropertiesContainer
} = {}) {

  if (
    !container
  ) {

    throw new Error(
      'Diagram properties panel requires a container'
    )
  }


  if (
    !bpmnPropertiesContainer
  ) {

    throw new Error(
      'Diagram properties panel requires a BPMN properties container'
    )
  }


  /*
   * ------------------------------------------------------------
   * Display helpers
   * ------------------------------------------------------------
   */

  function showDiagramProperties() {

    bpmnPropertiesContainer
      .style
      .display =
        'none'


    container
      .style
      .display =
        'block'
  }


  function showBpmnProperties() {

    container
      .style
      .display =
        'none'


    bpmnPropertiesContainer
      .style
      .display =
        'block'
  }


  /*
   * ------------------------------------------------------------
   * Rendering
   * ------------------------------------------------------------
   */

  function render(
    diagram
  ) {

    if (
      !diagram
    ) {

      clear()

      return
    }


    const plane =
      diagram.plane ||
      null


    const subject =
      plane?.bpmnElement ||
      null


    container.innerHTML =
      `
        <div
          style="
            box-sizing:border-box;
            width:100%;
            min-height:100%;
            padding:14px;
            font-family:Arial, sans-serif;
            font-size:13px;
            color:#263238;
            background:#FFFFFF;
          "
        >

          <div
            style="
              font-size:15px;
              font-weight:600;
              margin-bottom:16px;
            "
          >
            Diagram
          </div>


          ${propertyRow(
            'Type',
            diagram.$type ||
            'bpmndi:BPMNDiagram'
          )}


          ${propertyRow(
            'ID',
            diagram.id
          )}


          ${propertyRow(
            'Name',
            diagram.name
          )}


          ${propertyRow(
            'Resolution',
            diagram.resolution
          )}


          <div
            style="
              margin-top:20px;
              margin-bottom:8px;
              padding-top:12px;
              border-top:1px solid #D4DCE6;
              font-size:12px;
              font-weight:600;
              text-transform:uppercase;
              color:#607080;
            "
          >
            Plane
          </div>


          ${propertyRow(
            'Plane ID',
            plane?.id
          )}


          <div
            style="
              margin-top:20px;
              margin-bottom:8px;
              padding-top:12px;
              border-top:1px solid #D4DCE6;
              font-size:12px;
              font-weight:600;
              text-transform:uppercase;
              color:#607080;
            "
          >
            Subject
          </div>


          ${propertyRow(
            'Type',
            subject?.$type
          )}


          ${propertyRow(
            'ID',
            subject?.id
          )}


          ${propertyRow(
            'Name',
            subject?.name
          )}

        </div>
      `


    showDiagramProperties()
  }


  /*
   * ------------------------------------------------------------
   * Property row
   * ------------------------------------------------------------
   */

  function propertyRow(
    label,
    value
  ) {

    const displayValue =
      value === undefined ||
      value === null ||
      value === ''
        ? '—'
        : String(
            value
          )


    return `
      <div
        style="
          margin-bottom:12px;
        "
      >

        <div
          style="
            margin-bottom:3px;
            font-size:11px;
            font-weight:600;
            color:#607080;
          "
        >
          ${escapeHtml(
            label
          )}
        </div>

        <div
          style="
            min-height:18px;
            line-height:18px;
            overflow-wrap:anywhere;
          "
        >
          ${escapeHtml(
            displayValue
          )}
        </div>

      </div>
    `
  }


  /*
   * ------------------------------------------------------------
   * HTML escaping
   * ------------------------------------------------------------
   */

  function escapeHtml(
    value
  ) {

    return String(
      value
    )
      .replaceAll(
        '&',
        '&amp;'
      )
      .replaceAll(
        '<',
        '&lt;'
      )
      .replaceAll(
        '>',
        '&gt;'
      )
      .replaceAll(
        '"',
        '&quot;'
      )
      .replaceAll(
        "'",
        '&#039;'
      )
  }


  /*
   * ------------------------------------------------------------
   * Clear
   * ------------------------------------------------------------
   */

  function clear() {

    container.innerHTML =
      ''

    showBpmnProperties()
  }


  /*
   * ------------------------------------------------------------
   * Initial state
   * ------------------------------------------------------------
   */

  showBpmnProperties()


  /*
   * ------------------------------------------------------------
   * Public API
   * ------------------------------------------------------------
   */

  return {

    render,

    showDiagram:
      render,

    showBpmnProperties,

    clear
  }
}