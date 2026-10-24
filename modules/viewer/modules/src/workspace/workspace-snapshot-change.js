//#region src/workspace/workspace-snapshot-change.js
function workspaceSnapshotState(workspace, documents) {
	return JSON.stringify({
		workspaceId: workspace.workspaceId || null,
		name: workspace.name || "",
		description: workspace.description || "",
		documents: documents.map((document) => ({
			path: document.fileName,
			content: document.content || ""
		})).sort((a, b) => a.path.localeCompare(b.path))
	});
}
function hasWorkspaceSnapshotChange(workspace, documents) {
	return workspace.snapshotBaseline == null || workspace.snapshotBaseline !== workspaceSnapshotState(workspace, documents);
}
function acceptWorkspaceSnapshot(workspace, documents) {
	workspace.snapshotBaseline = workspaceSnapshotState(workspace, documents);
}
//#endregion
export { acceptWorkspaceSnapshot, hasWorkspaceSnapshotChange, workspaceSnapshotState };

//# sourceMappingURL=workspace-snapshot-change.js.map