//#region src/extensions/repository-context.js
function getRepositoryContext(modeler) {
	return (modeler.getDefinitions()?.extensionElements)?.values?.find((value) => value.$type === "semarch:RepositoryContext") || {};
}
function setRepositoryContext(modeler, values) {
	const moddle = modeler.get("moddle");
	const defs = modeler.getDefinitions();
	if (!defs.extensionElements) defs.extensionElements = moddle.create("bpmn:ExtensionElements", { values: [] });
	defs.extensionElements.values = (defs.extensionElements.values || []).filter((value) => value.$type !== "semarch:RepositoryContext");
	const context = moddle.create("semarch:RepositoryContext", values);
	defs.extensionElements.values.push(context);
	return context;
}
//#endregion
export { getRepositoryContext, setRepositoryContext };
