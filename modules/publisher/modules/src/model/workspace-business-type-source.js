import workspace_business_types_default from "./workspace-business-types.js";
//#region src/model/workspace-business-type-source.js
function createWorkspaceBusinessTypeSource() {
	return { getTypes() {
		return [...workspace_business_types_default.types];
	} };
}
function getWorkspaceBusinessContextRoles() {
	return { ...workspace_business_types_default.contextRoles };
}
//#endregion
export { createWorkspaceBusinessTypeSource, getWorkspaceBusinessContextRoles };

//# sourceMappingURL=workspace-business-type-source.js.map