//#region src/identity/identity-policy.js
var AUTO_GENERATED_IDENTITY_TYPES = /* @__PURE__ */ new Set([
	"bpmn:Process",
	"bpmn:Collaboration",
	"bpmn:Participant"
]);
function shouldGenerateStableGuid(bpmnElement) {
	return Boolean(bpmnElement) && AUTO_GENERATED_IDENTITY_TYPES.has(bpmnElement.$type);
}
//#endregion
export { shouldGenerateStableGuid };

//# sourceMappingURL=identity-policy.js.map