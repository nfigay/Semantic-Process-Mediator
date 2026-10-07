import { w2sidebar } from "../../node_modules/w2ui/w2ui-2.0.es6.min.js";
import { filterWorkspaceTreeNodes } from "./workspace-tree-filter.js";
import { createWorkspaceContextsProjection } from "./workspace-contexts-projection.js";
//#region src/ui/workspace-contexts-browser.js
function createWorkspaceContextsBrowser({ container, businessObjectStore, repositoryModel = null, activeRepository = null, projectionProfile = void 0, onSelect = null } = {}) {
	if (!container) throw new Error("Workspace Contexts browser requires a container");
	if (!businessObjectStore?.getBusinessObjects) throw new Error("Workspace Contexts browser requires a Business Object store");
	const name = `workspace_contexts_sidebar_${Math.random().toString(36).slice(2)}`;
	let sidebar = null;
	let sidebarContainer = null;
	let searchQuery = "";
	function objectNodes(objects, kind) {
		return objects.map((object) => ({
			id: `${kind}:${object.id}`,
			text: object.name || object.label || object.id,
			expanded: true,
			workspaceContextKind: kind,
			businessObjectId: object.id
		}));
	}
	function componentNode(component, context) {
		return {
			id: `context-component:${context}:${component.id}`,
			text: component.name || component.metadata?.bpmnId || component.id,
			workspaceContextKind: "component",
			repositoryComponentId: component.id
		};
	}
	function referentialNodes(objects, entriesByBusinessObjectId) {
		return objects.map((object) => {
			const entry = entriesByBusinessObjectId?.get(object.id) || null;
			return {
				id: `referential:${object.id}`,
				text: object.name || object.label || object.id,
				expanded: true,
				workspaceContextKind: "referential",
				businessObjectId: object.id,
				nodes: (entry?.components || []).map((component) => componentNode(component, `referential:${object.id}`))
			};
		});
	}
	function cocNodes(objects, entriesByBusinessObjectId) {
		return objects.map((object) => {
			const entry = entriesByBusinessObjectId?.get(object.id) || null;
			const nodes = [];
			if (entry?.collaborations?.length) nodes.push({
				id: `coc:${object.id}:collaborations`,
				text: "Collaborations",
				expanded: true,
				nodes: entry.collaborations.map((item) => componentNode(item.collaboration, `coc:${object.id}:collaboration`))
			});
			if (entry?.processes?.length) nodes.push({
				id: `coc:${object.id}:processes`,
				text: "Processes",
				expanded: true,
				nodes: entry.processes.map((process) => componentNode(process, `coc:${object.id}:process`))
			});
			return {
				id: `coc:${object.id}`,
				text: object.name || object.label || object.id,
				expanded: true,
				workspaceContextKind: "coc",
				businessObjectId: object.id,
				nodes
			};
		});
	}
	function buildNodes() {
		const currentRepositoryModel = activeRepository?.get?.()?.model || repositoryModel;
		const projection = createWorkspaceContextsProjection({
			businessObjects: businessObjectStore.getBusinessObjects(),
			repositoryModel: currentRepositoryModel,
			projectionProfile
		});
		const nodes = [
			{
				id: "contexts:repositories",
				text: "Repositories",
				expanded: true,
				nodes: objectNodes(projection.repositories.businessObjects, "repository")
			},
			{
				id: "contexts:referentials",
				text: "Referentials",
				expanded: true,
				nodes: referentialNodes(projection.referentials.businessObjects, projection.referentials.entriesByBusinessObjectId)
			},
			{
				id: "contexts:cocs",
				text: "CoCs",
				expanded: true,
				nodes: cocNodes(projection.cocs.businessObjects, projection.cocs.entriesByBusinessObjectId)
			}
		];
		return filterWorkspaceTreeNodes(nodes, searchQuery);
	}
	function createNavigation() {
		container.replaceChildren();
		sidebarContainer = document.createElement("div");
		sidebarContainer.style.height = "100%";
		container.append(sidebarContainer);
		sidebar = new w2sidebar({
			name,
			flatButton: false,
			nodes: buildNodes(),
			onClick(event) {
				const node = sidebar.get(event.target);
				if (node?.repositoryComponentId) onSelect?.({
					kind: node.workspaceContextKind,
					repositoryComponentId: node.repositoryComponentId
				});
				else if (node?.businessObjectId) onSelect?.({
					kind: node.workspaceContextKind,
					businessObjectId: node.businessObjectId
				});
			}
		});
		sidebar.render(sidebarContainer);
	}
	function render() {
		if (!sidebar) return;
		const selected = sidebar.selected;
		for (const node of [...sidebar.nodes || []]) sidebar.remove(node.id);
		sidebar.add(buildNodes());
		if (selected && sidebar.get(selected)) sidebar.select(selected);
	}
	function setSearchQuery(query) {
		searchQuery = String(query || "");
		render();
	}
	function getSearchQuery() {
		return searchQuery;
	}
	createNavigation();
	return {
		render,
		setSearchQuery,
		getSearchQuery,
		get sidebar() {
			return sidebar;
		}
	};
}
//#endregion
export { createWorkspaceContextsBrowser };

//# sourceMappingURL=workspace-contexts-browser.js.map