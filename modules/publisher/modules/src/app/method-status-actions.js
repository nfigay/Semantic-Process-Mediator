import { resolveMethodStatus } from "../methodology/resolve-method-status.js";
//#region src/app/method-status-actions.js
function createMethodStatusActions({ readRepositoryContext, getMethodConfiguration, modeler }) {
	function getStatus() {
		const context = readRepositoryContext?.() || {};
		const storedConfiguration = getMethodConfiguration(modeler) || {};
		return resolveMethodStatus({
			context,
			storedConfiguration
		});
	}
	return { getStatus };
}
//#endregion
export { createMethodStatusActions };

//# sourceMappingURL=method-status-actions.js.map