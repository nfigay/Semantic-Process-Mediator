//#region src/repository/project-repository-metadata.js
function projectRepositoryMetadata({ modeler, repositoryModel } = {}) {
	if (!modeler || !repositoryModel) throw new Error("projectRepositoryMetadata requires modeler and repositoryModel");
	const extensionValues = modeler.getDefinitions()?.extensionElements?.values || [];
	const repositoryContext = extensionValues.find((value) => value.$type === "semarch:RepositoryContext") || null;
	const cocElements = extensionValues.filter((value) => value.$type === "semarch:CoC");
	const containers = [];
	for (const coc of cocElements) {
		if (!coc.id) continue;
		const existingContainer = repositoryModel.getContainer(coc.id);
		if (existingContainer) {
			containers.push(existingContainer);
			continue;
		}
		const container = repositoryModel.addContainer({
			id: coc.id,
			name: coc.name || coc.id,
			metadata: { projection: "semarch-repository" }
		});
		containers.push(container);
	}
	const componentsByBpmnId = /* @__PURE__ */ new Map();
	for (const component of repositoryModel.getComponents()) {
		const bpmnId = component.metadata?.bpmnId;
		if (!bpmnId) continue;
		if (componentsByBpmnId.has(bpmnId)) {
			componentsByBpmnId.set(bpmnId, null);
			continue;
		}
		componentsByBpmnId.set(bpmnId, component);
	}
	const membershipElements = extensionValues.filter((value) => value.$type === "semarch:Membership");
	const references = [];
	const unresolvedMemberships = [];
	for (const membership of membershipElements) {
		const cocRef = membership.cocRef;
		const componentRef = membership.componentRef;
		if (!cocRef || !componentRef) {
			unresolvedMemberships.push({
				membership,
				reason: "missing-reference"
			});
			continue;
		}
		const container = repositoryModel.getContainer(cocRef);
		if (!container) {
			unresolvedMemberships.push({
				membership,
				reason: "coc-not-found"
			});
			continue;
		}
		const component = componentsByBpmnId.get(componentRef);
		if (component === null) {
			unresolvedMemberships.push({
				membership,
				reason: "ambiguous-component"
			});
			continue;
		}
		if (!component) {
			unresolvedMemberships.push({
				membership,
				reason: "component-not-found"
			});
			continue;
		}
		const referenceId = `repository-membership:${cocRef}:${componentRef}`;
		const existingReference = repositoryModel.getReference(referenceId);
		if (existingReference) {
			references.push(existingReference);
			continue;
		}
		const reference = repositoryModel.addReference({
			id: referenceId,
			type: "contains",
			sourceId: container.id,
			targetId: component.id,
			metadata: {
				projection: "semarch-repository",
				cocRef,
				componentRef
			}
		});
		references.push(reference);
	}
	return {
		repositoryContext: {
			repositoryId: repositoryContext?.repositoryId || null,
			mode: repositoryContext?.mode || null
		},
		containers,
		references,
		unresolvedMemberships
	};
}
//#endregion
export { projectRepositoryMetadata };

//# sourceMappingURL=project-repository-metadata.js.map