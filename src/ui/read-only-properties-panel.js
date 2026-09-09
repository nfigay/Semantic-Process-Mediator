export function createReadOnlyPropertiesPanel({
  modeler,
  container = '#bpmn-props'
} = {}) {

  const element =
    typeof container ===
    'string'
      ? document.querySelector(
          container
        )
      : container


  if (
    !element
  ) {

    throw new Error(
      `Read-only properties container not found: ${container}`
    )
  }


  const eventBus =
    modeler.get(
      'eventBus'
    )


  let selectedElement =
    null


  let selectedBusinessObject =
    null


  let activeTab =
    'model'


  function escapeHtml(
    value
  ) {

    return String(
      value ?? ''
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


  function getDefinitions() {

    try {

      return modeler
        .getDefinitions()

    } catch {

      return null
    }
  }


  function getExtensionValues(
    businessObject
  ) {

    return (
      businessObject
        ?.extensionElements
        ?.values ||
      []
    )
  }


  function findDefinitionsExtension(
    type
  ) {

    const definitions =
      getDefinitions()


    const values =
      getExtensionValues(
        definitions
      )


    return (
      values.find(
        value =>
          value.$type ===
          type
      ) ||
      null
    )
  }


  function getRepositoryContext() {

    return findDefinitionsExtension(
      'semarch:RepositoryContext'
    )
  }


  function getMethodConfiguration() {

    return findDefinitionsExtension(
      'semarch:MethodConfiguration'
    )
  }


  function getDocumentation(
    businessObject
  ) {

    const documentation =
      businessObject
        ?.documentation


    if (
      !Array.isArray(
        documentation
      )
    ) {

      return ''
    }


    return documentation
      .map(
        item =>
          item?.text || ''
      )
      .filter(
        Boolean
      )
      .join(
        '\n\n'
      )
  }


  function getScalarProperties(
    object
  ) {

    if (
      !object
    ) {

      return []
    }


    const properties =
      []


    for (
      const [
        key,
        value
      ]
      of Object.entries(
        object
      )
    ) {

      if (
        key.startsWith(
          '$'
        )
      ) {
        continue
      }


      if (
        value ===
          null ||
        value ===
          undefined ||
        typeof value ===
          'object'
      ) {
        continue
      }


      properties.push({
        key,
        value
      })
    }


    return properties
  }


  function isSemArchExtension(
    extension
  ) {

    return (
      extension
        ?.$type
        ?.startsWith(
          'semarch:'
        ) ===
      true
    )
  }


  function renderRows(
    properties
  ) {

    if (
      !properties.length
    ) {

      return `
        <div
          style="
            color:#888888;
            font-style:italic;
          "
        >
          No data
        </div>
      `
    }


    return `
      <div
        style="
          display:grid;
          grid-template-columns:
            minmax(100px, 120px)
            minmax(0, 1fr);
          gap:8px 12px;
        "
      >
        ${
          properties
            .map(
              property => `
                <div
                  style="
                    font-weight:600;
                    color:#555555;
                  "
                >
                  ${escapeHtml(
                    property.key
                  )}
                </div>

                <div
                  style="
                    overflow-wrap:anywhere;
                  "
                >
                  ${escapeHtml(
                    property.value
                  )}
                </div>
              `
            )
            .join('')
        }
      </div>
    `
  }


  function renderSectionTitle(
    title
  ) {

    return `
      <div
        style="
          margin-bottom:10px;

          font-size:11px;
          font-weight:700;

          letter-spacing:.08em;
          text-transform:uppercase;

          color:#666666;
        "
      >
        ${escapeHtml(
          title
        )}
      </div>
    `
  }


  function renderModelObject({
    title,
    object
  }) {

    return `
      <div
        style="
          margin-top:10px;
          padding:10px;

          border:1px solid #dddddd;
          border-radius:4px;

          background:#fafafa;
        "
      >

        <div
          style="
            margin-bottom:8px;

            font-size:11px;
            font-weight:700;
            letter-spacing:.04em;

            color:#333333;
          "
        >
          ${escapeHtml(
            title
          )}
        </div>

        ${
          object
            ? renderRows(
                getScalarProperties(
                  object
                )
              )
            : `
              <div
                style="
                  color:#888888;
                  font-style:italic;
                "
              >
                Not defined
              </div>
            `
        }

      </div>
    `
  }


  function renderModelSection() {

    const repositoryContext =
      getRepositoryContext()


    const methodConfiguration =
      getMethodConfiguration()


    return `
      <div>

        ${renderSectionTitle(
          'Model'
        )}


        ${renderModelObject({
          title:
            'Repository Context',

          object:
            repositoryContext
        })}


        ${renderModelObject({
          title:
            'Method Configuration',

          object:
            methodConfiguration
        })}

      </div>
    `
  }


  function renderExtension(
    extension
  ) {

    const properties =
      getScalarProperties(
        extension
      )


    return `
      <div
        style="
          margin-top:10px;
          padding:10px;

          border:1px solid #dddddd;
          border-radius:4px;

          background:#fafafa;
        "
      >

        <div
          style="
            margin-bottom:8px;

            font-size:11px;
            font-weight:700;
            letter-spacing:.04em;

            color:#333333;
          "
        >
          ${escapeHtml(
            extension.$type ||
            'Extension'
          )}
        </div>

        ${renderRows(
          properties
        )}

      </div>
    `
  }


  function renderExtensionGroup({
    title,
    extensions,
    emptyMessage
  }) {

    return `
      <div
        style="
          margin-top:18px;
          padding-top:14px;

          border-top:1px solid #dddddd;
        "
      >

        ${renderSectionTitle(
          title
        )}


        ${
          extensions.length
            ? extensions
                .map(
                  renderExtension
                )
                .join('')
            : `
              <div
                style="
                  color:#888888;
                  font-style:italic;
                "
              >
                ${escapeHtml(
                  emptyMessage
                )}
              </div>
            `
        }

      </div>
    `
  }


  function renderElementSection() {

    const businessObject =
      selectedBusinessObject ||
      selectedElement
        ?.businessObject


    if (
      !businessObject
    ) {

      return `
        <div>

          ${renderSectionTitle(
            'Element'
          )}


          <div
            style="
              color:#777777;
            "
          >
            Select a BPMN element
            to inspect its properties.
          </div>

        </div>
      `
    }


    const documentation =
      getDocumentation(
        businessObject
      )


    const extensions =
      getExtensionValues(
        businessObject
      )


    const semarchExtensions =
      extensions.filter(
        extension =>
          isSemArchExtension(
            extension
          )
      )


    const otherExtensions =
      extensions.filter(
        extension =>
          !isSemArchExtension(
            extension
          )
      )


    return `
      <div>

        ${renderSectionTitle(
          'BPMN'
        )}


        <div
          style="
            display:grid;
            grid-template-columns:
              90px
              minmax(0, 1fr);
            gap:8px 12px;
          "
        >

          <div
            style="
              font-weight:600;
              color:#555555;
            "
          >
            Type
          </div>

          <div>
            ${escapeHtml(
              businessObject.$type
            )}
          </div>


          <div
            style="
              font-weight:600;
              color:#555555;
            "
          >
            ID
          </div>

          <div
            style="
              overflow-wrap:anywhere;
              font-family:monospace;
            "
          >
            ${escapeHtml(
              businessObject.id
            )}
          </div>


          <div
            style="
              font-weight:600;
              color:#555555;
            "
          >
            Name
          </div>

          <div>
            ${
              businessObject.name
                ? escapeHtml(
                    businessObject.name
                  )
                : `
                  <span
                    style="
                      color:#888888;
                      font-style:italic;
                    "
                  >
                    —
                  </span>
                `
            }
          </div>

        </div>


        <div
          style="
            margin-top:18px;
            padding-top:14px;

            border-top:1px solid #dddddd;
          "
        >

          <div
            style="
              margin-bottom:8px;
              font-weight:700;
            "
          >
            Documentation
          </div>

          <div
            style="
              white-space:pre-wrap;
              overflow-wrap:anywhere;
            "
          >
            ${
              documentation
                ? escapeHtml(
                    documentation
                  )
                : `
                  <span
                    style="
                      color:#888888;
                      font-style:italic;
                    "
                  >
                    No documentation
                  </span>
                `
            }
          </div>

        </div>


        ${renderExtensionGroup({
          title:
            'SemArch',

          extensions:
            semarchExtensions,

          emptyMessage:
            'No SemArch properties'
        })}


        ${renderExtensionGroup({
          title:
            'Other Extensions',

          extensions:
            otherExtensions,

          emptyMessage:
            'No other extensions'
        })}

      </div>
    `
  }


  function renderTabs() {

    const elementActive =
      activeTab ===
      'element'


    const modelActive =
      activeTab ===
      'model'


    return `
      <div
        style="
          display:flex;

          margin-bottom:16px;

          border-bottom:1px solid #d0d0d0;
        "
      >

        <button
          type="button"
          data-properties-tab="element"

          style="
            appearance:none;

            padding:8px 12px;

            border:0;
            border-bottom:
              2px solid
              ${
                elementActive
                  ? '#333333'
                  : 'transparent'
              };

            background:transparent;

            font-size:12px;
            font-weight:
              ${
                elementActive
                  ? '700'
                  : '500'
              };

            color:
              ${
                elementActive
                  ? '#222222'
                  : '#777777'
              };

            cursor:pointer;
          "
        >
          Element
        </button>


        <button
          type="button"
          data-properties-tab="model"

          style="
            appearance:none;

            padding:8px 12px;

            border:0;
            border-bottom:
              2px solid
              ${
                modelActive
                  ? '#333333'
                  : 'transparent'
              };

            background:transparent;

            font-size:12px;
            font-weight:
              ${
                modelActive
                  ? '700'
                  : '500'
              };

            color:
              ${
                modelActive
                  ? '#222222'
                  : '#777777'
              };

            cursor:pointer;
          "
        >
          Model
        </button>

      </div>
    `
  }


  function render() {

    element.innerHTML =
      `
        <div
          style="
            box-sizing:border-box;

            height:100%;
            overflow:auto;

            padding:16px;

            font-family:
              Arial,
              sans-serif;

            font-size:12px;
            line-height:1.4;

            color:#333333;
          "
        >

          <div
            style="
              font-size:13px;
              font-weight:700;

              margin-bottom:10px;
            "
          >
            Properties
          </div>


          ${renderTabs()}


          ${
            activeTab ===
              'element'
              ? renderElementSection()
              : renderModelSection()
          }

        </div>
      `


    bindTabEvents()
  }


  function bindTabEvents() {

    const tabs =
      element.querySelectorAll(
        '[data-properties-tab]'
      )


    tabs.forEach(
      tab => {

        tab.addEventListener(
          'click',
          () => {

            activeTab =
              tab.dataset
                .propertiesTab


            render()
          }
        )
      }
    )
  }


  function onSelectionChanged(
    event
  ) {

    const selection =
      event.newSelection ||
      []


    selectedBusinessObject =
      null


    selectedElement =
      selection.length ===
        1
        ? selection[0]
        : null


    if (
      selectedElement
    ) {

      activeTab =
        'element'
    }


    render()
  }


  function onImportDone() {

    selectedBusinessObject =
      null


    selectedElement =
      null


    activeTab =
      'model'


    render()
  }


  eventBus.on(
    'selection.changed',
    onSelectionChanged
  )


  eventBus.on(
    'import.done',
    onImportDone
  )


  render()


  return {

    render,


    showBusinessObject(
      businessObject
    ) {

      selectedBusinessObject =
        businessObject ||
        null


      selectedElement =
        null


      activeTab =
        businessObject
          ? 'element'
          : 'model'


      render()
    },


    showElement() {

      activeTab =
        'element'

      render()
    },


    showModel() {

      activeTab =
        'model'

      render()
    },


    clear() {

      selectedBusinessObject =
        null


      selectedElement =
        null

      activeTab =
        'model'

      render()
    },


    destroy() {

      eventBus.off(
        'selection.changed',
        onSelectionChanged
      )


      eventBus.off(
        'import.done',
        onImportDone
      )
    }
  }
}