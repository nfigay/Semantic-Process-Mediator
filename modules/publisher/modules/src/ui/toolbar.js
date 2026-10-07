//#region src/ui/toolbar.js
function createToolbar({ mode = "editor", capabilities = {}, onNew, onNewBpmnModel = onNew, onNewArchimate, onNewBusinessObject, onBrowseBusinessObjects, onImport, onImportSparxEa, onImportArchimate, onOpenBpmn, onOpenWorkspaceArchive, onSaveWorkspaceArchive, onOpenWorkspaceFolder, onSaveWorkspaceFolder, onRenameWorkspace, onWorkspaceManifest, onNewRepository, onOpenRepository, onAssembleRepository, onExportXml, onExportSvg, onFit, onContext, onLint, onValidate, onExtractUiTree, onExtractRepositoryGraph, onExtractBpmnModel, onExtractBpmnViews }) {
	const isViewer = mode === "viewer";
	const hasUtilities = capabilities.utilities !== false;
	const modelCommandIds = [
		"btn-export-xml",
		"btn-export-svg",
		"btn-fit",
		"btn-lint"
	];
	if (hasUtilities) modelCommandIds.push("utilities");
	if (!isViewer) modelCommandIds.push("btn-context", "btn-validate");
	const items = [{
		type: "html",
		id: "title",
		html: `
        <span style="
          font-family:'Syne',sans-serif;
          font-weight:700;
          font-size:11px;
          letter-spacing:.1em;
          text-transform:uppercase;
          color:#fff;
          padding:0 8px;
        ">
          BPMNSM
        </span>
      `
	}, { type: "break" }];
	if (isViewer) items.push({
		type: "menu",
		id: "repository",
		text: "Repository",
		items: [{
			id: "open-bpmn",
			text: "Open BPMN…"
		}, {
			id: "open-repository",
			text: "Open Repository…"
		}]
	});
	if (!isViewer) {
		const workspaceItems = [];
		const directWorkspaceAvailable = capabilities.directWorkspace !== false && typeof window !== "undefined" && typeof window.showDirectoryPicker === "function";
		if (directWorkspaceAvailable) workspaceItems.push({
			id: "open-workspace-folder",
			text: "Open Workspace Folder…"
		});
		workspaceItems.push({
			id: "open-workspace-archive",
			text: "Open Workspace Archive…"
		});
		workspaceItems.push({ type: "break" });
		workspaceItems.push({
			id: "rename-workspace",
			text: "Rename Workspace…"
		});
		workspaceItems.push({
			id: "workspace-manifest",
			text: "Workspace Manifest…"
		});
		workspaceItems.push({ type: "break" });
		workspaceItems.push({
			id: "import-environment",
			text: "Import BPMN…"
		});
		workspaceItems.push({
			id: "import-sparx-ea-environment",
			text: "Import from Sparx EA…"
		});
		workspaceItems.push({
			id: "import-archimate-environment",
			text: "Import ArchiMate…"
		});
		workspaceItems.push({ type: "break" });
		if (directWorkspaceAvailable) workspaceItems.push({
			id: "save-workspace-folder",
			text: "Save Workspace Folder"
		});
		workspaceItems.push({
			id: "save-workspace-archive",
			text: "Save Workspace Archive…"
		});
		items.push({
			type: "menu",
			id: "workspace",
			text: "Workspace",
			items: workspaceItems
		}, {
			type: "menu",
			id: "model",
			text: "Model",
			items: [
				{
					id: "new-bpmn-model",
					text: "New BPMN Model…"
				},
				{
					id: "new-archimate-model",
					text: "New ArchiMate Model…"
				},
				{
					id: "new-business-object",
					text: "New Business Object…"
				},
				{
					id: "browse-business-objects",
					text: "Business Objects…"
				}
			]
		});
	}
	items.push({ type: "break" }, {
		type: "button",
		id: "btn-export-xml",
		text: "Export XML",
		disabled: true
	}, {
		type: "button",
		id: "btn-export-svg",
		text: "Export SVG",
		disabled: true
	}, { type: "break" }, {
		type: "button",
		id: "btn-fit",
		text: "Fit",
		disabled: true
	}, { type: "break" });
	if (!isViewer) items.push({
		type: "button",
		id: "btn-context",
		text: "⚙ CoC Context",
		disabled: true
	});
	items.push({
		type: "button",
		id: "btn-lint",
		text: "⚡ Lint",
		disabled: true
	});
	if (!isViewer) items.push({
		type: "button",
		id: "btn-validate",
		text: "✓ Validate",
		disabled: true
	});
	if (hasUtilities) items.push({
		type: "menu",
		id: "utilities",
		text: "Utilities",
		disabled: true,
		items: [{
			id: "extracts",
			text: "Extracts",
			items: [
				{
					id: "extract-ui-tree",
					text: "UI Tree"
				},
				{
					id: "extract-repository-graph",
					text: "Repository Graph"
				},
				{
					id: "extract-bpmn-model",
					text: "BPMN Model"
				},
				{
					id: "extract-bpmn-views",
					text: "BPMN Views"
				}
			]
		}]
	});
	items.push({
		type: "html",
		id: "method-status",
		html: `
        <span
          id="method-status-badge"
          data-status="NO_MODEL"

          style="
            display:inline-block;

            margin-left:8px;
            padding:4px 10px;

            font-family:monospace;
            font-size:10px;
            font-weight:700;

            letter-spacing:.05em;

            color:#ffffff;
            background:#444444;

            border-radius:4px;

            white-space:nowrap;
          "
        >
          NO MODEL
        </span>
      `
	}, { type: "spacer" }, {
		type: "html",
		id: "badge",
		html: `
        <span
          id="lint-badge"

          style="
            display:none;

            font-family:monospace;
            font-size:11px;

            background:rgba(
              255,
              255,
              255,
              .12
            );

            color:#fff;

            padding:2px 10px;

            border-radius:20px;
          "
        >
        </span>
      `
	});
	function invoke(target) {
		switch (target) {
			case "repository:new-repository":
			case "new-repository":
				if (!isViewer) onNewRepository?.();
				break;
			case "repository:open-bpmn":
			case "open-bpmn":
				if (isViewer) onOpenBpmn?.();
				break;
			case "repository:open-repository":
			case "open-repository":
				onOpenRepository?.();
				break;
			case "workspace:open-workspace-folder":
			case "open-workspace-folder":
				if (!isViewer) onOpenWorkspaceFolder?.();
				break;
			case "workspace:open-workspace-archive":
			case "open-workspace-archive":
				if (!isViewer) onOpenWorkspaceArchive?.();
				break;
			case "workspace:save-workspace-folder":
			case "save-workspace-folder":
				if (!isViewer) onSaveWorkspaceFolder?.();
				break;
			case "workspace:save-workspace-archive":
			case "save-workspace-archive":
				if (!isViewer) onSaveWorkspaceArchive?.();
				break;
			case "workspace:rename-workspace":
			case "rename-workspace":
				if (!isViewer) onRenameWorkspace?.();
				break;
			case "workspace:workspace-manifest":
			case "workspace-manifest":
				if (!isViewer) onWorkspaceManifest?.();
				break;
			case "workspace:import-sparx-ea-environment":
			case "import-sparx-ea-environment":
				if (!isViewer) onImportSparxEa?.();
				break;
			case "workspace:import-environment":
			case "repository:import-environment":
			case "import-environment":
				if (!isViewer) onImport?.();
				break;
			case "workspace:import-archimate-environment":
			case "repository:import-archimate-environment":
			case "import-archimate-environment":
				if (!isViewer) onImportArchimate?.();
				break;
			case "repository:assemble-repository":
			case "assemble-repository":
				if (!isViewer) onAssembleRepository?.();
				break;
			case "model:new-bpmn-model":
			case "new-bpmn-model":
			case "model:new-process":
			case "new-process":
				if (!isViewer) onNewBpmnModel?.();
				break;
			case "model:new-archimate-model":
			case "new-archimate-model":
				if (!isViewer) onNewArchimate?.();
				break;
			case "model:browse-business-objects":
			case "browse-business-objects":
				if (!isViewer) onBrowseBusinessObjects?.();
				break;
			case "model:new-business-object":
			case "new-business-object":
				if (!isViewer) onNewBusinessObject?.();
				break;
			case "btn-export-xml":
				onExportXml?.();
				break;
			case "btn-export-svg":
				onExportSvg?.();
				break;
			case "btn-fit":
				onFit?.();
				break;
			case "btn-context":
				if (!isViewer) onContext?.();
				break;
			case "btn-lint":
				onLint?.();
				break;
			case "btn-validate":
				if (!isViewer) onValidate?.();
				break;
			case "utilities:extract-ui-tree":
			case "extract-ui-tree":
				onExtractUiTree?.();
				break;
			case "utilities:extract-repository-graph":
			case "extract-repository-graph":
				onExtractRepositoryGraph?.();
				break;
			case "utilities:extract-bpmn-model":
			case "extract-bpmn-model":
				onExtractBpmnModel?.();
				break;
			case "utilities:extract-bpmn-views":
			case "extract-bpmn-views": onExtractBpmnViews?.();
		}
	}
	return {
		items,
		modelCommandIds,
		invoke,
		onClick(event) {
			invoke(event.target);
		}
	};
}
//#endregion
export { createToolbar };
