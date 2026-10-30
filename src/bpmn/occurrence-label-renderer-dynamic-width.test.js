import { describe, it, expect, vi } from 'vitest'

// Rendering geometry is exercised without requiring a browser DOM.
// The SVG adapter is a boundary stub; label text and geometry are real.
vi.mock('tiny-svg', async (importOriginal) => ({
  ...(await importOriginal()),
  append: vi.fn(),
  classes: () => ({ add: vi.fn() })
}))

import { OccurrenceLabelRenderer } from './occurrence-label-renderer.js'

const cases = [
  { type: 'bpmn:DataObjectReference', masterKey: 'dataObjectRef' },
  { type: 'bpmn:DataStoreReference', masterKey: 'dataStoreRef' }
]

describe('derived occurrence label geometry', () => {
  for (const { type, masterKey } of cases) {
    it(`draws the derived text using native label geometry after explicit name is erased (${type})`, () => {
      const calls = []
      const renderer = Object.create(OccurrenceLabelRenderer.prototype)
      renderer._textRenderer = {
        getExternalLabelBounds: (box, text) => {
          calls.push({ kind: 'measure', box, text })
          return { x: 0, y: 0, width: 210, height: 20 }
        },
        getExternalStyle: () => ({}),
        createText: (text, opts) => {
          calls.push({ kind: 'draw', text, opts })
          return { nodeType: 1 }
        }
      }
      const businessObject = {
        $type: type,
        name: 'Référence explicite',
        [masterKey]: { name: 'Commande à traiter' },
        dataState: { name: 'draft' }
      }
      const label = { width: 90, height: 20, labelTarget: { businessObject } }
      const group = { nodeType: 1 }

      renderer.drawShape(group, label)
      expect(calls[0].text).toBe('Référence explicite')
      calls.length = 0

      businessObject.name = ''
      renderer.drawShape(group, label)
      expect(calls).toHaveLength(1)
      expect(calls[0]).toMatchObject({ kind: 'draw', text: 'Commande à traiter [draft]' })
      expect(calls[0].opts.box.width).toBe(label.width)
      expect(businessObject.name).toBe('')
    })
  }
})
