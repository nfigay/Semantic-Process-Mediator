//#region src/configuration/coc-configuration-resolver.js
function resolveCocConfiguration({ cocConfigurations = [], cocId = null } = {}) {
	if (typeof cocId !== "string" || !cocId.trim()) return null;
	const normalizedCocId = cocId.trim();
	return cocConfigurations.find((configuration) => configuration?.id === normalizedCocId) || null;
}
//#endregion
export { resolveCocConfiguration };
