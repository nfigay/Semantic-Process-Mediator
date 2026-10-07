//#region src/linting/rule-catalog.js
var RULE_CATALOG = {
	"label-required": {
		id: "label-required",
		owner: "bpmn",
		engine: "bpmnlint",
		description: "Require labels on BPMN elements according to the native bpmnlint rule.",
		cocs: "*",
		maturities: "*",
		level: "warn"
	},
	"semarch/stable-id": {
		id: "semarch/stable-id",
		owner: "semarch",
		engine: "semarch-legacy",
		description: "Require stable semantic identifiers instead of generated identifiers.",
		cocs: "*",
		maturities: [
			"L1",
			"L2",
			"L3",
			"L4"
		],
		level: "warn"
	},
	"semarch/named-element": {
		id: "semarch/named-element",
		owner: "semarch",
		engine: "bpmnlint",
		description: "Require meaningful names on BPMN elements used by the methodology.",
		cocs: "*",
		maturities: [
			"L1",
			"L2",
			"L3",
			"L4"
		],
		level: "info"
	},
	"semarch/typed-message-flow": {
		id: "semarch/typed-message-flow",
		owner: "semarch",
		engine: "semarch-legacy",
		description: "Require MessageFlow elements to reference a BPMN Message.",
		cocs: "*",
		maturities: [
			"L1",
			"L2",
			"L3",
			"L4"
		],
		level: "warn"
	},
	"semarch/require-coc-ref": {
		id: "semarch/require-coc-ref",
		owner: "semarch",
		engine: "semarch-legacy",
		description: "Require SemArch CoC ownership information on applicable BPMN elements.",
		cocs: "*",
		maturities: [
			"L2",
			"L3",
			"L4"
		],
		level: "info"
	},
	"semarch/avionics-profile-active": {
		id: "semarch/avionics-profile-active",
		owner: "semarch",
		engine: "semarch-legacy",
		description: "Temporary diagnostic rule used to validate CoC-specific selection.",
		cocs: ["CoC_Avionics"],
		maturities: [
			"L1",
			"L2",
			"L3",
			"L4"
		],
		level: "info"
	}
};
//#endregion
export { RULE_CATALOG };

//# sourceMappingURL=rule-catalog.js.map