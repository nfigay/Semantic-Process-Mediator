import { normalizeEaBytes } from "./ea-xml-normalize.js";
import { verifyDocuments } from "./coverage-core.js";
import { verifyStructure } from "./structure-core.js";
//#region src/bpmn/ea-import/ea-browser-converter.mjs
function parseXml(xml, label) {
	const doc = new DOMParser().parseFromString(xml, "application/xml");
	if (doc.getElementsByTagName("parsererror").length || doc.documentElement?.localName === "parsererror") throw new Error(`${label}: invalid XML`);
	return doc;
}
/** Browser-only EA XMI -> BPMN adapter. No Node runtime, file paths or filesystem access. */
async function convertEaBytes({ bytes, stylesheetLocation, stylesheetText, SaxonJS, validate = true }) {
	const { xml, sourceEncoding } = normalizeEaBytes(bytes);
	return {
		...await convertNormalizedEaXml({
			xml,
			stylesheetLocation,
			stylesheetText,
			SaxonJS,
			validate
		}),
		sourceEncoding
	};
}
async function convertEaFile({ file, ...options }) {
	if (!file || typeof file.arrayBuffer !== "function") throw new TypeError("Expected browser File or Blob");
	return convertEaBytes({
		bytes: await file.arrayBuffer(),
		...options
	});
}
async function convertNormalizedEaXml({ xml, stylesheetLocation, stylesheetText, SaxonJS, validate = true }) {
	if (typeof xml !== "string" || !xml.trim()) throw new TypeError("xml must be non-empty");
	if (!stylesheetLocation && !stylesheetText) throw new TypeError("Compiled SEF stylesheetLocation or stylesheetText is required");
	if (stylesheetLocation && stylesheetText) throw new TypeError("Specify only one compiled SEF source");
	if (typeof SaxonJS?.transform !== "function") throw new TypeError("SaxonJS.transform is required");
	const started = performance.now();
	const source = parseXml(xml, "EA XMI");
	const bpmnXml = (await SaxonJS.transform({
		...stylesheetText ? { stylesheetText } : { stylesheetLocation },
		sourceText: xml,
		destination: "serialized"
	}, "async"))?.principalResult;
	if (typeof bpmnXml !== "string" || !bpmnXml.trim()) throw new Error("No serialized BPMN returned by SaxonJS");
	const bpmn = parseXml(bpmnXml, "BPMN");
	const coverage = validate ? verifyDocuments(source, bpmn) : null;
	const structure = validate ? verifyStructure(bpmn) : null;
	return {
		bpmnXml,
		validation: {
			coverage,
			structure,
			ok: validate ? coverage.ok && structure.ok : null
		},
		elapsedMs: performance.now() - started
	};
}
//#endregion
export { convertEaBytes, convertEaFile, convertNormalizedEaXml };

//# sourceMappingURL=ea-browser-converter.js.map