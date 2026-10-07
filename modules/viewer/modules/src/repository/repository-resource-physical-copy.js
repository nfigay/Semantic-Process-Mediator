import { normalizeWorkspaceRepositoryPath, resolveWorkspaceRepositoryFileHandle } from "../properties/workspace/workspace-repository-file-handle.js";
//#region src/repository/repository-resource-physical-copy.js
async function copyRepositoryResourceToFolder({ targetRepository, repositoryPath, content } = {}) {
	const workspace = targetRepository?.workspace;
	if (workspace?.mode !== "folder" || !workspace.directoryHandle) throw new Error("Resource duplication target requires an active folder Source");
	const existingFileHandle = await findWorkspaceRepositoryFileHandle({
		directoryHandle: workspace.directoryHandle,
		repositoryPath
	});
	if (existingFileHandle) return {
		status: "conflict",
		path: repositoryPath,
		fileHandle: existingFileHandle
	};
	const fileHandle = await resolveWorkspaceRepositoryFileHandle({
		directoryHandle: workspace.directoryHandle,
		repositoryPath,
		create: true
	});
	const writable = await fileHandle.createWritable();
	await writable.write(content);
	await writable.close();
	return {
		status: "copied",
		path: repositoryPath,
		fileHandle
	};
}
async function findWorkspaceRepositoryFileHandle({ directoryHandle, repositoryPath } = {}) {
	const segments = normalizeWorkspaceRepositoryPath(repositoryPath);
	let parentHandle = directoryHandle;
	try {
		for (const directoryName of segments.slice(0, -1)) parentHandle = await parentHandle.getDirectoryHandle(directoryName, { create: false });
		return await parentHandle.getFileHandle(segments.at(-1), { create: false });
	} catch (error) {
		if (isMissingEntryError(error)) return null;
		throw error;
	}
}
function isMissingEntryError(error) {
	return error?.name === "NotFoundError" || /^Directory not found:/.test(error?.message || "") || /^File not found:/.test(error?.message || "");
}
//#endregion
export { copyRepositoryResourceToFolder, findWorkspaceRepositoryFileHandle };

//# sourceMappingURL=repository-resource-physical-copy.js.map