//#region src/configuration/business-view-resolver.js
function resolveBusinessView({ businessViews = [], businessViewRef = null } = {}) {
	if (typeof businessViewRef !== "string" || !businessViewRef.trim()) return null;
	const normalizedBusinessViewRef = businessViewRef.trim();
	const matches = businessViews.filter((businessView) => businessView?.id === normalizedBusinessViewRef);
	if (matches.length > 1) throw new Error(`Ambiguous BPMNSM Business View: ${normalizedBusinessViewRef}`);
	return matches[0] || null;
}
//#endregion
export { resolveBusinessView };
