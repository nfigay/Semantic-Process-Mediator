//#region src/bpmn/ea-import/ea-runtime-loader.mjs
var eaSefUrl = () => "./ea-import/ea-to-bpmn-FLOW-CONV-06.sef.json";
var pending;
function loadEaSaxonRuntime() {
	if (globalThis.SaxonJS?.transform) return Promise.resolve(globalThis.SaxonJS);
	if (pending) return pending;
	pending = new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = "./ea-import/SaxonJS2.rt.js";
		script.onload = () => globalThis.SaxonJS?.transform ? resolve(globalThis.SaxonJS) : reject(/* @__PURE__ */ new Error("Saxon-JS browser runtime did not initialize"));
		script.onerror = () => reject(/* @__PURE__ */ new Error("Saxon-JS browser runtime unavailable: " + script.src));
		document.head.appendChild(script);
	}).catch((error) => {
		pending = null;
		throw error;
	});
	return pending;
}
//#endregion
export { eaSefUrl, loadEaSaxonRuntime };

//# sourceMappingURL=ea-runtime-loader.js.map