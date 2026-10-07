//#region src/app/repository-membership-actions.js
function createRepositoryMembershipActions({ repositoryModel, activeRepository, modeler } = {}) {
	if (!repositoryModel && !activeRepository) throw new Error("Repository membership actions require a repository model or active repository");
	function resolveRepositoryModel() {
		return activeRepository?.get?.()?.model || repositoryModel || null;
	}
	function assignProcessToContainer(containerId, processId) {
		const activeRepositoryModel = resolveRepositoryModel();
		if (!activeRepositoryModel) throw new Error("Repository membership actions require an active repository model");
		const container = activeRepositoryModel.getContainer(containerId);
		if (!container) throw new Error(`Unknown repository container: ${containerId}`);
		const process = activeRepositoryModel.getComponent(processId);
		if (!process) throw new Error(`Unknown repository component: ${processId}`);
		if (process.type !== "process") throw new Error(`Repository component is not a Process: ${processId}`);
		const existingReference = findMembershipReference(activeRepositoryModel, containerId, processId);
		if (existingReference) return existingReference;
		const reference = activeRepositoryModel.addReference({
			id: createMembershipReferenceId(containerId, processId),
			type: "contains",
			sourceId: containerId,
			targetId: processId,
			metadata: { origin: "semarch-manual" }
		});
		persistMembership({
			container,
			process,
			assigned: true
		});
		return reference;
	}
	function unassignProcessFromContainer(containerId, processId) {
		const activeRepositoryModel = resolveRepositoryModel();
		if (!activeRepositoryModel) return null;
		const reference = findMembershipReference(activeRepositoryModel, containerId, processId);
		if (!reference) return null;
		if (reference.metadata?.origin !== "semarch-manual") return null;
		const container = activeRepositoryModel.getContainer(containerId);
		const process = activeRepositoryModel.getComponent(processId);
		activeRepositoryModel.removeReference(reference.id);
		persistMembership({
			container,
			process,
			assigned: false
		});
		return reference;
	}
	function isProcessAssignedToContainer(containerId, processId) {
		const activeRepositoryModel = resolveRepositoryModel();
		if (!activeRepositoryModel) return false;
		return Boolean(findMembershipReference(activeRepositoryModel, containerId, processId));
	}
	function persistMembership({ container, process, assigned }) {
		if (!modeler || !container || !process) return;
		const componentRef = process.metadata?.bpmnId;
		if (!componentRef) return;
		const definitions = modeler.getDefinitions?.();
		const moddle = modeler.get?.("moddle");
		const modeling = modeler.get?.("modeling");
		const rootElement = modeler.get?.("canvas")?.getRootElement?.() || null;
		if (!definitions || !moddle || !modeling || !rootElement) return;
		let extensionElements = definitions.extensionElements;
		if (!extensionElements) {
			extensionElements = moddle.create("bpmn:ExtensionElements", { values: [] });
			modeling.updateModdleProperties(rootElement, definitions, { extensionElements });
		}
		const values = extensionElements.values || [];
		const cocExists = values.some((value) => value.$type === "semarch:CoC" && value.id === container.id);
		const isMembership = (value) => value.$type === "semarch:Membership" && value.cocRef === container.id && value.componentRef === componentRef;
		let nextValues = values.filter((value) => !isMembership(value));
		if (!cocExists) nextValues = [...nextValues, moddle.create("semarch:CoC", {
			id: container.id,
			name: container.name || container.id
		})];
		if (assigned) nextValues = [...nextValues, moddle.create("semarch:Membership", {
			cocRef: container.id,
			componentRef
		})];
		modeling.updateModdleProperties(rootElement, extensionElements, { values: nextValues });
	}
	function findMembershipReference(activeRepositoryModel, containerId, processId) {
		return activeRepositoryModel.getOutgoingReferences(containerId).find((reference) => reference.type === "contains" && reference.targetId === processId) || null;
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