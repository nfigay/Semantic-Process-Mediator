//#region src/repository/resolve-repository-view.js
function resolveRepositoryView({ repositoryModel, componentId = null, referenceId = null } = {}) {
	if (!repositoryModel) throw new Error("resolveRepositoryView requires repositoryModel");
	if (referenceId) {
		const reference = repositoryModel.getReference?.(referenceId);
		if (!reference) return createUnresolvedResult({
			reason: "reference-not-found",
			referenceId
		});
		if (reference.type === "participant") return resolveParticipantReference({
			repositoryModel,
			reference
		});
		if (reference.type === "processRef") return resolveProcessReference({
			repositoryModel,
			reference
		});
		return createUnresolvedResult({
			reason: "unsupported-reference-type",
			referenceId: reference.id
		});
	}
	if (componentId) {
		const component = repositoryModel.getComponent?.(componentId);
		if (!component) return createUnresolvedResult({
			reason: "component-not-found",
			componentId
		});
		switch (component.type) {
			case "process": return resolveProcess({
				repositoryModel,
				component
			});
			case "collaboration": return resolveCollaboration({ component });
			case "participant": return resolveParticipant({
				repositoryModel,
				component
			});
			default: return {
				status: "resolved",
				selectionKind: "component",
				semanticTarget: component,
				documentId: component.documentId || null,
				context: null,
				diagramTarget: null,
				graphicalTarget: null,
				contextualViews: [],
				displayMode: "document"
			};
		}
	}
	return createUnresolvedResult({ reason: "empty-selection" });
}
function resolveProcess({ repositoryModel, component }) {
	const contextualViews = (repositoryModel.getIncomingReferences?.(component.id)?.filter((reference) => reference.type === "processRef") || []).map((processRefReference) => createProcessContext(repositoryModel, processRefReference)).filter((context) => context !== null);
	const bpmnId = getBpmnId(component);
	const diagramTarget = createDirectDiagramTarget(component);
	return {
		status: "resolved",
		selectionKind: "process",
		semanticTarget: component,
		documentId: component.documentId || null,
		context: null,
		diagramTarget,
		graphicalTarget: diagramTarget ? { preferredElementId: bpmnId } : null,
		contextualViews,
		displayMode: "process"
	};
}
function resolveCollaboration({ component }) {
	const bpmnId = getBpmnId(component);
	const diagramTarget = createDirectDiagramTarget(component);
	return {
		status: "resolved",
		selectionKind: "collaboration",
		semanticTarget: component,
		documentId: component.documentId || null,
		context: null,
		diagramTarget,
		graphicalTarget: diagramTarget ? { preferredElementId: bpmnId } : null,
		contextualViews: [],
		displayMode: "collaboration"
	};
}
function resolveParticipant({ repositoryModel, component }) {
	const context = createParticipantContextFromComponent(repositoryModel, component);
	return {
		status: "resolved",
		selectionKind: "participant",
		semanticTarget: component,
		documentId: component.documentId || null,
		context,
		diagramTarget: createContextDiagramTarget(context),
		graphicalTarget: { preferredElementId: getBpmnId(component) },
		contextualViews: [],
		displayMode: "participant-context"
	};
}
function resolveParticipantReference({ repositoryModel, reference }) {
	const participant = repositoryModel.getComponent?.(reference.targetId) || null;
	const collaboration = repositoryModel.getComponent?.(reference.sourceId) || null;
	if (!participant) return createUnresolvedResult({
		reason: "participant-not-found",
		referenceId: reference.id,
		componentId: reference.targetId
	});
	const context = createParticipantContextFromComponent(repositoryModel, participant, collaboration);
	return {
		status: "resolved",
		selectionKind: "participant",
		semanticTarget: participant,
		documentId: participant.documentId || collaboration?.documentId || null,
		context,
		diagramTarget: createContextDiagramTarget(context),
		graphicalTarget: { preferredElementId: getBpmnId(participant) },
		contextualViews: [],
		displayMode: "participant-context"
	};
}
function resolveProcessReference({ repositoryModel, reference }) {
	const participant = repositoryModel.getComponent?.(reference.sourceId) || null;
	const process = repositoryModel.getComponent?.(reference.targetId) || null;
	if (!process) return createUnresolvedResult({
		reason: "process-not-found",
		referenceId: reference.id,
		componentId: reference.targetId
	});
	const context = participant ? createParticipantContextFromComponent(repositoryModel, participant) : null;
	return {
		status: "resolved",
		selectionKind: "process-context",
		semanticTarget: process,
		documentId: process.documentId || participant?.documentId || null,
		context,
		diagramTarget: createContextDiagramTarget(context),
		graphicalTarget: context?.participantBpmnId ? { preferredElementId: context.participantBpmnId } : null,
		contextualViews: context ? [context] : [],
		displayMode: "participant-context"
	};
}
function createProcessContext(repositoryModel, processRefReference) {
	const participant = repositoryModel.getComponent?.(processRefReference.sourceId) || null;
	if (!participant) return null;
	return createParticipantContextFromComponent(repositoryModel, participant);
}
function createParticipantContextFromComponent(repositoryModel, participant, knownCollaboration = null) {
	if (!participant) return null;
	const participantReference = repositoryModel.getIncomingReferences?.(participant.id)?.find((reference) => reference.type === "participant") || null;
	const collaboration = knownCollaboration || (participantReference ? repositoryModel.getComponent?.(participantReference.sourceId) : null) || null;
	const processRefReference = repositoryModel.getOutgoingReferences?.(participant.id)?.find((reference) => reference.type === "processRef") || null;
	const process = processRefReference ? repositoryModel.getComponent?.(processRefReference.targetId) || null : null;
	const collaborationDiagramIds = getDirectDiagramIds(collaboration);
	const diagramViews = getParticipantDiagramViews(participant, collaboration);
	return {
		participantReferenceId: participantReference?.id || null,
		processReferenceId: processRefReference?.id || null,
		collaborationId: collaboration?.id || participantReference?.sourceId || null,
		collaborationBpmnId: getBpmnId(collaboration),
		collaborationName: collaboration?.name || null,
		collaborationDiagramIds,
		participantId: participant.id,
		participantBpmnId: getBpmnId(participant),
		participantName: participant.name || null,
		blackBox: participant.metadata?.blackBox === true,
		processId: process?.id || processRefReference?.targetId || null,
		processBpmnId: getBpmnId(process),
		processName: process?.name || null,
		resolvedProcess: process !== null,
		diagramViews
	};
}
function getParticipantDiagramViews(participant, collaboration) {
	const diagramViews = participant?.metadata?.diagramViews;
	if (!Array.isArray(diagramViews)) return [];
	const collaborationBpmnId = getBpmnId(collaboration);
	return diagramViews.filter((view) => !collaborationBpmnId || view?.collaborationBpmnId === collaborationBpmnId).map((view) => ({
		...view,
		representedProcessElementIds: Array.isArray(view?.representedProcessElementIds) ? [...view.representedProcessElementIds] : []
	}));
}
function createContextDiagramTarget(context) {
	if (!context?.collaborationBpmnId) return null;
	const diagramViews = Array.isArray(context.diagramViews) ? context.diagramViews : [];
	if (diagramViews.length === 1) {
		const contextualView = diagramViews[0];
		return {
			diagramId: contextualView.diagramId || null,
			preferredRootElementId: context.collaborationBpmnId,
			representation: contextualView.representation || null
		};
	}
	if (diagramViews.length > 1) return null;
	const collaborationDiagramIds = Array.isArray(context.collaborationDiagramIds) ? context.collaborationDiagramIds : [];
	if (collaborationDiagramIds.length === 1) return {
		diagramId: collaborationDiagramIds[0],
		preferredRootElementId: context.collaborationBpmnId,
		representation: null
	};
	if (collaborationDiagramIds.length > 1) return null;
	return {
		diagramId: null,
		preferredRootElementId: context.collaborationBpmnId,
		representation: null
	};
}
function createDirectDiagramTarget(component) {
	const bpmnId = getBpmnId(component);
	if (!bpmnId) return null;
	const directDiagramIds = getDirectDiagramIds(component);
	if (directDiagramIds.length > 0) return {
		diagramId: directDiagramIds[0],
		preferredRootElementId: bpmnId
	};
	if (component?.metadata?.hasDirectDiagram === true) return {
		diagramId: null,
		preferredRootElementId: bpmnId
	};
	return null;
}
function getDirectDiagramIds(component) {
	const diagramIds = component?.metadata?.directDiagramIds;
	if (!Array.isArray(diagramIds)) return [];
	return [...diagramIds];
}
function getBpmnId(component) {
	return component?.metadata?.bpmnId || null;
}
function createUnresolvedResult(details = {}) {
	return {
		status: "unresolved",
		selectionKind: null,
		semanticTarget: null,
		documentId: null,
		context: null,
		diagramTarget: null,
		graphicalTarget: null,
		contextualViews: [],
		displayMode: "none",
		...details
	};
}
//#endregion
export { resolveRepositoryView };
