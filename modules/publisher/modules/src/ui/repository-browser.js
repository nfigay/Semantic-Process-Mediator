import { w2sidebar } from "../../node_modules/w2ui/w2ui-2.0.es6.min.js";
import { createEnvironmentProjection } from "../repository/environment-projection.js";
import { filterWorkspaceTreeNodes } from "./workspace-tree-filter.js";
//#region src/ui/repository-browser.js
function createRepositoryBrowser({ store, repositoryModel, activeRepository, container, repositories = [], getRepositories = null, getSources = null, projectionProfile = null, onSelect, onContainerSelect, onRepositorySelect, onSourceSelect, onDuplicateResourceRequest, onDeriveResourceRequest } = {}) {
	if (!container) throw new Error("Repository browser requires a container");
	if (!activeRepository && !repositoryModel) throw new Error("Repository browser requires a repositoryModel or activeRepository");
	function resolveRepositoryState() {
		const repository = activeRepository?.get?.() || null;
		return {
			repository,
			repositoryModel: repository?.model || repositoryModel || null,
			store: repository?.documents || store || null
		};
	}
	const sidebarName = `repository_sidebar_${Math.random().toString(36).slice(2)}`;
	let sidebar = null;
	let activeView = "environment";
	let sidebarContainer = null;
	let searchQuery = "";
	function rootCategoryNodeId(category) {
		return `environment:${category}`;
	}
	function repositoryNodeId(repositoryId) {
		return `repository:${repositoryId}`;
	}
	function documentNodeId(documentId, context = "root") {
		return `document:${context}:${documentId}`;
	}
	function containerNodeId(containerId, context = "root") {
		return `coc:${context}:${containerId}`;
	}
	function componentNodeId(componentId, context = "root") {
		return `component:${context}:${componentId}`;
	}
	function participantCategoryNodeId(collaborationId, context = "root") {
		return `participants:${context}:${collaborationId}`;
	}
	function participantNodeId(participantId, context = "root") {
		return `participant:${context}:${participantId}`;
	}
	function processReferenceNodeId(referenceId, context = "root") {
		return `process-ref:${context}:${referenceId}`;
	}
	function unresolvedCategoryNodeId(containerId, context = "root") {
		return `unresolved-category:${context}:${containerId}`;
	}
	function unresolvedNodeId(referenceId, context = "root") {
		return `unresolved:${context}:${referenceId}`;
	}
	function getEnvironmentProjection(repositoryState = resolveRepositoryState()) {
		const { repositoryModel: resolvedRepositoryModel, store: resolvedStore } = repositoryState;
		return createEnvironmentProjection({
			repositoryModel: resolvedRepositoryModel,
			repositories: typeof getRepositories === "function" ? getRepositories() : repositories,
			documents: resolvedStore?.getDocuments?.() || [],
			...projectionProfile ? { projectionProfile } : {}
		});
	}
	function buildNodes() {
		if (activeView === "sources") return buildSourcesViewNodes();
		if (activeView === "models") return buildModelsViewNodes();
		return buildEnvironmentViewNodes();
	}
	function buildSourcesViewNodes() {
		return (typeof getSources === "function" ? getSources() : []).map(buildPhysicalSourceNode);
	}
	function buildEnvironmentViewNodes() {
		const projection = getEnvironmentProjection(resolveRepositoryState());
		return [
			buildRepositoriesRoot(projection.repositories),
			buildCocsRoot(projection.cocs),
			buildCollaborationsRoot(projection.collaborations),
			buildProcessesRoot(projection.processes),
			buildArchimateRoot(projection.archimate)
		];
	}
	function buildModelsViewNodes() {
		const projection = getEnvironmentProjection(resolveRepositoryState());
		return [
			buildProcessesRoot(projection.processes),
			buildCollaborationsRoot(projection.collaborations),
			buildArchimateRoot(projection.archimate)
		];
	}
	function buildVisibleNodes() {
		return filterWorkspaceTreeNodes(buildNodes(), searchQuery);
	}
	function buildPhysicalSourceNode(source) {
		return {
			id: `source:${source.id}`,
			text: source.name || source.id,
			icon: "w2ui-icon-folder",
			expanded: true,
			repositoryKind: "source",
			sourceId: source.id,
			sourceMode: source.mode || null,
			nodes: buildPhysicalResourceNodes(source.id, source.resources || [])
		};
	}
	function buildPhysicalResourceNodes(sourceId, resources) {
		const root = [];
		for (const resource of resources) {
			const path = String(resource?.path || "").replace(/^\/+|\/+$/g, "");
			if (!path) continue;
			const parts = path.split("/").filter(Boolean);
			let nodes = root;
			let currentPath = "";
			parts.forEach((part, index) => {
				currentPath = currentPath ? `${currentPath}/${part}` : part;
				const isFile = index === parts.length - 1;
				const id = `resource:${sourcePathId(sourceId)}:${sourcePathId(currentPath)}`;
				let node = nodes.find((candidate) => candidate.id === id);
				if (!node) {
					node = {
						id,
						text: part,
						icon: isFile ? "w2ui-icon-file" : "w2ui-icon-folder",
						expanded: !isFile,
						repositoryKind: isFile ? "resource" : "resource-folder",
						resourcePath: currentPath,
						sourceId,
						...isFile ? { resource } : { nodes: [] }
					};
					nodes.push(node);
					nodes.sort((left, right) => {
						const leftFolder = left.repositoryKind === "resource-folder";
						if (leftFolder !== (right.repositoryKind === "resource-folder")) return leftFolder ? -1 : 1;
						return left.text.localeCompare(right.text);
					});
				}
				if (!isFile) nodes = node.nodes;
			});
		}
		return root;
	}
	function sourcePathId(path) {
		return encodeURIComponent(path);
	}
	function buildRepositoriesRoot(repositoryEntries) {
		return {
			id: rootCategoryNodeId("repositories"),
			text: "Repositories",
			icon: "w2ui-icon-folder",
			expanded: true,
			repositoryKind: "environment-category",
			nodes: repositoryEntries.map(buildRepositoryNode)
		};
	}
	function buildCocsRoot(cocEntries) {
		return {
			id: rootCategoryNodeId("cocs"),
			text: "CoCs",
			icon: "w2ui-icon-folder",
			expanded: true,
			repositoryKind: "environment-category",
			nodes: cocEntries.map((cocEntry) => buildCocNode(cocEntry, "root"))
		};
	}
	function buildCollaborationsRoot(collaborationEntries) {
		return {
			id: rootCategoryNodeId("collaborations"),
			text: "Collaborations",
			icon: "w2ui-icon-folder",
			expanded: true,
			repositoryKind: "environment-category",
			nodes: collaborationEntries.map((collaborationEntry) => buildCollaborationNode(collaborationEntry, "root"))
		};
	}
	function buildProcessesRoot(processes) {
		return {
			id: rootCategoryNodeId("processes"),
			text: "Processes",
			icon: "w2ui-icon-folder",
			expanded: true,
			repositoryKind: "environment-category",
			nodes: processes.map((process) => buildProcessComponentNode(process, "root"))
		};
	}
	function buildArchimateRoot(documents) {
		return {
			id: rootCategoryNodeId("archimate"),
			text: "ArchiMate",
			icon: "w2ui-icon-folder",
			expanded: true,
			repositoryKind: "environment-category",
			nodes: documents.map((document) => buildArchimateDocumentNode(document, "root"))
		};
	}
	function buildArchimateDocumentNode(document, context) {
		return {
			id: documentNodeId(document.id, context),
			text: document.fileName || document.id,
			icon: "w2ui-icon-file",
			repositoryKind: "document",
			repositoryId: document.id,
			documentKind: "archimate"
		};
	}
	function buildRepositoryNode(repositoryEntry) {
		const repository = repositoryEntry.repository;
		const context = `repository:${repository.id}`;
		return {
			id: repositoryNodeId(repository.id),
			text: repository.name || repository.id,
			icon: "w2ui-icon-folder",
			expanded: true,
			repositoryKind: "repository",
			repositoryId: repository.id,
			nodes: repositoryEntry.cocs.map((cocEntry) => buildCocNode(cocEntry, context))
		};
	}
	function buildCocNode(cocEntry, parentContext) {
		const repositoryContainer = cocEntry.container;
		const context = `${parentContext}:coc:${repositoryContainer.id}`;
		const nodes = [];
		if (cocEntry.collaborations.length > 0) nodes.push({
			id: `${context}:collaborations`,
			text: "Collaborations",
			icon: "w2ui-icon-folder",
			expanded: true,
			repositoryKind: "environment-category",
			nodes: cocEntry.collaborations.map((collaborationEntry) => buildCollaborationNode(collaborationEntry, context))
		});
		if (cocEntry.processes.length > 0) nodes.push({
			id: `${context}:processes`,
			text: "Processes",
			icon: "w2ui-icon-folder",
			expanded: true,
			repositoryKind: "environment-category",
			nodes: cocEntry.processes.map((process) => buildProcessComponentNode(process, context))
		});
		if (cocEntry.unresolved.length > 0) nodes.push(buildUnresolvedCategoryNode(cocEntry, context));
		return {
			id: containerNodeId(repositoryContainer.id, parentContext),
			text: repositoryContainer.name || repositoryContainer.id,
			icon: "w2ui-icon-folder",
			expanded: true,
			repositoryKind: "container",
			repositoryId: repositoryContainer.id,
			nodes
		};
	}
	function buildCollaborationNode(collaborationEntry, parentContext) {
		const collaboration = collaborationEntry.collaboration;
		const context = `${parentContext}:collaboration:${collaboration.id}`;
		const node = {
			id: componentNodeId(collaboration.id, parentContext),
			text: collaboration.name || collaboration.metadata?.bpmnId || collaboration.id,
			icon: getComponentIcon(collaboration.type),
			expanded: true,
			repositoryKind: "component",
			repositoryId: collaboration.id,
			nodes: []
		};
		const participantEntries = buildParticipantEntries(collaborationEntry.processes);
		if (participantEntries.length > 0) node.nodes.push(buildParticipantCategoryNode(collaboration, participantEntries, context));
		return node;
	}
	function buildParticipantEntries(processOccurrences) {
		const entriesByParticipantId = /* @__PURE__ */ new Map();
		for (const occurrence of processOccurrences) {
			const participant = occurrence.participant;
			if (!participant) continue;
			if (!entriesByParticipantId.has(participant.id)) entriesByParticipantId.set(participant.id, {
				participant,
				participantReference: occurrence.participantReference || null,
				processOccurrences: []
			});
			entriesByParticipantId.get(participant.id).processOccurrences.push(occurrence);
		}
		return Array.from(entriesByParticipantId.values()).sort(compareParticipantEntries);
	}
	function buildParticipantCategoryNode(collaboration, participantEntries, context) {
		return {
			id: participantCategoryNodeId(collaboration.id, context),
			text: "Participants",
			icon: "w2ui-icon-folder",
			expanded: true,
			repositoryKind: "environment-category",
			nodes: participantEntries.map((participantEntry) => buildParticipantNode(participantEntry, context))
		};
	}
	function buildParticipantNode(entry, context) {
		const participant = entry.participant;
		const participantContext = `${context}:participant:${participant.id}`;
		const node = {
			id: participantNodeId(participant.id, context),
			text: participant.name || participant.metadata?.bpmnId || participant.id,
			icon: "w2ui-icon-file",
			expanded: true,
			repositoryKind: "participant",
			repositoryId: participant.id,
			nodes: []
		};
		for (const occurrence of entry.processOccurrences) {
			if (occurrence.blackBox) continue;
			if (!occurrence.processReference) continue;
			node.nodes.push(buildProcessReferenceNode(occurrence, participantContext));
		}
		return node;
	}
	function buildProcessReferenceNode(occurrence, context) {
		const reference = occurrence.processReference;
		const process = occurrence.process;
		return {
			id: processReferenceNodeId(reference.id, context),
			text: process?.name || process?.metadata?.bpmnId || reference.targetId,
			icon: "w2ui-icon-file",
			repositoryKind: "process-reference",
			repositoryId: reference.id,
			processComponentId: reference.targetId,
			resolved: occurrence.resolved
		};
	}
	function buildProcessComponentNode(process, context) {
		return {
			id: componentNodeId(process.id, context),
			text: process.name || process.metadata?.bpmnId || process.id,
			icon: getComponentIcon(process.type),
			repositoryKind: "component",
			repositoryId: process.id
		};
	}
	function buildUnresolvedCategoryNode(cocEntry, context) {
		return {
			id: unresolvedCategoryNodeId(cocEntry.container.id, context),
			text: "Unresolved References",
			icon: "w2ui-icon-folder",
			expanded: true,
			repositoryKind: "environment-category",
			nodes: cocEntry.unresolved.map((child) => buildUnresolvedNode(child, context))
		};
	}
	function buildUnresolvedNode(child, context) {
		const reference = child.reference;
		return {
			id: unresolvedNodeId(reference.id, context),
			text: reference.targetId,
			icon: "w2ui-icon-info",
			repositoryKind: "unresolved",
			repositoryId: reference.id
		};
	}
	function getComponentIcon(type) {
		switch (type) {
			case "collaboration": return "w2ui-icon-columns";
			case "process": return "w2ui-icon-file";
			case "participant": return "w2ui-icon-file";
			default: return "w2ui-icon-file";
		}
	}
	function compareParticipantEntries(left, right) {
		const leftText = left.participant?.name || left.participant?.metadata?.bpmnId || left.participant?.id || "";
		const rightText = right.participant?.name || right.participant?.metadata?.bpmnId || right.participant?.id || "";
		return leftText.localeCompare(rightText);
	}
	function createNavigation() {
		container.replaceChildren();
		sidebarContainer = document.createElement("div");
		sidebarContainer.style.height = "100%";
		container.append(sidebarContainer);
		sidebar = new w2sidebar({
			name: sidebarName,
			flatButton: false,
			nodes: buildVisibleNodes(),
			onClick(event) {
				handleClick(event.target);
			}
		});
		sidebar.render(sidebarContainer);
	}
	function getResourceDuplicationMenuItem(nodeId) {
		const node = sidebar.get(nodeId);
		if (node?.repositoryKind !== "component") return null;
		const { repositoryModel: resolvedRepositoryModel } = resolveRepositoryState();
		if (!(resolvedRepositoryModel?.getComponent?.(node.repositoryId))?.documentId) return null;
		return {
			id: "duplicate-resource",
			text: "Duplicate resource to…"
		};
	}
	function requestResourceDuplication(nodeId) {
		const node = sidebar.get(nodeId);
		if (node?.repositoryKind !== "component") return null;
		const { repositoryModel: resolvedRepositoryModel } = resolveRepositoryState();
		const component = resolvedRepositoryModel?.getComponent?.(node.repositoryId);
		if (!component?.documentId) return null;
		return onDuplicateResourceRequest?.({
			documentId: component.documentId,
			componentId: component.id
		}) || null;
	}
	function requestResourceDerivation(nodeId) {
		const node = sidebar.get(nodeId);
		if (node?.repositoryKind !== "component") return null;
		const { repositoryModel: resolvedRepositoryModel } = resolveRepositoryState();
		const component = resolvedRepositoryModel?.getComponent?.(node.repositoryId);
		if (!component?.documentId || component.type !== "process") return null;
		return onDeriveResourceRequest?.({
			documentId: component.documentId,
			componentId: component.id
		}) || null;
	}
	function handleClick(nodeId) {
		const node = sidebar.get(nodeId);
		if (!node) return;
		switch (node.repositoryKind) {
			case "source":
				onSourceSelect?.(node.sourceId);
				break;
			case "resource":
				onResourceSelect?.({
					sourceId: node.sourceId,
					resource: node.resource || { path: node.resourcePath }
				});
				break;
			case "repository":
				onRepositorySelect?.(node.repositoryId);
				break;
			case "container":
				selectContainer(node.repositoryId, false);
				break;
			case "component":
				selectComponent(node.repositoryId, false);
				break;
			case "participant":
				selectParticipant(node.repositoryId, false);
				break;
			case "process-reference":
				selectProcessReference(node.repositoryId, false);
				break;
			case "document": selectDocument(node.repositoryId, false);
		}
	}
	function findNodeId(predicate) {
		if (!sidebar) return null;
		function visit(nodes) {
			for (const node of nodes || []) {
				if (predicate(node)) return node.id;
				const childResult = visit(node.nodes);
				if (childResult) return childResult;
			}
			return null;
		}
		return visit(sidebar.nodes);
	}
	function findSemanticNodeId(repositoryKind, repositoryId) {
		return findNodeId((node) => node.repositoryKind === repositoryKind && node.repositoryId === repositoryId);
	}
	function selectContainer(containerId, selectSidebar = true) {
		const { repositoryModel: resolvedRepositoryModel } = resolveRepositoryState();
		const repositoryContainer = resolvedRepositoryModel?.getContainer?.(containerId);
		if (!repositoryContainer) return null;
		if (selectSidebar) {
			render();
			const nodeId = findSemanticNodeId("container", containerId);
			if (nodeId) sidebar.select(nodeId);
		}
		onContainerSelect?.(repositoryContainer);
		return repositoryContainer;
	}
	function selectComponent(componentId, selectSidebar = true) {
		const { repositoryModel: resolvedRepositoryModel, store: resolvedStore } = resolveRepositoryState();
		const component = resolvedRepositoryModel?.getComponent?.(componentId);
		if (!component) return null;
		if (selectSidebar) {
			render();
			const nodeId = findSemanticNodeId("component", componentId);
			if (nodeId) sidebar.select(nodeId);
		}
		const repositoryDocument = component.documentId ? resolvedStore?.getDocument?.(component.documentId) : null;
		if (repositoryDocument) {
			resolvedStore?.setActiveDocument?.(repositoryDocument.id);
			onSelect?.(repositoryDocument, component, {
				kind: "component",
				componentId: component.id,
				bpmnElementId: component.metadata?.bpmnId || null
			});
		}
		return component;
	}
	function selectParticipant(participantComponentId, selectSidebar = true) {
		const { repositoryModel: resolvedRepositoryModel, store: resolvedStore } = resolveRepositoryState();
		const participant = resolvedRepositoryModel?.getComponent?.(participantComponentId);
		if (!participant || participant.type !== "participant") return null;
		const repositoryDocument = participant.documentId ? resolvedStore?.getDocument?.(participant.documentId) : null;
		if (!repositoryDocument) return null;
		if (selectSidebar) {
			render();
			const nodeId = findSemanticNodeId("participant", participant.id);
			if (nodeId) sidebar.select(nodeId);
		}
		resolvedStore?.setActiveDocument?.(repositoryDocument.id);
		const processReference = resolvedRepositoryModel?.getOutgoingReferences?.(participant.id)?.find((reference) => reference.type === "processRef") || null;
		onSelect?.(repositoryDocument, participant, {
			kind: "participant",
			participantComponentId: participant.id,
			participantId: participant.metadata?.bpmnId || null,
			processComponentId: processReference?.targetId || null,
			blackBox: !processReference
		});
		return participant;
	}
	function selectProcessReference(referenceId, selectSidebar = true) {
		const { repositoryModel: resolvedRepositoryModel, store: resolvedStore } = resolveRepositoryState();
		const reference = resolvedRepositoryModel?.getReference?.(referenceId);
		if (!reference || reference.type !== "processRef") return null;
		const participant = resolvedRepositoryModel?.getComponent?.(reference.sourceId) || null;
		const process = resolvedRepositoryModel?.getComponent?.(reference.targetId) || null;
		const documentId = process?.documentId || participant?.documentId || null;
		const repositoryDocument = documentId ? resolvedStore?.getDocument?.(documentId) : null;
		if (!repositoryDocument) return null;
		if (selectSidebar) {
			render();
			const nodeId = findSemanticNodeId("process-reference", reference.id);
			if (nodeId) sidebar.select(nodeId);
		}
		resolvedStore?.setActiveDocument?.(repositoryDocument.id);
		onSelect?.(repositoryDocument, process, {
			kind: "reference",
			referenceId: reference.id,
			processComponentId: reference.targetId,
			participantComponentId: reference.sourceId
		});
		return reference;
	}
	function selectDocument(documentId, selectSidebar = true) {
		const { store: resolvedStore } = resolveRepositoryState();
		const repositoryDocument = resolvedStore?.getDocument?.(documentId);
		if (!repositoryDocument) return null;
		resolvedStore?.setActiveDocument?.(documentId);
		if (selectSidebar) {
			render();
			const nodeId = findSemanticNodeId("document", documentId);
			if (nodeId) sidebar.select(nodeId);
		}
		onSelect?.(repositoryDocument, null, {
			kind: "document",
			documentId: repositoryDocument.id
		});
		return repositoryDocument;
	}
	function render() {
		if (!sidebar) return;
		const selected = sidebar.selected;
		const selectedNode = selected ? sidebar.get(selected) : null;
		const selectedSemanticIdentity = selectedNode ? {
			repositoryKind: selectedNode.repositoryKind,
			repositoryId: selectedNode.repositoryId
		} : null;
		const rootNodeIds = (sidebar.nodes || []).map((node) => node.id);
		for (const rootNodeId of rootNodeIds) sidebar.remove(rootNodeId);
		sidebar.add(buildVisibleNodes());
		if (selected && sidebar.get(selected)) {
			sidebar.select(selected);
			return;
		}
		if (selectedSemanticIdentity?.repositoryKind && selectedSemanticIdentity?.repositoryId) {
			const replacementNodeId = findSemanticNodeId(selectedSemanticIdentity.repositoryKind, selectedSemanticIdentity.repositoryId);
			if (replacementNodeId) sidebar.select(replacementNodeId);
		}
	}
	function setSearchQuery(query) {
		searchQuery = String(query || "");
		render();
	}
	function getSearchQuery() {
		return searchQuery;
	}
	createNavigation();
	function setView(view) {
		if (view !== "sources" && view !== "models" && view !== "environment") return;
		if (activeView === view) return;
		activeView = view;
		render();
	}
	return {
		render,
		setView,
		setSearchQuery,
		getSearchQuery,
		selectContainer,
		selectComponent,
		selectParticipant,
		selectProcessReference,
		selectDocument,
		getResourceDuplicationMenuItem,
		requestResourceDuplication,
		requestResourceDerivation,
		sidebar,
		destroy() {
			if (sidebar) {
				sidebar.destroy();
				sidebar = null;
			}
		}
	};
}
//#endregion
export { createRepositoryBrowser };

//# sourceMappingURL=repository-browser.js.map