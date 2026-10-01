import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer'

import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'

const container = document.querySelector('#bpmn-proof')
const status = document.querySelector('#bpmn-proof-status')

function setStatus(message, state) {
  status.textContent = message
  status.dataset.state = state
  console.info('[BPMN proof]', state, message)
}

async function main() {
  try {
    setStatus('Fetching BPMN…', 'fetching')

    const url = `${import.meta.env.BASE_URL}publications/process/gs-pub-01.bpmn`
    const response = await fetch(url, { cache: 'no-store' })

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`)
    }

    const xml = await response.text()

    setStatus('Creating bpmn-js viewer…', 'creating')

    const viewer = new NavigatedViewer({ container })

    setStatus('Importing BPMN…', 'importing')

    const { warnings = [] } = await viewer.importXML(xml)

    if (warnings.length) {
      console.warn('[BPMN proof warnings]', warnings)
    }

    viewer.get('canvas').zoom('fit-viewport')

    setStatus('BPMN ready', 'ready')
  } catch (error) {
    console.error('[BPMN proof failed]', error)
    setStatus(`ERROR: ${error?.message || error}`, 'error')
  }
}

main()
