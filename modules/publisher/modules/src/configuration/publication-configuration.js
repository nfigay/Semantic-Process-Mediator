//#region src/configuration/publication-configuration.js
function normalizePublicationConfiguration(configuration = {}) {
	if (!configuration || typeof configuration !== "object" || Array.isArray(configuration)) throw new TypeError("Publication configuration must be an object");
	const capabilities = configuration.capabilities;
	if (capabilities !== void 0 && (!capabilities || typeof capabilities !== "object" || Array.isArray(capabilities))) throw new TypeError("Publication configuration capabilities must be an object");
	let utilities = true;
	if (capabilities?.utilities !== void 0) {
		if (typeof capabilities.utilities !== "boolean") throw new TypeError("Publication capability utilities must be a boolean");
		utilities = capabilities.utilities;
	}
	return { capabilities: { utilities } };
}
//#endregion
export { normalizePublicationConfiguration };

//# sourceMappingURL=publication-configuration.js.map