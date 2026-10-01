import { describe, expect, it } from 'vitest'
import fs from 'node:fs'

const packageJson = JSON.parse(
  fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8')
)

const modeler = fs.readFileSync(new URL('./create-modeler.js', import.meta.url), 'utf8')
const main = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8')

describe('BPMN visual coloring capability', () => {
  it('uses the BPMNSM Appearance editor instead of the community color picker', () => {
    expect(packageJson.dependencies['bpmn-js-color-picker']).toBeUndefined()
    expect(modeler).not.toContain('bpmn-js-color-picker')
    expect(main).not.toContain('bpmn-js-color-picker')
  })
})
