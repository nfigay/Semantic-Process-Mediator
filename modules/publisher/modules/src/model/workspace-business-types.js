//#region src/model/workspace-business-types.json
var types = [
	{
		"id": "CoC",
		"label": "CoC"
	},
	{
		"id": "Referential",
		"label": "Referential"
	},
	{
		"id": "Repository",
		"label": "Repository"
	}
];
var contextRoles = {
	"cocTypeRef": "CoC",
	"referentialTypeRef": "Referential",
	"repositoryTypeRef": "Repository"
};
var workspace_business_types_default = {
	types,
	contextRoles
};
//#endregion
export { contextRoles, workspace_business_types_default as default, types };

//# sourceMappingURL=workspace-business-types.js.map