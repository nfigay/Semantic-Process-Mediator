//#region src/bpmn/data-store-occurrence-context-pad-module.js
var OCCURRENCE_DISTANCE = 50;
var DataStoreOccurrenceContextPadProvider = class {
	constructor(contextPad, create, modeling, elementFactory, bpmnFactory, translate) {
		this._create = create;
		this._modeling = modeling;
		this._elementFactory = elementFactory;
		this._bpmnFactory = bpmnFactory;
		this._translate = translate;
		contextPad.registerProvider(this);
	}
	getContextPadEntries(element) {
		const businessObject = element?.businessObject;
		if (businessObject?.$type !== "bpmn:DataStoreReference" || !businessObject.dataStoreRef) return {};
		const createOccurrenceShape = () => {
			const occurrence = this._bpmnFactory.create("bpmn:DataStoreReference", { dataStoreRef: businessObject.dataStoreRef });
			return this._elementFactory.createShape({
				type: "bpmn:DataStoreReference",
				businessObject: occurrence
			});
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
		return { "semarch-create-data-store-occurrence": {
			group: "model",
			html: "<div class=\"entry bpmn-icon-data-store\" draggable=\"true\" style=\"position: relative;\"><span aria-hidden=\"true\" style=\"position: absolute; right: -1px; bottom: -1px; font-family: sans-serif; font-size: 12px; font-weight: bold; line-height: 12px;\">+</span></div>",
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
	"translate"
];
var data_store_occurrence_context_pad_module_default = {
	__init__: ["semarchDataStoreOccurrenceContextPadProvider"],
	semarchDataStoreOccurrenceContextPadProvider: ["type", DataStoreOccurrenceContextPadProvider]
};
//#endregion
export { data_store_occurrence_context_pad_module_default as default };
