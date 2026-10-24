// Logical snapshot equivalence: timestamps, iteration and browser handles are not content.
export function workspaceSnapshotState(workspace, documents) {
  return JSON.stringify({
    workspaceId: workspace.workspaceId || null,
    name: workspace.name || '',
    description: workspace.description || '',
    documents: documents.map(document => ({
      path: document.fileName,
      content: document.content || ''
    })).sort((a, b) => a.path.localeCompare(b.path))
  })
}

export function hasWorkspaceSnapshotChange(workspace, documents) {
  return workspace.snapshotBaseline == null ||
    workspace.snapshotBaseline !== workspaceSnapshotState(workspace, documents)
}

export function acceptWorkspaceSnapshot(workspace, documents) {
  workspace.snapshotBaseline = workspaceSnapshotState(workspace, documents)
}
