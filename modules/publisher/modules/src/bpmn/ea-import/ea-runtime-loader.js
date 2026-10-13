//#region src/bpmn/ea-import/ea-runtime-loader.mjs
var embeddedPayload = (id) => document.getElementById(id)?.textContent?.trim() || null;
function decodeEmbeddedPayload(id) {
	const payload = embeddedPayload(id);
	if (!payload) return null;
	const binary = atob(payload);
	const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}
function eaEmbeddedStylesheetText() {
	return decodeEmbeddedPayload("bpmnsm-ea-embedded-sef");
}
var eaSefUrl = () => "./ea-import/ea-to-bpmn-FLOW-CONV-06.sef.json";
var pending;
function loadEaSaxonRuntime() {
	if (globalThis.SaxonJS?.transform) return Promise.resolve(globalThis.SaxonJS);
	if (pending) return pending;
	pending = new Promise((resolve, reject) => {
		const script = document.createElement("script");
		const embeddedRuntime = decodeEmbeddedPayload("bpmnsm-ea-embedded-runtime");
		if (location.protocol === "file:" && embeddedRuntime) script.textContent = embeddedRuntime;
		else script.src = "./ea-import/SaxonJS2.rt.js";
		script.onload = () => globalThis.SaxonJS?.transform ? resolve(globalThis.SaxonJS) : reject(/* @__PURE__ */ new Error("Saxon-JS browser runtime did not initialize"));
		script.onerror = () => reject(/* @__PURE__ */ new Error("Saxon-JS browser runtime unavailable: " + script.src));
		document.head.appendChild(script);
		if (location.protocol === "file:" && embeddedRuntime) {
			if (globalThis.SaxonJS?.transform) resolve(globalThis.SaxonJS);
			else reject(/* @__PURE__ */ new Error("Embedded Saxon-JS browser runtime did not initialize"));
		}
	}).catch((error) => {
		pending = null;
		throw error;
	});
	return pending;
}
//#endregion
export { eaEmbeddedStylesheetText, eaSefUrl, loadEaSaxonRuntime };

//# sourceMappingURL=ea-runtime-loader.js.map