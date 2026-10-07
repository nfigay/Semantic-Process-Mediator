//#region src/configuration/stakeholder-business-view-selection.js
function resolveStakeholderBusinessViewRef({ selections = [], stakeholderRef = null } = {}) {
	if (typeof stakeholderRef !== "string" || !stakeholderRef.trim()) return null;
	const normalizedStakeholderRef = stakeholderRef.trim();
	const matches = selections.filter((selection) => selection?.stakeholderRef === normalizedStakeholderRef);
	if (matches.length > 1) throw new Error(`Ambiguous BPMNSM stakeholder Business View selection: ${normalizedStakeholderRef}`);
	const businessViewRef = matches[0]?.businessViewRef;
	if (typeof businessViewRef !== "string" || !businessViewRef.trim()) return null;
	return businessViewRef.trim();
}
//#endregion
export { resolveStakeholderBusinessViewRef };
