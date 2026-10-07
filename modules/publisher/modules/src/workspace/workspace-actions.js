import { WORKSPACE_METADATA_PATH, applyWorkspaceMetadata, createRepositoryWorkspaceArchive, createWorkspaceMetadata, createWorkspaceState, materializeRepositoryResources, readRepositoryFolderResources, readRepositoryWorkspaceArchive, readWorkspaceMetadata, resolveWorkspaceRepositoryFileHandle } from "./workspace-runtime.js";
//#region src/workspace/workspace-actions.js
function downloadBytes(bytes, fileName) {
	const blob = new Blob([bytes], { type: "application/zip" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
}
function archiveName(name) {
	return `${String(name || "BPMNSM Workspace").trim().replace(/[^a-z0-9._-]+/gi, "-") || "BPMNSM-Workspace"}.zip`;
}
function isDirectWorkspacePermissionDenied(error) {
	return error?.name === "NotAllowedError";
}
function isDirectWorkspaceCancelled(error) {
	return error?.name === "AbortError";
}
function handleDirectWorkspaceError(error) {
	if (isDirectWorkspaceCancelled(error)) return null;
	if (!isDirectWorkspacePermissionDenied(error)) throw error;
	window.sessionStorage?.setItem("bpmnsm.directWorkspaceDenied", "1");
	window.alert("Direct Workspace Folder access is not authorized in this browser context.\n\nUse Open Workspace Archive… / Save Workspace Archive… instead.");
	window.location.reload();
	return null;
}
function createWorkspaceActions({ repositoryDocumentStore, repositoryBrowser, createDocumentId, loadBpmn, showArchimate }) {
	const workspace = createWorkspaceState();
	function ensureMetadata() {
		const now = (/* @__PURE__ */ new Date()).toISOString();
		workspace.workspaceId ||= globalThis.crypto?.randomUUID?.() || `workspace-${Date.now()}`;
		workspace.createdAt ||= now;
		workspace.savedAt = now;
		workspace.snapshotIteration = Math.max(1, Number(workspace.snapshotIteration || 0) + 1);
		return createWorkspaceMetadata({
			workspaceId: workspace.workspaceId,
			createdAt: workspace.createdAt,
			savedAt: workspace.savedAt,
			name: workspace.name,
			snapshotIteration: workspace.snapshotIteration
		});
	}
	async function activateResources(resources, { directoryHandle = null, fileHandles = /* @__PURE__ */ new Map(), mode = "archive", fallbackName = null } = {}) {
		const metadata = readWorkspaceMetadata(resources);
		const modelResources = resources.filter((resource) => resource.path !== WORKSPACE_METADATA_PATH);
		repositoryDocumentStore.clear();
		const documents = materializeRepositoryResources({
			resources: modelResources,
			repositoryDocumentStore,
			createDocumentId
		});
		workspace.mode = mode;
		workspace.directoryHandle = directoryHandle;
		workspace.fileHandles = fileHandles;
		workspace.resourceInventory = resources.map((resource) => resource.path);
		if (metadata) applyWorkspaceMetadata(workspace, metadata);
		else if (fallbackName) workspace.name = fallbackName;
		const first = documents[0] || null;
		if (first) {
			repositoryDocumentStore.setActiveDocument(first.id);
			if (first.kind === "archimate") await showArchimate({
				xml: first.content,
				documentId: first.id
			});
			else await loadBpmn(first.content);
		}
		repositoryBrowser.render();
		return documents;
	}
	async function openFolder() {
		if (typeof window.showDirectoryPicker !== "function") throw new Error("Workspace folder access is unavailable in this browser");
		try {
			const directoryHandle = await window.showDirectoryPicker({ mode: "readwrite" });
			const { resources, fileHandles } = await readRepositoryFolderResources(directoryHandle);
			return activateResources(resources, {
				directoryHandle,
				fileHandles,
				mode: "folder",
				fallbackName: directoryHandle.name
			});
		} catch (error) {
			return handleDirectWorkspaceError(error);
		}
	}
	async function saveFolder() {
		if (!workspace.directoryHandle) throw new Error("No Workspace Folder is active");
		for (const document of repositoryDocumentStore.getDocuments()) {
			const writable = await (await resolveWorkspaceRepositoryFileHandle({
				directoryHandle: workspace.directoryHandle,
				repositoryPath: document.fileName,
				create: true
			})).createWritable();
			await writable.write(document.content || "");
			await writable.close();
			repositoryDocumentStore.updateDocument(document.id, { dirty: false });
		}
		const metadata = ensureMetadata();
		const writable = await (await resolveWorkspaceRepositoryFileHandle({
			directoryHandle: workspace.directoryHandle,
			repositoryPath: WORKSPACE_METADATA_PATH,
			create: true
		})).createWritable();
		await writable.write(`${JSON.stringify(metadata, null, 2)}\n`);
		await writable.close();
		repositoryBrowser.render();
	}
	function saveArchive() {
		const metadata = ensureMetadata();
		const documents = repositoryDocumentStore.getDocuments().map((document) => ({
			fileName: document.fileName,
			content: document.content || "",
			dirty: document.dirty
		}));
		downloadBytes(createRepositoryWorkspaceArchive(documents, {
			includeClean: true,
			workspaceMetadata: metadata
		}), archiveName(workspace.name));
	}
	function openArchive() {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".zip,application/zip";
		input.addEventListener("change", async () => {
			const file = input.files?.[0];
			if (!file) return;
			await activateResources(readRepositoryWorkspaceArchive(new Uint8Array(await file.arrayBuffer())), {
				mode: "archive",
				fallbackName: file.name.replace(/\.zip$/i, "")
			});
		}, { once: true });
		input.click();
	}
	function rename() {
		const value = window.prompt("Workspace name", workspace.name);
		if (typeof value === "string" && value.trim()) workspace.name = value.trim();
	}
	function manifest() {
		window.alert(JSON.stringify({
			mode: workspace.mode,
			name: workspace.name,
			workspaceId: workspace.workspaceId,
			createdAt: workspace.createdAt,
			savedAt: workspace.savedAt,
			snapshotIteration: workspace.snapshotIteration,
			resources: workspace.resourceInventory
		}, null, 2));
	}
	return {
		workspace,
		openFolder,
		openArchive,
		saveFolder,
		saveArchive,
		rename,
		manifest
	};
}
//#endregion
export { createWorkspaceActions };

//# sourceMappingURL=workspace-actions.js.map