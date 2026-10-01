import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'

const root = process.cwd()
const source = fs.readFileSync(
  path.join(root, 'src/publication/hosted-process-viewer.js'),
  'utf8'
)

describe('hosted Process Viewer embed projection', () => {
  test('projects embed through the shared Viewer workspace', () => {
    expect(source).toContain('const consultationContext = readHostedProcessViewerDeepLink')
    expect(source).toContain('embedded: consultationContext.embedded')
    expect(source).not.toContain('createEmbeddedProcessViewer')
  })
})
