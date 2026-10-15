import { describe, expect, it } from 'vitest'
import fs from 'node:fs'

const mainSource = () => fs.readFileSync(new URL('./main.js', import.meta.url), 'utf8')
function actionBody(source, action) {
  const declaration = new RegExp(`^\\s+(?:async\\s+)?${action}\\(`, "m")
  const start = declaration.exec(source)?.index ?? -1
  expect(start, `${action} exists`).toBeGreaterThanOrEqual(0)
  const end = source.indexOf('\n      },', start)
  expect(end, `${action} terminates`).toBeGreaterThan(start)
  return source.slice(start, end)
}

describe('main active Repository Workspace Archive operations', () => {
  it('Export Workspace Archive retains a complete active Repository snapshot', () => {
    const body = actionBody(mainSource(), 'onExportWorkspaceArchive')
    expect(body).toContain('resolveActiveRepository()')
    expect(body).toMatch(/repository\.documents\.getDocuments\(\)/)
    expect(body).toContain('createRepositoryWorkspaceArchive')
    expect(body).toMatch(/includeClean\s*:\s*true/)
    expect(body).toContain('download(')
    expect(body).toContain('application/zip')
  })

  it('Save As Archive uses physical write and readback before workspace association', () => {
    const body = actionBody(mainSource(), 'onSaveWorkspaceAsArchive')
    expect(body).toContain('resolveActiveRepository()')
    expect(body).toMatch(/repository\.documents\.getDocuments\(\)/)
    expect(body).toContain('createRepositoryWorkspaceArchive')
    expect(body).toMatch(/includeClean\s*:\s*true/)
    expect(body).toContain('writeNewWorkspaceArchive(')
    expect(body).toContain('readRepositoryWorkspaceArchive(stored)')
    expect(body.indexOf('writeNewWorkspaceArchive(')).toBeLessThan(body.indexOf('Object.assign(workspace,'))
  })

  it('Save Archive does not pretend to overwrite an associated destination yet', () => {
    const body = actionBody(mainSource(), 'onSaveWorkspaceArchive')
    expect(body).toMatch(/return false/)
    expect(body).not.toContain('download(')
  })
})
