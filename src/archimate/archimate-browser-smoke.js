import ArchimateModeler from 'archimate-js/lib/Modeler'

const SMOKE_CONTAINER_ID = 'archimate-browser-smoke'

function removeExistingSmokeContainer() {
  const existingContainer = document.getElementById(SMOKE_CONTAINER_ID)

  if (existingContainer) {
    existingContainer.remove()
  }
}

function createSmokeContainer() {
  removeExistingSmokeContainer()

  const container = document.createElement('div')

  container.id = SMOKE_CONTAINER_ID

  Object.assign(container.style, {
    position: 'fixed',
    left: '20px',
    top: '20px',
    right: '20px',
    bottom: '20px',
    background: 'white',
    border: '2px solid #444',
    zIndex: '99999'
  })

  document.body.appendChild(container)

  return container
}

export async function runArchimateBrowserSmoke() {
  const container = createSmokeContainer()

  const modeler = new ArchimateModeler({
    container
  })

  console.log('[ArchiMate smoke] modeler created', modeler)

  try {
    const result = await modeler.createNewModel()

    console.log('[ArchiMate smoke] createNewModel result', result)

    const canvas = modeler.get('canvas')
    const elementRegistry = modeler.get('elementRegistry')

    console.log('[ArchiMate smoke] canvas', canvas)
    console.log(
      '[ArchiMate smoke] registered elements',
      elementRegistry.getAll()
    )

    window.BPMNSM_ARCHIMATE_SMOKE = {
      modeler,
      container,
      canvas,
      elementRegistry
    }

    console.log(
      '[ArchiMate smoke] SUCCESS — inspect window.BPMNSM_ARCHIMATE_SMOKE'
    )

    return window.BPMNSM_ARCHIMATE_SMOKE
  } catch (error) {
    console.error('[ArchiMate smoke] FAILURE', error)

    window.BPMNSM_ARCHIMATE_SMOKE = {
      modeler,
      container,
      error
    }

    throw error
  }
}

export function destroyArchimateBrowserSmoke() {
  const smoke = window.BPMNSM_ARCHIMATE_SMOKE

  if (smoke?.modeler?.destroy) {
    smoke.modeler.destroy()
  }

  removeExistingSmokeContainer()

  delete window.BPMNSM_ARCHIMATE_SMOKE

  console.log('[ArchiMate smoke] destroyed')
}