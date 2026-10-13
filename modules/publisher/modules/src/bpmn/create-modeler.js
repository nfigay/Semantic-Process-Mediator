import { BpmnPropertiesPanelModule as index$3, BpmnPropertiesProviderModule as index$2 } from "../../git/Semantic-Process-Mediator/node_modules/bpmn-js-properties-panel/dist/index.esm.js";
import bpmn_standard_properties_module_default from "./bpmn-standard-properties-module.js";
import sequence_flow_condition_renderer_default from "./sequence-flow-condition-renderer.js";
import Modeler from "../../git/Semantic-Process-Mediator/node_modules/bpmn-js/lib/Modeler.js";
import index from "../../git/Semantic-Process-Mediator/node_modules/bpmn-js-bpmnlint/dist/index.esm.js";
/* empty css                                                                                                 */
import { bpmnlint_packed_config_exports } from "../linting/bpmnlint-packed-config.js";
import semarch_default from "../extensions/semarch.js";
import occurrence_label_refresh_default from "./occurrence-label-refresh.js";
import occurrence_label_renderer_default from "./occurrence-label-renderer.js";
import occurrence_properties_header_default from "./occurrence-properties-header.js";
import stable_guid_creation_module_default from "../identity/stable-guid-creation-module.js";
import data_store_reference_creation_module_default from "./data-store-reference-creation-module.js";
import data_store_occurrence_context_pad_module_default from "./data-store-occurrence-context-pad-module.js";
import semarch_properties_provider_default from "../properties/semarch-properties-provider.js";
import { createActiveProfileRuntime } from "../profiles/active-profile-runtime.js";
import { createActiveBusinessView } from "../configuration/active-business-view.js";
//#region src/bpmn/create-modeler.js
function createProfileRuntimeModule(profileRuntime) {
	return { activeProfileRuntime: ["value", createActiveProfileRuntime(profileRuntime)] };
}
function createBusinessViewModule(businessView) {
	return { activeBusinessView: ["value", createActiveBusinessView(businessView)] };
}
function createRepositoryContextModule(readRepositoryContext, getModeler) {
	return { readRepositoryContext: ["value", () => {
		const modeler = getModeler?.() || null;
		if (!modeler || !readRepositoryContext) return {};
		return readRepositoryContext(modeler) || {};
	}] };
}
function createBusinessObjectModule(businessObjectStore, businessObjectRepresentationActions, businessObjectNavigationActions) {
	return {
		businessObjectStore: ["value", businessObjectStore],
		businessObjectRepresentationActions: ["value", businessObjectRepresentationActions],
		businessObjectNavigationActions: ["value", businessObjectNavigationActions]
	};
}
function createModeler({ container = "#bpmn-canvas", propertiesPanel = "#bpmn-props", profileRuntime = null, businessView = null, readRepositoryContext = null, businessObjectStore = null, businessObjectRepresentationActions = null, businessObjectNavigationActions = null, capabilities = {} } = {}) {
	const { linting = true } = capabilities;
	let modeler = null;
	modeler = new Modeler({
		container,
		propertiesPanel: { parent: propertiesPanel },
		linting: linting ? {
			bpmnlint: bpmnlint_packed_config_exports,
			active: true
		} : { active: false },
		additionalModules: [
			index$3,
			index$2,
			...linting ? [index] : [],
			occurrence_label_refresh_default,
			occurrence_label_renderer_default,
			sequence_flow_condition_renderer_default,
			bpmn_standard_properties_module_default,
			occurrence_properties_header_default,
			stable_guid_creation_module_default,
			data_store_reference_creation_module_default,
			data_store_occurrence_context_pad_module_default,
			createProfileRuntimeModule(profileRuntime),
			createBusinessViewModule(businessView),
			createRepositoryContextModule(readRepositoryContext, () => modeler),
			createBusinessObjectModule(businessObjectStore, businessObjectRepresentationActions, businessObjectNavigationActions),
			semarch_properties_provider_default
		],
		moddleExtensions: { semarch: semarch_default }
	});
	return modeler;
}
//#endregion
export { createModeler };

//# sourceMappingURL=create-modeler.js.map