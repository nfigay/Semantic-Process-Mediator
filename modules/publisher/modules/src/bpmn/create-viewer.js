import NavigatedViewer from "../../node_modules/bpmn-js/lib/NavigatedViewer.js";
import index from "../../node_modules/bpmn-js-bpmnlint/dist/index.esm.js";
/* empty css                                                                   */
import { bpmnlint_packed_config_exports } from "../linting/bpmnlint-packed-config.js";
import semarch_default from "../extensions/semarch.js";
//#region src/bpmn/create-viewer.js
function createViewer({ container = "#bpmn-canvas" } = {}) {
	return new NavigatedViewer({
		container,
		linting: {
			bpmnlint: bpmnlint_packed_config_exports,
			active: true
		},
		additionalModules: [index],
		moddleExtensions: { semarch: semarch_default }
	});
}
//#endregion
export { createViewer };
