//#region src/repository/repository-folder-resources.js
async function readRepositoryFolderResources(directoryHandle) {
	if (!directoryHandle || typeof directoryHandle.entries !== "function") throw new Error("Repository folder resources require a directory handle");
	const resources = [];
	const fileHandles = /* @__PURE__ */ new Map();
	async function collectFiles(handle, prefix = "") {
		for await (const [name, entry] of handle.entries()) {
			const relativePath = prefix ? `${prefix}/${name}` : name;
			if (entry.kind === "file") {
				const content = await (await entry.getFile()).text();
				resources.push({
					path: relativePath,
					content
				});
				fileHandles.set(relativePath, entry);
				continue;
			}
			if (entry.kind === "directory") await collectFiles(entry, relativePath);
		}
	}
	await collectFiles(directoryHandle);
	return {
		resources,
		fileHandles
	};
}
//#endregion
export { readRepositoryFolderResources };

//# sourceMappingURL=repository-folder-resources.js.map