//#region src/bpmn/data-store-occurrence-context-pad-module.js
var OCCURRENCE_DISTANCE = 50;
var DataStoreOccurrenceContextPadProvider = class {
	constructor(contextPad, create, modeling, elementFactory, bpmnFactory, translate, eventBus) {
		this._create = create;
		this._modeling = modeling;
		this._elementFactory = elementFactory;
		this._bpmnFactory = bpmnFactory;
		this._translate = translate;
		eventBus?.on?.("commandStack.shape.create.preExecute", 900, (event) => {
			const shape = event?.context?.shape;
			const master = shape?.__bpmnsmReusedDataObjectMaster;
			if (master && shape.businessObject?.$type === "bpmn:DataObjectReference") shape.businessObject.dataObjectRef = master;
		});
		contextPad.registerProvider(this);
	}
	getContextPadEntries(element) {
		const businessObject = element?.businessObject;
		const type = businessObject?.$type;
		const referenceKey = type === "bpmn:DataObjectReference" ? "dataObjectRef" : type === "bpmn:DataStoreReference" ? "dataStoreRef" : null;
		if (!referenceKey || !businessObject[referenceKey]) return {};
		const createOccurrenceShape = () => {
			const occurrence = this._bpmnFactory.create(type, { [referenceKey]: businessObject[referenceKey] });
			const shape = this._elementFactory.createShape({
				type,
				businessObject: occurrence
			});
			if (referenceKey === "dataObjectRef") shape.__bpmnsmReusedDataObjectMaster = businessObject[referenceKey];
			return shape;
		};
		const createOccurrence = (event, source) => {
			const shape = createOccurrenceShape();
			this._create.start(event, shape, { source });
		};
		const createOccurrenceImmediately = (event, source) => {
			const shape = createOccurrenceShape();
			const position = {
				x: source.x + source.width + OCCURRENCE_DISTANCE + shape.width / 2,
				y: source.y + source.height / 2
			};
			this._modeling.createShape(shape, position, source.parent);
		};
		return { [type === "bpmn:DataStoreReference" ? "semarch-create-data-store-occurrence" : "semarch-create-data-object-occurrence"]: {
			group: "model",
			html: `<div class="entry ${type === "bpmn:DataObjectReference" ? "bpmn-icon-data-object" : "bpmn-icon-data-store"}" draggable="true" style="position: relative;"><span aria-hidden="true" style="position: absolute; right: -1px; bottom: -1px; font-family: sans-serif; font-size: 12px; font-weight: bold; line-height: 12px;">+</span></div>`,
			title: this._translate("Create another occurrence"),
			action: {
				click: createOccurrenceImmediately,
				dragstart: createOccurrence
			}
		} };
	}
};
DataStoreOccurrenceContextPadProvider.$inject = [
	"contextPad",
	"create",
	"modeling",
	"elementFactory",
	"bpmnFactory",
	"translate",
	"eventBus"
];
var data_store_occurrence_context_pad_module_default = {
	__init__: ["semarchDataStoreOccurrenceContextPadProvider"],
	semarchDataStoreOccurrenceContextPadProvider: ["type", DataStoreOccurrenceContextPadProvider]
};
//#endregion
export { data_store_occurrence_context_pad_module_default as default };

//# sourceMappingURL=data-store-occurrence-context-pad-module.js.map