import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css'
import './hosted-process-viewer-branding.css'

import {
  createModeler
} from '../bpmn/create-modeler.js'

import {
  applyBpmnCapabilities
} from '../bpmn/apply-bpmn-capabilities.js'

import {
  loadHostedProcessPublication
} from './hosted-publication-loader.js'

import {
  createHostedProcessViewerWorkspace
} from './hosted-process-viewer-workspace.js'

import {
  readHostedProcessViewerDeepLink,
  stabilizeHostedProcessViewerElementDeepLink
} from './hosted-process-viewer-deep-link.js'

const shell = document.querySelector('#publication-shell')
const status = document.querySelector('#publication-status')

function setStatus(message, state = 'loading') {
  status.textContent = message
  status.dataset.state = state
}

function fitHostedProcessViewer(canvas) {
  canvas.resized?.()
  canvas.zoom('fit-viewport')
}

function moveNativeBpmnAttribution({ viewerContainer, attributionContainer }) {
  const attribution = viewerContainer
    ?.querySelector('.bjs-powered-by')

  if (!attribution || !attributionContainer) return false

  // Move the exact node created by bpmn-js. Do not clone or recreate it.
  attributionContainer.append(attribution)

  return true
}

async function main() {
  try {
    const publicationId = new URLSearchParams(window.location.search)
      .get('publication')

    if (!publicationId) {
      throw new Error('Missing ?publication=<id>')
    }

    const consultationContext = readHostedProcessViewerDeepLink(
      window.location.search
    )

    let viewer = null
    let canvas = null
    let workspace = null

    function currentZoom() {
      return canvas?.zoom() || 1
    }

    function setZoom(value) {
      if (!canvas || !workspace) return
      const zoom = workspace.setZoom(value)
      canvas.zoom(zoom)
    }

    workspace = createHostedProcessViewerWorkspace({
      container: shell,
      onFit() {
        if (!canvas) return
        fitHostedProcessViewer(canvas)
        workspace.setZoom(currentZoom())
      },
      onZoomOut() {
        setZoom(currentZoom() / workspace.zoomFactor)
      },
      onZoomIn() {
        setZoom(currentZoom() * workspace.zoomFactor)
      },
      onResize() {
        if (!canvas) return

        // A W2UI resize changes the real BPMN viewport rectangle (window,
        // DevTools docking, Properties pane, embed host, etc.). Merely
        // notifying diagram-js preserves the old viewport translation.
        // Re-fit against the definitive W2UI main pane, exactly like Fit.
        fitHostedProcessViewer(canvas)
        workspace?.setZoom(currentZoom())
      },
      embedded: consultationContext.embedded
    })

    const container = workspace.getViewerContainer()
    const propertiesContainer = workspace.getPropertiesContainer()
    const attributionContainer = workspace.getAttributionContainer()

    setStatus('Fetching publication…', 'fetching')

    const publication = await loadHostedProcessPublication({
      baseUrl: import.meta.env.BASE_URL,
      publicationId
    })

    const {
      bpmnXml: xml,
      profileRuntime,
      businessView
    } = publication

    setStatus('Creating BPMNSM viewer…', 'creating')

    // The publication reuses the same BPMN modeler + Properties providers as
    // the Editor. Viewer behaviour is obtained by constraining capabilities,
    // not by maintaining a parallel read-only Properties implementation.
    viewer = createModeler({
      container,
      propertiesPanel: propertiesContainer,
      profileRuntime,
      businessView,
      capabilities: {
        linting: false,
        colorPicker: false
      }
    })
    canvas = viewer.get('canvas')

    moveNativeBpmnAttribution({
      viewerContainer: container,
      attributionContainer
    })

    canvas.resized?.()

    applyBpmnCapabilities({
      modeler: viewer,
      editable: false,
      propertiesPanel: propertiesContainer
    })

    // Deep-link selection already drives the shared Properties Panel through
    // the normal bpmn-js selection service. Keep this adapter only for the
    // existing deep-link contract while the legacy read-only panel disappears.
    const readOnlyPropertiesPanel = {
      showBusinessObject() {}
    }

    setStatus('Importing BPMN…', 'importing')

    const { warnings = [] } = await viewer.importXML(xml)

    if (warnings.length) {
      console.warn('[Hosted Process Viewer warnings]', warnings)
    }

    fitHostedProcessViewer(canvas)
    workspace.setZoom(currentZoom())

    const definitions = viewer.getDefinitions()
    const process = definitions?.rootElements?.find(
      element => element?.$type === 'bpmn:Process'
    )

    document.title = process?.name || publicationId

    setStatus('Process ready', 'ready')
    status.hidden = true

    const { elementId } = consultationContext

    if (elementId) {
      const element = await stabilizeHostedProcessViewerElementDeepLink({
        viewer,
        canvas,
        readOnlyPropertiesPanel,
        elementId
      })

      if (!element) {
        console.warn(
          `[Hosted Process Viewer] Unknown deep-link element: ${elementId}`
        )
      }

      if (element) {
        // Deep-link stabilization updates selection/graphics asynchronously.
        // The final fit must run after those DOM updates, against the definitive
        // W2UI viewport. This is the same native fit operation as the toolbar.
        await new Promise(resolve => requestAnimationFrame(resolve))
        await new Promise(resolve => requestAnimationFrame(resolve))

        fitHostedProcessViewer(canvas)
        workspace.setZoom(currentZoom())
      }
    }
  } catch (error) {
    console.error('[Hosted Process Viewer failed]', error)
    setStatus(
      `Unable to load publication: ${error?.message || error}`,
      'error'
    )
  }
}

main()
