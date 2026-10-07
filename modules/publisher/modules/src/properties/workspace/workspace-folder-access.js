//#region src/properties/workspace/workspace-folder-access.js
var WORKSPACE_FOLDER_ACCESS_MODES = Object.freeze([
	"auto",
	"enabled",
	"disabled"
]);
function resolveWorkspaceFolderAccess({ configured = "auto", showDirectoryPicker } = {}) {
	const normalizedConfigured = WORKSPACE_FOLDER_ACCESS_MODES.includes(configured) ? configured : "auto";
	const available = typeof showDirectoryPicker === "function";
	const effective = normalizedConfigured !== "disabled" && available;
	let reason = "available";
	if (normalizedConfigured === "disabled") reason = "disabled-by-configuration";
	else if (!available) reason = "api-unavailable";
	return Object.freeze({
		configured: normalizedConfigured,
		available,
		effective,
		reason
	});
}
function classifyWorkspaceFolderAccessError(error) {
	if (error?.name === "AbortError") return "user-cancelled";
	if (error?.name === "NotAllowedError" || error?.name === "SecurityError") return "runtime-denied";
	return "runtime-error";
}
//#endregion
export { WORKSPACE_FOLDER_ACCESS_MODES, classifyWorkspaceFolderAccessError, resolveWorkspaceFolderAccess };

//# sourceMappingURL=workspace-folder-access.js.map