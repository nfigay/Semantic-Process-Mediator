//#region src/app/repository-membership-actions.js
function createRepositoryMembershipActions({ repositoryModel } = {}) {
	if (!repositoryModel) throw new Error("Repository membership actions require a repository model");
	function assignProcessToContainer(containerId, processId) {
		if (!repositoryModel.getContainer(containerId)) throw new Error(`Unknown repository container: ${containerId}`);
		const process = repositoryModel.getComponent(processId);
		if (!process) throw new Error(`Unknown repository component: ${processId}`);
		if (process.type !== "process") throw new Error(`Repository component is not a Process: ${processId}`);
		const existingReference = findMembershipReference(containerId, processId);
		if (existingReference) return existingReference;
		return repositoryModel.addReference({
			id: createMembershipReferenceId(containerId, processId),
			type: "contains",
			sourceId: containerId,
			targetId: processId,
			metadata: { origin: "semarch-manual" }
		});
	}
	function unassignProcessFromContainer(containerId, processId) {
		const reference = findMembershipReference(containerId, processId);
		if (!reference) return null;
		if (reference.metadata?.origin !== "semarch-manual") return null;
		repositoryModel.removeReference(reference.id);
		return reference;
	}
	function isProcessAssignedToContainer(containerId, processId) {
		return Boolean(findMembershipReference(containerId, processId));
	}
	function findMembershipReference(containerId, processId) {
		return repositoryModel.getOutgoingReferences(containerId).find((reference) => reference.type === "contains" && reference.targetId === processId) || null;
	}
	function createMembershipReferenceId(containerId, processId) {
		return `membership:${containerId}:${processId}`;
	}
	return {
		assignProcessToContainer,
		unassignProcessFromContainer,
		isProcessAssignedToContainer
	};
}
//#endregion
export { createRepositoryMembershipActions };

//# sourceMappingURL=repository-membership-actions.js.map