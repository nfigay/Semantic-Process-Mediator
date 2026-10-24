import { describe, expect, it } from 'vitest'
import fs from 'node:fs'

const source = fs.readFileSync(new URL('./main.js', import.meta.url), 'utf8')

describe('WS-01 initial lifecycle guard', () => {
  it('keeps WelcomeView visible after technical baseline import', () => {
    const start = source.indexOf('let initialWorkspaceCanvasBaseline = null')
    const end = source.indexOf('/*\n * ------------------------------------------------------------\n * Open published BPMN', start)
    expect(start).toBeGreaterThanOrEqual(0)
    expect(source.slice(start, end)).toContain('await layout.setModelActive(false)')
  })
  it('rejects Save As Archive without an explicit Workspace identity', () => {
    const start = source.indexOf('async function saveWorkspaceAsArchive()')
    const end = source.indexOf('\napp =\n  createApp({', start)
    const body = source.slice(start, end)
    expect(body).toContain('if (!workspace?.workspaceId)')
    expect(body.indexOf('if (!workspace?.workspaceId)')).toBeLessThan(body.indexOf('writeNewWorkspaceArchive('))
  })
  it('rejects Save Archive without an explicit Workspace identity', () => {
    const start = source.indexOf('async onSaveWorkspaceArchive()')
    const end = source.indexOf('\n      },', start)
    const body = source.slice(start, end)
    expect(body).toContain('if (!workspace?.workspaceId) return false')
    expect(body.indexOf('if (!workspace?.workspaceId)')).toBeLessThan(body.indexOf('flushForSnapshot'))
  })
})
