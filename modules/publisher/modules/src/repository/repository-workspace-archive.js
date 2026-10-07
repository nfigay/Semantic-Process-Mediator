//#region src/repository/repository-workspace-archive.js
var WORKSPACE_METADATA_PATH = ".bpmnsm/workspace.json";
var WORKSPACE_METADATA_FORMAT = "bpmnsm-workspace";
var LEGACY_WORKSPACE_METADATA_FORMAT_VERSION = 1;
function readWorkspaceMetadata(resources) {
	const resource = resources.find((candidate) => candidate.path === WORKSPACE_METADATA_PATH);
	if (!resource) return null;
	const metadata = JSON.parse(resource.content);
	if (metadata.format !== "bpmnsm-workspace" || ![LEGACY_WORKSPACE_METADATA_FORMAT_VERSION, 2].includes(metadata.formatVersion) || typeof metadata.workspaceId !== "string" || typeof metadata.createdAt !== "string" || typeof metadata.savedAt !== "string" || metadata.snapshotIteration != null && (!Number.isInteger(metadata.snapshotIteration) || metadata.snapshotIteration < 1) || metadata.formatVersion === LEGACY_WORKSPACE_METADATA_FORMAT_VERSION && metadata.workspaceVersion != null && (!Number.isInteger(metadata.workspaceVersion) || metadata.workspaceVersion < 1)) throw new Error("Invalid BPMNSM Workspace metadata");
	const snapshotIteration = metadata.snapshotIteration || metadata.workspaceVersion || 1;
	const { workspaceVersion: _legacyWorkspaceVersion, ...rest } = metadata;
	return {
		...rest,
		formatVersion: 2,
		snapshotIteration
	};
}
function crc32(bytes) {
	let crc = 4294967295;
	for (const byte of bytes) {
		crc ^= byte;
		for (let bit = 0; bit < 8; bit += 1) crc = crc >>> 1 ^ 3988292384 & -(crc & 1);
	}
	return (crc ^ 4294967295) >>> 0;
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
	while (offset + 4 <= archive.length) {
		if (view.getUint32(offset, true) !== 67324752) break;
		requireAvailable(archive, offset, 30, "local file header");
		const flags = view.getUint16(offset + 6, true);
		const method = view.getUint16(offset + 8, true);
		const expectedCrc = view.getUint32(offset + 14, true);
		const compressedSize = view.getUint32(offset + 18, true);
		const uncompressedSize = view.getUint32(offset + 22, true);
		const nameLength = view.getUint16(offset + 26, true);
		const extraLength = view.getUint16(offset + 28, true);
		if ((flags & 8) !== 0) throw new Error("Unsupported BPMNSM workspace archive: data descriptors are not supported");
		if (method !== 0) throw new Error(`Unsupported BPMNSM workspace archive compression method: ${method}`);
		if (compressedSize !== uncompressedSize) throw new Error("Invalid BPMNSM workspace archive: stored entry sizes differ");
		const nameStart = offset + 30;
		const contentStart = nameStart + nameLength + extraLength;
		const contentEnd = contentStart + compressedSize;
		requireAvailable(archive, nameStart, nameLength + extraLength, "entry name");
		requireAvailable(archive, contentStart, compressedSize, "entry content");
		const nameBytes = archive.slice(nameStart, nameStart + nameLength);
		const contentBytes = archive.slice(contentStart, contentEnd);
		const path = decoder.decode(nameBytes);
		if (!path || path.endsWith("/")) throw new Error("Unsupported BPMNSM workspace archive: directory or empty entries are not supported");
		if (crc32(contentBytes) !== expectedCrc) throw new Error(`Invalid BPMNSM workspace archive: CRC mismatch for ${path}`);
		resources.push({
			path,
			content: decoder.decode(contentBytes)
		});
		offset = contentEnd;
	}
	if (resources.length === 0 && archive.length !== 22) throw new Error("Invalid BPMNSM workspace archive: no stored file entries found");
	requireAvailable(archive, offset, 4, "central directory");
	if (view.getUint32(offset, true) !== 33639248 && view.getUint32(offset, true) !== 101010256) throw new Error("Invalid BPMNSM workspace archive: central directory not found");
	return resources;
}
//#endregion
export { WORKSPACE_METADATA_FORMAT, WORKSPACE_METADATA_PATH, readRepositoryWorkspaceArchive, readWorkspaceMetadata };

//# sourceMappingURL=repository-workspace-archive.js.map