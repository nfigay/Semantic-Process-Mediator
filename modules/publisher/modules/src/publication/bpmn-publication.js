import { BpmnModdle as SimpleBpmnModdle } from "../../node_modules/bpmn-moddle/dist/index.js";
import semarch_default from "../extensions/semarch.js";
//#region src/publication/bpmn-publication.js
function createModdle() {
	return new SimpleBpmnModdle({ semarch: semarch_default });
}
function readExtensionValues(element) {
	return element?.extensionElements?.values || [];
}
function readSemanticTypeRefs(element) {
	return readExtensionValues(element).filter((value) => value?.$type === "semarch:SemanticType").map((semanticType) => semanticType.ref).filter(Boolean);
}
function isPublishedDataProperty({ profileRuntime, semanticTypeRefs, dataProperty }) {
	return Boolean(profileRuntime.resolveProperty({
		semanticTypes: semanticTypeRefs,
		propertyRef: dataProperty.propertyRef || null
	}));
}
function projectExtensionValues({ element, profileRuntime }) {
	const extensionElements = element?.extensionElements;
	if (!extensionElements || !Array.isArray(extensionElements.values)) return;
	const semanticTypeRefs = readSemanticTypeRefs(element);
	extensionElements.values = extensionElements.values.filter((value) => {
		if (value?.$type !== "semarch:DataProperty") return true;
		return isPublishedDataProperty({
			profileRuntime,
			semanticTypeRefs,
			dataProperty: value
		});
	});
}
async function publishBpmnXml({ sourceXml, profileRuntime } = {}) {
	if (typeof sourceXml !== "string" || !sourceXml.trim()) throw new Error("BPMN publication requires sourceXml");
	if (!profileRuntime || typeof profileRuntime.resolveProperty !== "function") throw new Error("BPMN publication requires profileRuntime");
	const moddle = createModdle();
	const imported = await moddle.fromXML(sourceXml);
	for (const element of Object.values(imported.elementsById || {})) projectExtensionValues({
		element,
		profileRuntime
	});
	return (await moddle.toXML(imported.rootElement, { format: true })).xml;
}
//#endregion
export { publishBpmnXml };

//# sourceMappingURL=bpmn-publication.js.map