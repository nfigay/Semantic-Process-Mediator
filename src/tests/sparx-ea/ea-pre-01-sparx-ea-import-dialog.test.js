import fs from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(
  new URL('../../ui/dialogs/sparx-ea-import-dialog.js', import.meta.url),
  'utf8'
)

describe('EA-PRE-01 — preprocessing report dialog', () => {
  it('keeps independent BPMN and XMI user actions', () => {
    expect(source).toContain('state?.onSelectBpmn?.()')
    expect(source).toContain('state?.onSelectXmi?.()')
    expect(source).toContain('Convert to BPMN TextAnnotation')
    expect(source).toContain('Exclude from published BPMN')
    expect(source).toContain('state.onApplyNativeNotePolicy?.')
  })

  it('renders all preprocessing evidence categories', () => {
    expect(source).toContain('setSparxEaPreprocessingReport')
    for (const field of [
      'prepared?.repairs',
      'prepared?.unresolvedIssues',
      'prepared?.warnings',
      'prepared?.publicationPolicyRequired',
      'prepared?.provenance'
    ]) expect(source).toContain(field)
  })
})
