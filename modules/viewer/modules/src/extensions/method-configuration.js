//#region src/extensions/method-configuration.js
function getMethodConfiguration(modeler) {
	return (modeler.getDefinitions()?.extensionElements)?.values?.find((value) => value.$type === "semarch:MethodConfiguration") || {};
}
function setMethodConfiguration(modeler, values) {
	const moddle = modeler.get("moddle");
	const defs = modeler.getDefinitions();
	if (!defs.extensionElements) defs.extensionElements = moddle.create("bpmn:ExtensionElements", { values: [] });
	defs.extensionElements.values = (defs.extensionElements.values || []).filter((value) => value.$type !== "semarch:MethodConfiguration");
	const configuration = moddle.create("semarch:MethodConfiguration", values);
	defs.extensionElements.values.push(configuration);
	return configuration;
}
//#endregion
export { getMethodConfiguration, setMethodConfiguration };
