import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
const source = fs.readFileSync(new URL('../../ui/dialogs/sparx-ea-import-dialog.js', import.meta.url), 'utf8')
describe('EA XMI import dialog', () => {
  it('uses one XMI source and displays progress', () => {
    expect(source).toContain('state?.onSelectXmi?.()')
    expect(source).toContain('setSparxEaImportStatus')
    expect(source).not.toContain('onSelectBpmn')
  })
})
