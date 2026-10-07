//#region src/repository/projection-profiles/coc-projection-profile.js
var cocProjectionProfile = {
	id: "coc",
	label: "Centres of Competence",
	rootComponentTypes: ["collaboration", "process"],
	contextualizeProcessesUnderCollaborations: true,
	collaborationProcessContext: {
		participantReferenceType: "participant",
		processReferenceType: "processRef"
	},
	preferCollaborationContextOverDirectCocMembership: true
};
//#endregion
export { cocProjectionProfile };

//# sourceMappingURL=coc-projection-profile.js.map