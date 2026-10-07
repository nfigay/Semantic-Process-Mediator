//#region src/ui/repository-membership-menu.js
function createRepositoryMembershipMenu({ sidebar, repositoryModel, onAssignProcessToContainer, onUnassignProcessFromContainer } = {}) {
	if (!sidebar) throw new Error("Repository membership menu requires a sidebar");
	if (!repositoryModel) throw new Error("Repository membership menu requires a repository model");
	function resolveContext(node) {
		if (!node) return null;
		switch (node.repositoryKind) {
			case "process-reference": return resolveProcessReferenceContext(node);
			case "component": return resolveProcessComponentContext(node);
			default: return null;
		}
	}
	function resolveProcessReferenceContext(node) {
		const processReference = repositoryModel.getReference(node.repositoryId);
		if (!processReference || processReference.type !== "processRef") return null;
		const process = repositoryModel.getComponent(processReference.targetId);
		if (!process || process.type !== "process") return null;
		const participantId = processReference.sourceId;
		const participantReferences = repositoryModel.getIncomingReferences(participantId).filter((reference) => reference.type === "participant");
		const containerIds = /* @__PURE__ */ new Set();
		for (const participantReference of participantReferences) {
			const collaborationId = participantReference.sourceId;
			const containerReferences = repositoryModel.getIncomingReferences(collaborationId).filter((reference) => reference.type === "contains" && repositoryModel.getContainer(reference.sourceId));
			for (const containerReference of containerReferences) containerIds.add(containerReference.sourceId);
		}
		if (containerIds.size !== 1) return null;
		const [containerId] = containerIds;
		return {
			kind: "contextual-process",
			containerId,
			processId: process.id,
			processReferenceId: processReference.id
		};
	}
	function resolveProcessComponentContext(node) {
		const process = repositoryModel.getComponent(node.repositoryId);
		if (!process || process.type !== "process") return null;
		const memberships = repositoryModel.getIncomingReferences(process.id).filter((reference) => reference.type === "contains" && repositoryModel.getContainer(reference.sourceId));
		if (memberships.length !== 1) return null;
		const membership = memberships[0];
		return {
			kind: "process-membership",
			containerId: membership.sourceId,
			processId: process.id,
			membershipReference: membership
		};
	}
	function buildMenu(context) {
		if (!context) return [];
		if (context.kind === "contextual-process") {
			if (findMembership(context.containerId, context.processId)) return [];
			return [{
				id: "add-process-to-coc",
				text: "Add Process to CoC"
			}];
		}
		if (context.kind === "process-membership" && context.membershipReference?.metadata?.origin === "semarch-manual") return [{
			id: "remove-process-from-coc",
			text: "Remove Process from CoC"
		}];
		return [];
	}
	function findMembership(containerId, processId) {
		return repositoryModel.getOutgoingReferences(containerId).find((reference) => reference.type === "contains" && reference.targetId === processId) || null;
	}
	let activeContext = null;
	function handleContextMenu(event) {
		activeContext = resolveContext(sidebar.get(event.target));
		sidebar.menu = buildMenu(activeContext);
		if (sidebar.menu.length === 0) event.preventDefault?.();
	}
	function handleMenuClick(event) {
		if (!activeContext) return;
		switch (resolveMenuItemId(event)) {
			case "add-process-to-coc":
				onAssignProcessToContainer?.({
					containerId: activeContext.containerId,
					processId: activeContext.processId
				});
				break;
			case "remove-process-from-coc": onUnassignProcessFromContainer?.({
				containerId: activeContext.containerId,
				processId: activeContext.processId
			});
		}
	}
	function resolveMenuItemId(event) {
		const directId = event?.detail?.menuItem?.id || event?.detail?.item?.id || event?.detail?.subItem?.id || null;
		if (directId) return directId;
		const menuIndex = event?.detail?.menuIndex ?? event?.detail?.index ?? null;
		if (Number.isInteger(menuIndex)) return sidebar.menu?.[menuIndex]?.id || null;
		return null;
	}
	sidebar.on("contextMenu", handleContextMenu);
	sidebar.on("menuClick", handleMenuClick);
	return {
		resolveContext,
		destroy() {
			sidebar.off("contextMenu", handleContextMenu);
			sidebar.off("menuClick", handleMenuClick);
			sidebar.menu = [];
			activeContext = null;
		}
	};
}
//#endregion
export { createRepositoryMembershipMenu };
