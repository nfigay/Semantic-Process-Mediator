var id = "engineering";
var name = "Engineering Process Profile";
var description = "Minimal BPMNSM profile used to validate business specialization of BPMN DataObject-based deliverables.";
var schemas = [{
	"id": "engineering-data",
	"technology": "XSD",
	"specification": "1.0",
	"source": "../schemas/coc-engineering-test.xsd",
	"namespace": "urn:semarch:test:coc-engineering"
}];
var types = [{
	"id": "coc:Deliverable",
	"label": "Deliverable",
	"bpmnAnchor": "bpmn:DataObject",
	"representation": {
		"master": "bpmn:DataObject",
		"occurrence": "bpmn:DataObjectReference"
	}
}, {
	"id": "eng:Specification",
	"label": "Specification",
	"specializes": "coc:Deliverable",
	"bpmnAnchor": "bpmn:DataObject",
	"schema": "engineering-data",
	"schemaType": "urn:semarch:test:coc-engineering#SpecificationType"
}];
var relations = [{
	"id": "activityInput",
	"label": "Activity input",
	"bpmnRelation": "bpmn:DataInputAssociation"
}, {
	"id": "activityOutput",
	"label": "Activity output",
	"bpmnRelation": "bpmn:DataOutputAssociation"
}];
var engineering_profile_default = {
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
export { engineering_profile_default as default, description, id, name, relations, schemas, types };
