import {
  w2layout,
  w2popup,
  w2toolbar
} from 'w2ui'

import 'w2ui/w2ui-2.0.min.css'

const MIN_ZOOM = 0.2
const MAX_ZOOM = 4
const ZOOM_FACTOR = 1.2
const BRANDING_PANEL_SIZE = 34

const BPMNSM_PROJECT_URL =
  'https://github.com/nfigay/Semantic-Process-Mediator'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function openBpmnsmBrandingPopup() {
  w2popup.open({
    title: 'BPMNSM',
    width: 440,
    height: 230,
    showClose: true,
    showMax: false,
    modal: false,
    body: `
      <div style="padding: 22px 26px; line-height: 1.5; text-align: center;">
        <div style="font-size: 24px; font-weight: 600; margin-bottom: 10px;">BPMNSM</div>
        <div style="margin-bottom: 18px;">Semantic Process Mediator</div>
        <a href="${BPMNSM_PROJECT_URL}"
           target="_blank"
           rel="noopener noreferrer">BPMNSM on GitHub</a>
      </div>
    `
  })
}

function createBrandingHtml(contentProvider) {
  const providerName = contentProvider?.name
    ? escapeHtml(contentProvider.name)
    : ''

  return `
    <footer class="publication-branding"
            aria-label="Publication branding"
            style="height: 100%; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 12px; padding: 0 10px; box-sizing: border-box; white-space: nowrap; overflow: hidden;">
      <div style="justify-self: start;">
        <button type="button"
                id="publication-brand-bpmnsm"
                aria-label="About BPMNSM"
                style="border: 0; background: transparent; padding: 3px 7px; cursor: pointer; font: inherit; font-weight: 600;">
          BPMNSM
        </button>
      </div>
      <div id="publication-content-provider"
           aria-label="Content provider"
           ${providerName ? '' : 'hidden'}
           style="justify-self: center; overflow: hidden; text-overflow: ellipsis; max-width: 40vw;">
        ${providerName ? `Content provided by ${providerName}` : ''}
      </div>
      <div id="publication-bpmn-attribution-slot"
           aria-label="Powered by bpmn.io"></div>
    </footer>
  `
}

export function createHostedProcessViewerWorkspace({
  container,
  onFit,
  onZoomIn,
  onZoomOut,
  onResize,
  embedded = false,
  contentProvider = null
} = {}) {
  if (!container) {
    throw new Error('Hosted process viewer workspace container is required')
  }

  let layout = null
  let contentLayout = null

  const toolbar = new w2toolbar({
    name: 'publication_process_toolbar',
    items: [
      { id: 'fit', type: 'button', text: 'Fit', tooltip: 'Fit process to viewport' },
      { type: 'break' },
      { id: 'zoom-out', type: 'button', text: '−', tooltip: 'Zoom out' },
      { id: 'zoom-in', type: 'button', text: '+', tooltip: 'Zoom in' },
      { type: 'break' },
      {
        id: 'view',
        type: 'menu-check',
        text: 'View',
        selected: [ 'properties' ],
        items: [
          { id: 'properties', text: 'Properties' }
        ]
      }
    ],
    onClick(event) {
      switch (event.target) {
      case 'fit':
        onFit?.()
        break
      case 'zoom-out':
        onZoomOut?.()
        break
      case 'zoom-in':
        onZoomIn?.()
        break
      default: {
        const target = String(event.target || '')
        const subItemId =
          event?.detail?.subItem?.id ||
          event?.subItem?.id ||
          target.split(':').at(-1)

        if (target.startsWith('view') && subItemId === 'properties') {
          const selected = toolbar.get('view')?.selected || []
          const propertiesAreVisible = selected.includes('properties')

          if (propertiesAreVisible) {
            layout?.hide('right', true)
          } else {
            layout?.show('right', true)
          }

          onResize?.()
        }
        break
      }
      }
    }
  })

  // Outer workspace owns the application-level split between the BPMN
  // consultation area and Properties. Branding is deliberately NOT a panel of
  // this layout: it belongs to the consultation area only.
  layout = new w2layout({
    name: 'publication_process_layout',
    box: container,
    panels: [
      {
        type: 'main'
      },
      {
        type: 'right',
        size: embedded ? 320 : 360,
        minSize: 260,
        resizable: true,
        ...(embedded ? {} : { title: 'Properties' })
      }
    ],
    onResize(event) {
      event.done(() => {
        contentLayout?.resize()
        onResize?.()
      })
    }
  })

  layout.el('right').innerHTML =
    '<aside id="publication-properties" aria-label="Read-only process properties"></aside>'

  // Follow the established BPMNSM nested-layout pattern: W2UI owns the outer
  // panel geometry, while the nested layout receives a dedicated 100% x 100%
  // box inside that panel. Do not use the W2UI panel-content node itself as
  // the nested widget box.
  layout.el('main').innerHTML = `
    <div id="publication-process-content-layout"
         style="width:100%; height:100%; overflow:hidden;"></div>
  `

  // The consultation area is itself a native W2UI layout. Its two panes are
  // the hard structural boundary requested by the Viewer contract:
  //   main   = BPMN viewport only
  //   bottom = contributors / branding only
  // Consequently bpmn-js receives exactly the rectangle of the upper pane;
  // no CSS subtraction, SVG resizing or diagram safe-area is necessary.
  contentLayout = new w2layout({
    name: 'publication_process_content_layout',
    box: '#publication-process-content-layout',
    panels: [
      {
        type: 'main',
        style: 'overflow: hidden;'
      },
      {
        type: 'bottom',
        size: BRANDING_PANEL_SIZE,
        minSize: BRANDING_PANEL_SIZE,
        maxSize: BRANDING_PANEL_SIZE,
        resizable: false,
        style: 'border-top: 1px solid #e5e5e5; background: #fff; overflow: visible;'
      }
    ],
    onResize(event) {
      event.done(() => onResize?.())
    }
  })

  // assignToolbar() refreshes its target panel. Do this before mounting the
  // application-owned BPMN host so W2UI cannot detach an existing canvas.
  contentLayout.assignToolbar('main', toolbar)

  contentLayout.el('main').innerHTML = `
    <main id="publication-viewer"
          aria-label="BPMN process publication"
          style="position:absolute; inset:0; overflow:hidden;"></main>
  `

  contentLayout.el('bottom').innerHTML = createBrandingHtml(contentProvider)

  // The nested widget has now rendered into its final outer-panel rectangle.
  // Force one public W2UI resize pass before bpmn-js is created so the main
  // and contributors panes expose their definitive dimensions.
  contentLayout.resize()

  const bpmnsmBrand = container.querySelector('#publication-brand-bpmnsm')
  bpmnsmBrand?.addEventListener('click', openBpmnsmBrandingPopup)

  function setZoom(value) {
    return clamp(value, MIN_ZOOM, MAX_ZOOM)
  }

  return {
    layout,
    contentLayout,
    toolbar,
    setZoom,
    zoomFactor: ZOOM_FACTOR,
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    getViewerContainer() {
      return container.querySelector('#publication-viewer')
    },
    getPropertiesContainer() {
      return container.querySelector('#publication-properties')
    },
    getAttributionContainer() {
      return container.querySelector('#publication-bpmn-attribution-slot')
    },
    destroy() {
      bpmnsmBrand?.removeEventListener('click', openBpmnsmBrandingPopup)
      toolbar.destroy()
      contentLayout.destroy()
      layout.destroy()
    }
  }
}
