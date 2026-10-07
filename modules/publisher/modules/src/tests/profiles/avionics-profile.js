var id = "avionics";
var name = "Avionics Process Profile";
var description = "Minimal BPMNSM Avionics profile for the PAF_Deliverable and PAF_Document demonstrator verticals.";
var schemas = [{
	"id": "avionics-data",
	"technology": "XSD",
	"specification": "1.0",
	"source": "../schemas/coc-avionics-test.xsd",
	"namespace": "urn:semarch:test:coc-avionics"
}];
var types = [{
	"id": "PAF_Deliverable",
	"label": "PAF Deliverable",
	"bpmnAnchor": "bpmn:DataStore",
	"representation": {
		"master": "bpmn:DataStore",
		"occurrence": "bpmn:DataStoreReference"
	},
	"schema": "avionics-data",
	"schemaType": "urn:semarch:test:coc-avionics#PAFDeliverableType"
}, {
	"id": "PAF_Document",
	"label": "PAF Document",
	"bpmnAnchor": "bpmn:DataObject",
	"representation": {
		"master": "bpmn:DataObject",
		"occurrence": "bpmn:DataObjectReference"
	},
	"schema": "avionics-data",
	"schemaType": "urn:semarch:test:coc-avionics#PAFDocumentType"
}];
var relations = [];
var avionics_profile_default = {
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
export { avionics_profile_default as default, description, id, name, relations, schemas, types };
