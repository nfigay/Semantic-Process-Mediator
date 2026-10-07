import { normalizeGuid } from "../identity/guid-generator.js";
//#region src/repository/register-bpmn-document.js
function registerBpmnDocument({ modeler, repositoryModel, repositoryDocument, containerId } = {}) {
	if (!modeler || !repositoryModel || !repositoryDocument) throw new Error("registerBpmnDocument requires modeler, repositoryModel and repositoryDocument");
	const definitions = modeler.getDefinitions();
	if (!definitions) return [];
	const rootElements = definitions.rootElements || [];
	const participantProcessIds = collectParticipantProcessIds(rootElements);
	const diagramIndex = collectDiagramIndex(definitions);
	const diagrammedElementIds = new Set(diagramIndex.keys());
	const registeredComponents = [];
	for (const rootElement of rootElements) {
		const componentType = resolveRootComponentType(rootElement);
		if (!componentType) continue;
		const bpmnId = rootElement.id;
		if (!bpmnId) continue;
		const componentId = createRuntimeComponentId(repositoryDocument.id, bpmnId);
		let component = repositoryModel.getComponent(componentId);
		if (!component) {
			const identity = readSemArchIdentity(rootElement);
			const directDiagramIds = getDirectDiagramIds(diagramIndex, bpmnId);
			component = repositoryModel.addComponent({
				id: componentId,
				type: componentType,
				name: rootElement.name || bpmnId,
				documentId: repositoryDocument.id,
				stableGuid: identity.stableGuid,
				externalIds: identity.externalIds,
				metadata: {
					bpmnId,
					hasDirectDiagram: directDiagramIds.length > 0,
					directDiagramIds
				}
			});
		}
		if (containerId && shouldExposeInContainer({
			rootElement,
			participantProcessIds,
			diagrammedElementIds
		})) ensureReference({
			repositoryModel,
			id: [
				"ref",
				containerId,
				componentId
			].join(":"),
			sourceId: containerId,
			targetId: componentId,
			type: "contains",
			metadata: createProjectionMetadata(repositoryDocument.id)
		});
		registeredComponents.push(component);
	}
	for (const rootElement of rootElements) {
		if (rootElement.$type !== "bpmn:Collaboration") continue;
		registerCollaborationParticipants({
			collaboration: rootElement,
			definitions,
			repositoryModel,
			repositoryDocument
		});
	}
	return registeredComponents;
}
function createRuntimeComponentId(documentId, bpmnId) {
	return `${documentId}::${bpmnId}`;
}
function readSemArchIdentity(bpmnElement) {
	const meta = ((bpmnElement?.extensionElements)?.values || []).find((value) => value?.$type === "semarch:Meta");
	if (!meta) return {
		stableGuid: null,
		externalIds: {}
	};
	const rawStableGuid = meta.stableGuid || meta.$attrs?.stableGuid || meta.$attrs?.["semarch:stableGuid"] || null;
	return {
		stableGuid: normalizeGuid(rawStableGuid),
		externalIds: {}
	};
}
function createProjectionMetadata(documentId) {
	return {
		projection: "bpmn",
		documentId
	};
}
function shouldExposeInContainer({ rootElement, participantProcessIds, diagrammedElementIds }) {
	switch (rootElement.$type) {
		case "bpmn:Collaboration": return true;
		case "bpmn:Process":
			if (diagrammedElementIds.has(rootElement.id)) return true;
			if (participantProcessIds.has(rootElement.id)) return false;
			return true;
		default: return false;
	}
}
function collectParticipantProcessIds(rootElements) {
	const processIds = /* @__PURE__ */ new Set();
	for (const rootElement of rootElements) {
		if (rootElement.$type !== "bpmn:Collaboration") continue;
		const participants = rootElement.participants || [];
		for (const participant of participants) {
			const processRef = participant.processRef;
			if (processRef?.id) processIds.add(processRef.id);
		}
	}
	return processIds;
}
function collectDiagramIndex(definitions) {
	const diagramIndex = /* @__PURE__ */ new Map();
	const diagrams = definitions.diagrams || [];
	for (const diagram of diagrams) {
		const bpmnElement = diagram.plane?.bpmnElement;
		if (!bpmnElement?.id || !diagram.id) continue;
		let diagramIds = diagramIndex.get(bpmnElement.id);
		if (!diagramIds) {
			diagramIds = [];
			diagramIndex.set(bpmnElement.id, diagramIds);
		}
		diagramIds.push(diagram.id);
	}
	return diagramIndex;
}
function getDirectDiagramIds(diagramIndex, bpmnId) {
	return [...diagramIndex.get(bpmnId) || []];
}
function collectParticipantDiagramViews({ definitions, collaboration, participant }) {
	const diagrams = definitions.diagrams || [];
	const process = participant.processRef;
	if (!process?.id) return [];
	const processElementIds = collectProcessElementIds(process);
	const views = [];
	for (const diagram of diagrams) {
		const plane = diagram.plane;
		if (!diagram.id || !plane || plane.bpmnElement?.id !== collaboration.id) continue;
		const representedElementIds = collectPlaneElementIds(plane);
		const representedProcessElementIds = [...processElementIds].filter((elementId) => representedElementIds.has(elementId));
		views.push({
			diagramId: diagram.id,
			planeId: plane.id || null,
			collaborationBpmnId: collaboration.id,
			representation: representedProcessElementIds.length > 0 ? "white-box" : "opaque",
			representedProcessElementIds
		});
	}
	return views;
}
function collectProcessElementIds(process) {
	const elementIds = /* @__PURE__ */ new Set();
	const visited = /* @__PURE__ */ new Set();
	collectContainedElements(process.flowElements, elementIds, visited);
	collectContainedElements(process.laneSets, elementIds, visited);
	return elementIds;
}
function collectContainedElements(elements, elementIds, visited) {
	for (const element of elements || []) {
		if (!element || visited.has(element)) continue;
		visited.add(element);
		if (element.id) elementIds.add(element.id);
		collectContainedElements(element.flowElements, elementIds, visited);
		collectContainedElements(element.laneSets, elementIds, visited);
		collectContainedElements(element.lanes, elementIds, visited);
		if (element.childLaneSet) collectContainedElements(element.childLaneSet.lanes, elementIds, visited);
	}
}
function collectPlaneElementIds(plane) {
	const elementIds = /* @__PURE__ */ new Set();
	const planeElements = plane.planeElement || [];
	for (const planeElement of planeElements) {
		const bpmnElement = planeElement?.bpmnElement;
		if (bpmnElement?.id) elementIds.add(bpmnElement.id);
	}
	return elementIds;
}
function registerCollaborationParticipants({ collaboration, definitions, repositoryModel, repositoryDocument }) {
	const participants = collaboration.participants || [];
	const collaborationComponentId = createRuntimeComponentId(repositoryDocument.id, collaboration.id);
	for (const participant of participants) {
		if (!participant.id) continue;
		const participantComponentId = createRuntimeComponentId(repositoryDocument.id, participant.id);
		let participantComponent = repositoryModel.getComponent(participantComponentId);
		if (!participantComponent) {
			const identity = readSemArchIdentity(participant);
			const diagramViews = collectParticipantDiagramViews({
				definitions,
				collaboration,
				participant
			});
			participantComponent = repositoryModel.addComponent({
				id: participantComponentId,
				type: "participant",
				name: participant.name || participant.id,
				documentId: repositoryDocument.id,
				stableGuid: identity.stableGuid,
				externalIds: identity.externalIds,
				metadata: {
					bpmnId: participant.id,
					blackBox: !participant.processRef,
					diagramViews
				}
			});
		}
		ensureReference({
			repositoryModel,
			id: [
				"ref",
				collaborationComponentId,
				participantComponentId
			].join(":"),
			sourceId: collaborationComponentId,
			targetId: participantComponentId,
			type: "participant",
			metadata: createProjectionMetadata(repositoryDocument.id)
		});
		const processRef = participant.processRef;
		if (!processRef?.id) continue;
		const processComponentId = createRuntimeComponentId(repositoryDocument.id, processRef.id);
		ensureReference({
			repositoryModel,
			id: [
				"ref",
				participantComponentId,
				processComponentId
			].join(":"),
			sourceId: participantComponentId,
			targetId: processComponentId,
			type: "processRef",
			metadata: createProjectionMetadata(repositoryDocument.id)
		});
	}
}
function resolveRootComponentType(rootElement) {
	switch (rootElement.$type) {
		case "bpmn:Process": return "process";
		case "bpmn:Collaboration": return "collaboration";
		default: return null;
	}
}
function ensureReference({ repositoryModel, id, sourceId, targetId, type, role = null, metadata = {} }) {
	const existingReference = repositoryModel.getReference(id);
	if (existingReference) return existingReference;
	return repositoryModel.addReference({
		id,
		sourceId,
		targetId,
		type,
		role,
		metadata
	});
}
//#endregion
export { registerBpmnDocument };
