import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./repository-browser.js', import.meta.url), 'utf8')

describe('repository browser Models projection contract', () => {
  it('keeps Models distinct from Sources and reuses the existing model hierarchy builders', () => {
    expect(source).toMatch(/activeView === 'sources'[\s\S]*buildSourcesViewNodes/)
    expect(source).toMatch(/activeView === 'models'[\s\S]*buildModelsViewNodes/)
    expect(source).toMatch(/function buildModelsViewNodes[\s\S]*buildProcessesRoot\(projection\.processes\)[\s\S]*buildCollaborationsRoot\(projection\.collaborations\)[\s\S]*buildArchimateRoot\(projection\.archimate\)/)
  })
})
