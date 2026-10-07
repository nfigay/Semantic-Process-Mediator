//#region src/ui/workspace-tree-filter.js
function filterWorkspaceTreeNodes(nodes, query) {
	const normalizedQuery = String(query || "").trim().toLocaleLowerCase();
	if (!normalizedQuery) return nodes;
	return (nodes || []).map((node) => filterNode(node, normalizedQuery)).filter(Boolean);
}
function filterNode(node, normalizedQuery) {
	if (String(node?.text || "").toLocaleLowerCase().includes(normalizedQuery)) return node;
	const filteredChildren = (node?.nodes || []).map((child) => filterNode(child, normalizedQuery)).filter(Boolean);
	if (filteredChildren.length === 0) return null;
	return {
		...node,
		nodes: filteredChildren
	};
}
//#endregion
export { filterWorkspaceTreeNodes };

//# sourceMappingURL=workspace-tree-filter.js.map