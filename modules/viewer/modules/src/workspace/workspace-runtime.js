//#region src/workspace/workspace-runtime.js
var WORKSPACE_METADATA_PATH = ".bpmnsm/workspace.json";
var WORKSPACE_METADATA_FORMAT = "bpmnsm-workspace";
function createWorkspaceState() {
	return {
		mode: "memory",
		name: "BPMNSM Workspace",
		workspaceId: null,
		createdAt: null,
		savedAt: null,
		snapshotIteration: 0,
		snapshotIterationResetPending: false,
		directoryHandle: null,
		fileHandles: /* @__PURE__ */ new Map(),
		resourceInventory: [],
		loadedBusinessModelState: null
	};
}
function createWorkspaceMetadata({ workspaceId, createdAt, savedAt, name = null, snapshotIteration = 1 } = {}) {
	return {
		format: WORKSPACE_METADATA_FORMAT,
		formatVersion: 2,
		workspaceId,
		createdAt,
		savedAt,
		name,
		snapshotIteration
	};
}
function readWorkspaceMetadata(resources = []) {
	const resource = resources.find((candidate) => candidate?.path === WORKSPACE_METADATA_PATH);
	if (!resource) return null;
	const metadata = JSON.parse(String(resource.content || ""));
	if (metadata?.format !== "bpmnsm-workspace" || ![1, 2].includes(metadata?.formatVersion) || typeof metadata.workspaceId !== "string" || typeof metadata.createdAt !== "string" || typeof metadata.savedAt !== "string" || metadata.snapshotIteration != null && (!Number.isInteger(metadata.snapshotIteration) || metadata.snapshotIteration < 1) || metadata.formatVersion === 1 && metadata.workspaceVersion != null && (!Number.isInteger(metadata.workspaceVersion) || metadata.workspaceVersion < 1)) throw new Error("Invalid BPMNSM Workspace metadata");
	const snapshotIteration = metadata.snapshotIteration || metadata.workspaceVersion || 1;
	const { workspaceVersion, ...normalized } = metadata;
	return {
		...normalized,
		formatVersion: 2,
		snapshotIteration
	};
}
function applyWorkspaceMetadata(workspace, metadata) {
	if (!workspace || !metadata) return workspace;
	workspace.workspaceId = metadata.workspaceId || null;
	workspace.createdAt = metadata.createdAt || null;
	workspace.savedAt = metadata.savedAt || null;
	workspace.snapshotIteration = metadata.snapshotIteration || 1;
	if (typeof metadata.name === "string" && metadata.name.trim()) workspace.name = metadata.name.trim();
	return workspace;
}
function resolveRepositoryResourceKind(path = "") {
	const normalized = String(path).toLowerCase();
	if (normalized.endsWith(".bpmn")) return "bpmn";
	if (normalized.endsWith(".archimate")) return "archimate";
	if (normalized.endsWith(".json")) return "json";
	if (normalized.endsWith(".xml") || normalized.endsWith(".xmi")) return "xml";
	return "resource";
}
async function readRepositoryFolderResources(directoryHandle) {
	if (!directoryHandle?.values) throw new Error("Workspace directory handle is unavailable");
	const resources = [];
	const fileHandles = /* @__PURE__ */ new Map();
	async function visit(directory, prefix = "") {
		for await (const entry of directory.values()) {
			const path = prefix ? `${prefix}/${entry.name}` : entry.name;
			if (entry.kind === "directory") {
				await visit(entry, path);
				continue;
			}
			if (entry.kind !== "file") continue;
			const file = await entry.getFile();
			const content = await file.text();
			resources.push({
				path,
				content,
				size: file.size
			});
			fileHandles.set(path, entry);
		}
	}
	await visit(directoryHandle);
	return {
		resources,
		fileHandles
	};
}
async function resolveWorkspaceRepositoryFileHandle({ directoryHandle, repositoryPath, create = false }) {
	const parts = String(repositoryPath).split("/").filter(Boolean);
	if (!parts.length) throw new Error("Repository path is empty");
	let directory = directoryHandle;
	for (let index = 0; index < parts.length - 1; index += 1) directory = await directory.getDirectoryHandle(parts[index], { create });
	return directory.getFileHandle(parts[parts.length - 1], { create });
}
function materializeRepositoryResources({ resources = [], repositoryDocumentStore, createDocumentId }) {
	const documents = [];
	for (const resource of resources) {
		const kind = resolveRepositoryResourceKind(resource.path);
		if (kind !== "bpmn" && kind !== "archimate") continue;
		const document = repositoryDocumentStore.addDocument({
			id: createDocumentId(),
			fileName: resource.path,
			kind,
			content: resource.content,
			xml: resource.content,
			dirty: false
		});
		documents.push(document);
	}
	return documents;
}
function crc32(bytes) {
	let crc = 4294967295;
	for (const byte of bytes) {
		crc ^= byte;
		for (let bit = 0; bit < 8; bit += 1) crc = crc >>> 1 ^ 3988292384 & -(crc & 1);
	}
	return (crc ^ 4294967295) >>> 0;
}
function writeUint16(view, offset, value) {
	view.setUint16(offset, value, true);
}
function writeUint32(view, offset, value) {
	view.setUint32(offset, value, true);
}
function encodeEntry(document, encoder) {
	const name = encoder.encode(document.fileName);
	const content = encoder.encode(document.content);
	return {
		name,
		content,
		crc: crc32(content)
	};
}
function createRepositoryWorkspaceArchive(repositoryDocuments = [], { includeClean = false, workspaceMetadata = null } = {}) {
	const encoder = new TextEncoder();
	const entries = repositoryDocuments.filter((document) => includeClean || document.dirty === true).map((document) => encodeEntry(document, encoder));
	if (workspaceMetadata) entries.push(encodeEntry({
		fileName: WORKSPACE_METADATA_PATH,
		content: JSON.stringify(workspaceMetadata, null, 2) + "\n"
	}, encoder));
	let localSize = 0;
	let centralSize = 0;
	for (const entry of entries) {
		localSize += 30 + entry.name.length + entry.content.length;
		centralSize += 46 + entry.name.length;
	}
	const archive = new Uint8Array(localSize + centralSize + 22);
	const view = new DataView(archive.buffer);
	let offset = 0;
	const centralEntries = [];
	for (const entry of entries) {
		const localOffset = offset;
		writeUint32(view, offset, 67324752);
		writeUint16(view, offset + 4, 20);
		writeUint16(view, offset + 6, 2048);
		writeUint16(view, offset + 8, 0);
		writeUint16(view, offset + 10, 0);
		writeUint16(view, offset + 12, 0);
		writeUint32(view, offset + 14, entry.crc);
		writeUint32(view, offset + 18, entry.content.length);
		writeUint32(view, offset + 22, entry.content.length);
		writeUint16(view, offset + 26, entry.name.length);
		writeUint16(view, offset + 28, 0);
		offset += 30;
		archive.set(entry.name, offset);
		offset += entry.name.length;
		archive.set(entry.content, offset);
		offset += entry.content.length;
		centralEntries.push({
			entry,
			localOffset
		});
	}
	const centralOffset = offset;
	for (const { entry, localOffset } of centralEntries) {
		writeUint32(view, offset, 33639248);
		writeUint16(view, offset + 4, 20);
		writeUint16(view, offset + 6, 20);
		writeUint16(view, offset + 8, 2048);
		writeUint16(view, offset + 10, 0);
		writeUint16(view, offset + 12, 0);
		writeUint16(view, offset + 14, 0);
		writeUint32(view, offset + 16, entry.crc);
		writeUint32(view, offset + 20, entry.content.length);
		writeUint32(view, offset + 24, entry.content.length);
		writeUint16(view, offset + 28, entry.name.length);
		writeUint16(view, offset + 30, 0);
		writeUint16(view, offset + 32, 0);
		writeUint16(view, offset + 34, 0);
		writeUint16(view, offset + 36, 0);
		writeUint32(view, offset + 38, 0);
		writeUint32(view, offset + 42, localOffset);
		offset += 46;
		archive.set(entry.name, offset);
		offset += entry.name.length;
	}
	writeUint32(view, offset, 101010256);
	writeUint16(view, offset + 4, 0);
	writeUint16(view, offset + 6, 0);
	writeUint16(view, offset + 8, entries.length);
	writeUint16(view, offset + 10, entries.length);
	writeUint32(view, offset + 12, centralSize);
	writeUint32(view, offset + 16, centralOffset);
	writeUint16(view, offset + 20, 0);
	return archive;
}
function requireAvailable(bytes, offset, length, label) {
	if (offset + length > bytes.length) throw new Error(`Invalid BPMNSM workspace archive: truncated ${label}`);
}
function readRepositoryWorkspaceArchive(archive) {
	if (!(archive instanceof Uint8Array)) throw new Error("BPMNSM workspace archive must be a Uint8Array");
	const view = new DataView(archive.buffer, archive.byteOffset, archive.byteLength);
	const decoder = new TextDecoder("utf-8", { fatal: true });
	const resources = [];
	let offset = 0;
	while (offset + 4 <= archive.length && view.getUint32(offset, true) === 67324752) {
		requireAvailable(archive, offset, 30, "local file header");
		const flags = view.getUint16(offset + 6, true);
		const compressionMethod = view.getUint16(offset + 8, true);
		const expectedCrc = view.getUint32(offset + 14, true);
		const compressedSize = view.getUint32(offset + 18, true);
		const uncompressedSize = view.getUint32(offset + 22, true);
		const nameLength = view.getUint16(offset + 26, true);
		const extraLength = view.getUint16(offset + 28, true);
		if (flags & 8) throw new Error("Unsupported BPMNSM workspace archive: data descriptors are not supported");
		if (compressionMethod !== 0) throw new Error(`Unsupported BPMNSM workspace archive compression method: ${compressionMethod}`);
		if (compressedSize !== uncompressedSize) throw new Error("Invalid BPMNSM workspace archive: stored entry sizes differ");
		const nameOffset = offset + 30;
		const contentOffset = nameOffset + nameLength + extraLength;
		const endOffset = contentOffset + compressedSize;
		requireAvailable(archive, nameOffset, nameLength + extraLength, "entry name");
		requireAvailable(archive, contentOffset, compressedSize, "entry content");
		const nameBytes = archive.slice(nameOffset, nameOffset + nameLength);
		const contentBytes = archive.slice(contentOffset, endOffset);
		const name = decoder.decode(nameBytes);
		if (!name || name.endsWith("/")) throw new Error("Unsupported BPMNSM workspace archive: directory or empty entries are not supported");
		if (crc32(contentBytes) !== expectedCrc) throw new Error(`Invalid BPMNSM workspace archive: CRC mismatch for ${name}`);
		resources.push({
			path: name,
			content: decoder.decode(contentBytes)
		});
		offset = endOffset;
	}
	if (resources.length === 0 && archive.length !== 22) throw new Error("Invalid BPMNSM workspace archive: no stored file entries found");
	requireAvailable(archive, offset, 4, "central directory");
	const signature = view.getUint32(offset, true);
	if (signature !== 33639248 && signature !== 101010256) throw new Error("Invalid BPMNSM workspace archive: central directory not found");
	return resources;
}
//#endregion
export { WORKSPACE_METADATA_FORMAT, WORKSPACE_METADATA_PATH, applyWorkspaceMetadata, createRepositoryWorkspaceArchive, createWorkspaceMetadata, createWorkspaceState, materializeRepositoryResources, readRepositoryFolderResources, readRepositoryWorkspaceArchive, readWorkspaceMetadata, resolveRepositoryResourceKind, resolveWorkspaceRepositoryFileHandle };

//# sourceMappingURL=workspace-runtime.js.map