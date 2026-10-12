const base = import.meta.env.BASE_URL || '/'
export const eaSefUrl = () => base + 'ea-import/ea-to-bpmn-FLOW-CONV-06.sef.json'
let pending
export function loadEaSaxonRuntime() {
  if (globalThis.SaxonJS?.transform) return Promise.resolve(globalThis.SaxonJS)
  if (pending) return pending
  pending = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = base + 'ea-import/SaxonJS2.rt.js'
    script.onload = () => globalThis.SaxonJS?.transform ? resolve(globalThis.SaxonJS) : reject(new Error('Saxon-JS browser runtime did not initialize'))
    script.onerror = () => reject(new Error('Saxon-JS browser runtime unavailable: ' + script.src))
    document.head.appendChild(script)
  }).catch(error => { pending = null; throw error })
  return pending
}
