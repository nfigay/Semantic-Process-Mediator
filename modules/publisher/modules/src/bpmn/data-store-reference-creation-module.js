import { add, remove } from "../../node_modules/diagram-js/lib/util/Collections.js";
import CommandInterceptor from "../../node_modules/diagram-js/lib/command/CommandInterceptor.js";
//#region src/bpmn/data-store-reference-creation-module.js
function getBusinessObject(element) {
	return element?.businessObject || (element?.$type ? element : null);
}
var DataStoreReferenceCreation = class extends CommandInterceptor {
	constructor(eventBus, bpmnjs, bpmnFactory) {
		super(eventBus);
		this.executed("shape.create", (context) => {
			const businessObject = getBusinessObject(context?.shape);
			if (businessObject?.$type !== "bpmn:DataStoreReference") return;
			if (businessObject.dataStoreRef && !context?.semarchCreatedDataStore) return;
			let dataStore = context?.semarchCreatedDataStore;
			if (!dataStore) {
				dataStore = bpmnFactory.create("bpmn:DataStore");
				context.semarchCreatedDataStore = dataStore;
			}
			businessObject.dataStoreRef = dataStore;
			const rootElements = bpmnjs.getDefinitions().get("rootElements");
			if (!rootElements.includes(dataStore)) add(rootElements, dataStore);
		}, true);
		this.reverted("shape.create", (context) => {
			const dataStore = context?.semarchCreatedDataStore;
			if (!dataStore) return;
			const businessObject = getBusinessObject(context?.shape);
			if (businessObject?.dataStoreRef === dataStore) businessObject.dataStoreRef = void 0;
			remove(bpmnjs.getDefinitions().get("rootElements"), dataStore);
		}, true);
	}
};
DataStoreReferenceCreation.$inject = [
	"eventBus",
	"bpmnjs",
	"bpmnFactory"
];
var data_store_reference_creation_module_default = {
	__init__: ["semarchDataStoreReferenceCreation"],
	semarchDataStoreReferenceCreation: ["type", DataStoreReferenceCreation]
};
//#endregion
export { data_store_reference_creation_module_default as default };
