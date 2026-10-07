var id = "experimental-a";
var name = "Experimental Profile A";
var description = "Minimal BPMNSM profile used only to demonstrate runtime profile switching.";
var schemas = [{
	"id": "experimental-a-data",
	"technology": "XSD",
	"specification": "1.0",
	"source": "../schemas/coc-experimental-a-test.xsd",
	"namespace": "urn:semarch:test:coc-experimental-a"
}];
var types = [{
	"id": "demo:Deliverable",
	"label": "Experimental Deliverable",
	"bpmnAnchor": "bpmn:DataObject",
	"representation": {
		"master": "bpmn:DataObject",
		"occurrence": "bpmn:DataObjectReference"
	},
	"schema": "experimental-a-data",
	"schemaType": "urn:semarch:test:coc-experimental-a#DeliverableType"
}];
var relations = [];
var experimental_a_profile_default = {
	profileVersion: "0.1",
	id,
	name,
	version: "1.0",
	description,
	schemas,
	types,
	relations
};
//#endregion
export { experimental_a_profile_default as default, description, id, name, relations, schemas, types };
