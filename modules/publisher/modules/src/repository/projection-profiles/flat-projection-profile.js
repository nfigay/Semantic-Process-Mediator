//#region src/repository/projection-profiles/flat-projection-profile.js
var flatProjectionProfile = {
	id: "flat",
	label: "Flat",
	rootComponentTypes: ["collaboration", "process"],
	contextualizeProcessesUnderCollaborations: false,
	collaborationProcessContext: {},
	preferCollaborationContextOverDirectCocMembership: false
};
//#endregion
export { flatProjectionProfile };

//# sourceMappingURL=flat-projection-profile.js.map