//#region src/app/repository-context-actions.js
function createRepositoryContextActions({ modeler, linter, cocRegistry, openDialog, getContext, setContext, onContextChanged }) {
	function read() {
		try {
			return getContext(modeler);
		} catch {
			return {};
		}
	}
	function applyLintContext(context = {}) {
		linter.setCoc(context.cocOwner || null);
		linter.setProfile(context.maturity || "L1");
	}
	function save(values) {
		try {
			setContext(modeler, values);
			applyLintContext(values);
			linter.run();
			onContextChanged?.(values);
		} catch (err) {
			console.error("saveRepositoryContext error:", err);
		}
	}
	function open() {
		openDialog({
			context: read(),
			cocs: cocRegistry.cocs,
			onSave(values) {
				save(values);
			}
		});
	}
	return {
		read,
		save,
		open,
		applyLintContext
	};
}
//#endregion
export { createRepositoryContextActions };
