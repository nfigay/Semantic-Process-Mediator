//#region src/bpmn/io.js
async function importBpmn(modeler, xml) {
	await modeler.importXML(xml);
	modeler.get("canvas").zoom("fit-viewport");
}
async function exportBpmnXml(modeler) {
	return modeler.saveXML({ format: true });
}
async function exportBpmnSvg(modeler) {
	return modeler.saveSVG();
}
function download(content, filename, mimeType) {
	const blob = new Blob([content], { type: mimeType });
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = filename;
	a.click();
	URL.revokeObjectURL(a.href);
}
//#endregion
export { download, exportBpmnSvg, exportBpmnXml, importBpmn };

//# sourceMappingURL=io.js.map