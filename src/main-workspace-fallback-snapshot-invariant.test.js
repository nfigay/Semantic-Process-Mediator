import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import { acceptWorkspaceSnapshot, hasWorkspaceSnapshotChange } from './workspace/workspace-snapshot-change.js'

const mainSource = () => fs.readFileSync(new URL('./main.js', import.meta.url), 'utf8')
const saveAsBody = () => mainSource().split('async function saveWorkspaceAsArchive() {')[1].split('\napp =\n  createApp({')[0]

describe('workspace archive snapshot invariant under restricted browser downloads', () => {
  it('both fallback download branches accept the logical snapshot after requesting the download', () => {
    const body = saveAsBody()
    expect((body.match(/download\(archive, suggestedName, 'application\/zip'\)/g) || []).length).toBe(2)
    expect((body.match(/acceptDownloadedSnapshot\(\)/g) || []).length).toBe(2)
    expect(body.indexOf('download(archive, suggestedName')).toBeLessThan(body.indexOf('acceptDownloadedSnapshot()'))
    expect(body).toContain('acceptWorkspaceSnapshot(workspace, documents)')
    expect(body).toContain('snapshotIterationResetPending: false')
  })

  it('Save without content changes stops before Save As; Save As does not increment unchanged content', () => {
    const source = mainSource()
    const save = source.split('async onSaveWorkspaceArchive() {')[1].split('\n      },')[0]
    expect(save.indexOf('hasWorkspaceSnapshotChange(workspace, documents)')).toBeLessThan(save.indexOf('saveWorkspaceAsArchive()'))
    const as = saveAsBody()
    expect(as).toContain('const contentChanged = hasWorkspaceSnapshotChange(workspace, documents)')
    expect(as).toContain('const snapshotIteration = contentChanged')
  })

  it('logical content comparison changes only for altered content, not for iteration metadata', () => {
    const workspace = {workspaceId:'ws-1',name:'Example',description:'',snapshotIteration:1}
    const documents = [{fileName:'collaboration.bpmn',content:'<definitions>one</definitions>'}]
    expect(hasWorkspaceSnapshotChange(workspace,documents)).toBe(true)
    acceptWorkspaceSnapshot(workspace,documents)
    expect(hasWorkspaceSnapshotChange(workspace,documents)).toBe(false)
    workspace.snapshotIteration += 1
    expect(hasWorkspaceSnapshotChange(workspace,documents)).toBe(false)
    documents[0].content='<definitions>two</definitions>'
    expect(hasWorkspaceSnapshotChange(workspace,documents)).toBe(true)
  })
})
