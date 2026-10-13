const embeddedPayload = id => document.getElementById(id)?.textContent?.trim() || null

function decodeEmbeddedPayload(id) {
  const payload = embeddedPayload(id)
  if (!payload) return null
  const binary = atob(payload)
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function eaEmbeddedStylesheetText() {
  return decodeEmbeddedPayload('bpmnsm-ea-embedded-sef')
}

const base = import.meta.env.BASE_URL || '/'
export const eaSefUrl = () => base + 'ea-import/ea-to-bpmn-FLOW-CONV-06.sef.json'
let pending
export function loadEaSaxonRuntime() {
  if (globalThis.SaxonJS?.transform) return Promise.resolve(globalThis.SaxonJS)
  if (pending) return pending
  pending = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    const embeddedRuntime = decodeEmbeddedPayload('bpmnsm-ea-embedded-runtime')
    if (location.protocol === 'file:' && embeddedRuntime) {
      script.textContent = embeddedRuntime
    } else {
      script.src = base + 'ea-import/SaxonJS2.rt.js'
    }
    script.onload = () => globalThis.SaxonJS?.transform ? resolve(globalThis.SaxonJS) : reject(new Error('Saxon-JS browser runtime did not initialize'))
    script.onerror = () => reject(new Error('Saxon-JS browser runtime unavailable: ' + script.src))
    document.head.appendChild(script)
    if (location.protocol === 'file:' && embeddedRuntime) {
      if (globalThis.SaxonJS?.transform) resolve(globalThis.SaxonJS)
      else reject(new Error('Embedded Saxon-JS browser runtime did not initialize'))
    }
  }).catch(error => { pending = null; throw error })
  return pending
}
