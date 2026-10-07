//#region src/repository/repository-resource-kind-resolver.js
function resolveRepositoryResourceKind(fileName) {
	if (typeof fileName !== "string" || !fileName.trim()) return "unknown";
	const normalizedFileName = fileName.trim().toLowerCase();
	if (normalizedFileName.endsWith(".business.json")) return "business-model";
	if (normalizedFileName.endsWith(".archimate")) return "archimate";
	if (normalizedFileName.endsWith(".bpmn")) return "bpmn";
	return "unknown";
}
//#endregion
export { resolveRepositoryResourceKind };

//# sourceMappingURL=repository-resource-kind-resolver.js.map