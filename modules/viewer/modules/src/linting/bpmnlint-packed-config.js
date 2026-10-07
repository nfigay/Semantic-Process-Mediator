import { __exportAll } from "../../_virtual/_rolldown/runtime.js";
//#region src/linting/bpmnlint-packed-config.js
var bpmnlint_packed_config_exports = /* @__PURE__ */ __exportAll({
	config: () => config,
	default: () => bundle,
	moddleExtensions: () => moddleExtensions,
	resolver: () => resolver
});
function getDefaultExportFromCjs(x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function getAugmentedNamespace(n) {
	if (Object.prototype.hasOwnProperty.call(n, "__esModule")) return n;
	var f = n.default;
	if (typeof f == "function") {
		var a = function a() {
			var isInstance = false;
			try {
				isInstance = this instanceof a;
			} catch (e) {}
			if (isInstance) return Reflect.construct(f, arguments, this.constructor);
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
	} else a = {};
	Object.defineProperty(a, "__esModule", { value: true });
	Object.keys(n).forEach(function(k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function() {
				return n[k];
			}
		});
	});
	return a;
}
/**
* Checks whether node is of specific bpmn type.
*
* @param {ModdleElement} node
* @param {String} type
*
* @return {Boolean}
*/
function is(node, type) {
	if (type.indexOf(":") === -1) type = "bpmn:" + type;
	return typeof node.$instanceOf === "function" ? node.$instanceOf(type) : node.$type === type;
}
/**
* Checks whether node has any of the specified types.
*
* @param {ModdleElement} node
* @param {Array<String>} types
*
* @return {Boolean}
*/
function isAny(node, types) {
	return types.some(function(type) {
		return is(node, type);
	});
}
var require$$0 = /*@__PURE__*/ getAugmentedNamespace(/* @__PURE__ */ Object.freeze({
	__proto__: null,
	is,
	isAny
}));
var helper = {};
var hasRequiredHelper;
function requireHelper() {
	if (hasRequiredHelper) return helper;
	hasRequiredHelper = 1;
	const { is } = require$$0;
	/**
	* @typedef { import('../lib/types.js').ModdleElement } ModdleElement
	*
	* @typedef { import('../lib/types.js').RuleFactory } RuleFactory
	* @typedef { import('../lib/types.js').RuleDefinition } RuleDefinition
	*/
	/**
	* Create a checker that disallows the given element type.
	*
	* @param { string } type
	*
	* @return { RuleFactory } ruleFactory
	*/
	function checkDiscouragedNodeType(type, ruleName) {
		/**
		* @type { RuleFactory }
		*/
		return function() {
			function check(node, reporter) {
				if (is(node, type)) reporter.report(node.id, "Element type <" + type + "> is discouraged");
			}
			return annotateRule(ruleName, { check });
		};
	}
	helper.checkDiscouragedNodeType = checkDiscouragedNodeType;
	/**
	* Find a parent for the given element
	*
	* @param { ModdleElement } node
	* @param { string } type
	*
	* @return { ModdleElement } element
	*/
	function findParent(node, type) {
		if (!node) return null;
		const parent = node.$parent;
		if (!parent) return node;
		if (is(parent, type)) return parent;
		return findParent(parent, type);
	}
	helper.findParent = findParent;
	/**
	* Check if the node is inside of an executable process.
	*
	* @param { ModdleElement } node
	*
	* @return { boolean }
	*/
	function isInExecutableProcess(node) {
		const process = findParent(node, "bpmn:Process");
		return process && process.isExecutable;
	}
	helper.isInExecutableProcess = isInExecutableProcess;
	const documentationBaseUrl = "https://github.com/bpmn-io/bpmnlint/blob/main/docs/rules";
	/**
	* Annotate a rule with core information, such as the documentation url.
	*
	* @param {string} ruleName
	* @param {RuleDefinition} options
	*
	* @return {RuleDefinition}
	*/
	function annotateRule(ruleName, options) {
		const { meta: { documentation = {}, ...restMeta } = {}, ...restOptions } = options;
		return {
			meta: {
				documentation: {
					url: `${documentationBaseUrl}/${ruleName}.md`,
					...documentation
				},
				...restMeta
			},
			...restOptions
		};
	}
	helper.annotateRule = annotateRule;
	return helper;
}
var labelRequired;
var hasRequiredLabelRequired;
function requireLabelRequired() {
	if (hasRequiredLabelRequired) return labelRequired;
	hasRequiredLabelRequired = 1;
	const { is, isAny } = require$$0;
	const { annotateRule } = requireHelper();
	/**
	* A rule that checks the presence of a label.
	*
	* @type { import('../lib/types.js').RuleFactory }
	*/
	labelRequired = function() {
		function check(node, reporter) {
			if (isAny(node, ["bpmn:ParallelGateway", "bpmn:EventBasedGateway"])) return;
			if (is(node, "bpmn:Gateway") && !isForking(node)) return;
			if (is(node, "bpmn:SubProcess")) return;
			if (is(node, "bpmn:SequenceFlow") && !hasCondition(node)) return;
			if (isAny(node, [
				"bpmn:FlowNode",
				"bpmn:SequenceFlow",
				"bpmn:Participant",
				"bpmn:Lane"
			])) {
				if ((node.name || "").trim().length === 0) reporter.report(node.id, "Element is missing label/name", ["name"]);
			}
		}
		return annotateRule("label-required", { check });
	};
	function isForking(node) {
		return (node.outgoing || []).length > 1;
	}
	function hasCondition(node) {
		return node.conditionExpression;
	}
	return labelRequired;
}
var rule_0 = /*@__PURE__*/ getDefaultExportFromCjs(requireLabelRequired());
var APPLIES_TO = [
	"bpmn:Task",
	"bpmn:UserTask",
	"bpmn:ServiceTask",
	"bpmn:ManualTask",
	"bpmn:BusinessRuleTask",
	"bpmn:ScriptTask",
	"bpmn:CallActivity",
	"bpmn:SubProcess",
	"bpmn:ExclusiveGateway",
	"bpmn:InclusiveGateway",
	"bpmn:ParallelGateway",
	"bpmn:EventBasedGateway",
	"bpmn:ComplexGateway",
	"bpmn:StartEvent",
	"bpmn:EndEvent",
	"bpmn:IntermediateCatchEvent",
	"bpmn:IntermediateThrowEvent",
	"bpmn:BoundaryEvent",
	"bpmn:DataObjectReference",
	"bpmn:DataStoreReference"
];
function rule_1() {
	function check(node, reporter) {
		if (!APPLIES_TO.includes(node.$type)) return;
		if (!node.name || node.name.trim() === "") {
			const type = node.$type.replace("bpmn:", "");
			reporter.report(node.id, `${type} "${node.id}" has no name — unnamed elements break traceability`);
		}
	}
	return { check };
}
var AUTO_GEN_RE = /^[A-Za-z]+_[0-9a-zA-Z]{7,}$/;
function rule_2() {
	function check(node, reporter) {
		if (!node || !node.id) return;
		if (node.$type === "bpmn:Process" && node.id === "Process_1") {
			reporter.report(node.id, "Default \"Process_1\" ID — rename to something like \"CoC_Avionics_AssemblyVerification\"");
			return;
		}
		if (AUTO_GEN_RE.test(node.id)) reporter.report(node.id, `Auto-generated ID "${node.id}". Use semantic naming: {ProcessId}_{Type}_{Name}`);
	}
	return { check };
}
var cache = {};
/**
* A resolver that caches rules and configuration as part of the bundle,
* making them accessible in the browser.
*
* @param {Object} cache
*/
function Resolver() {}
Resolver.prototype.resolveRule = function(pkg, ruleName) {
	const rule = cache[pkg + "/" + ruleName];
	if (!rule) throw new Error("cannot resolve rule <" + pkg + "/" + ruleName + ">: not bundled");
	return rule;
};
Resolver.prototype.resolveConfig = function(pkg, configName) {
	throw new Error("cannot resolve config <" + configName + "> in <" + pkg + ">: not bundled");
};
var resolver = new Resolver();
var config = { rules: {
	"label-required": "warn",
	"semarch/named-element": "info",
	"semarch/stable-id": "warn"
} };
var moddleExtensions = {};
var bundle = {
	resolver,
	config,
	moddleExtensions
};
cache["bpmnlint/label-required"] = rule_0;
cache["bpmnlint-plugin-semarch/named-element"] = rule_1;
cache["bpmnlint-plugin-semarch/stable-id"] = rule_2;
//#endregion
export { bpmnlint_packed_config_exports, config, bundle as default, moddleExtensions, resolver };

//# sourceMappingURL=bpmnlint-packed-config.js.map