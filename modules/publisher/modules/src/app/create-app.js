import { createLayout } from "../ui/layout.js";
import { createLintPanel, createLintRenderer } from "../ui/lint-panel.js";
import { createReadOnlyPropertiesPanel } from "../ui/read-only-properties-panel.js";
import { createDiagramPropertiesPanel } from "../ui/diagram-properties-panel.js";
import { createVisualPropertiesPanel } from "../ui/visual-properties-panel.js";
import { createRepositoryBrowser } from "../ui/repository-browser.js";
import { createDiagramBrowser } from "../ui/diagram-browser.js";
import { openRepositoryViewDialog } from "../ui/repository-view-dialog.js";
import { createRepositoryMembershipMenu } from "../ui/repository-membership-menu.js";
import { isViewerMode, normalizeAppMode } from "./app-mode.js";
import { createBpmnEngine } from "../bpmn/create-bpmn-engine.js";
import { createBpmnViewIndex } from "../bpmn/bpmn-view-index.js";
import { SemArchLinter } from "../linting/semarch-linter.js";
import { createBpmnlintPanelBridge } from "../linting/bpmnlint-panel-bridge.js";
import { createLintResultStore } from "../linting/lint-result-store.js";
import { createToolbar } from "../ui/toolbar.js";
import { createRepositoryDocumentStore } from "../repository/repository-document-store.js";
import { createRepositoryModel } from "../repository/repository-model.js";
import { createBusinessObjectStore } from "../model/business-object-store.js";
import { createBusinessObjectRepresentationStore } from "../model/business-object-representation-store.js";
import { createRepositoryEditorSync } from "../repository/repository-editor-sync.js";
import { resolveRepositoryView } from "../repository/resolve-repository-view.js";
import { createUiTreeExtract } from "../extracts/ui-tree-extract.js";
import { createRepositoryGraphExtract } from "../extracts/repository-graph-extract.js";
import { createBpmnModelExtract } from "../extracts/bpmn-model-extract.js";
import { createBpmnViewsExtract } from "../extracts/bpmn-views-extract.js";
import { createBusinessObjectRepresentationActions } from "./business-object-representation-actions.js";
import { createRepositoryMembershipActions } from "./repository-membership-actions.js";
import { ArchimateAdapter } from "../archimate/archimate-adapter.js";
import { createArchimateView } from "../ui/views/archimate-view.js";
import { normalizeCocConfiguration } from "../configuration/coc-configuration.js";
import { normalizePublicationConfiguration } from "../configuration/publication-configuration.js";
//#region src/app/create-app.js
function createApp({ actions = {}, cocConfiguration = null, mode = "editor", profileRuntime = null, businessView = null, readRepositoryContext = null, projectionProfile = null, publicationConfiguration = null } = {}) {
	const appMode = normalizeAppMode(mode);
	const normalizedCocConfiguration = cocConfiguration ? normalizeCocConfiguration(cocConfiguration) : null;
	const normalizedPublicationConfiguration = publicationConfiguration ? normalizePublicationConfiguration(publicationConfiguration) : null;
	const repositoryDocumentStore = createRepositoryDocumentStore();
	const repositoryModel = createRepositoryModel();
	const businessObjectStore = createBusinessObjectStore();
	const businessObjectRepresentationStore = createBusinessObjectRepresentationStore();
	const businessObjectRepresentationActions = createBusinessObjectRepresentationActions({
		businessObjectStore,
		businessObjectRepresentationStore,
		onChanged: actions.onBusinessObjectRepresentationsChanged
	});
	const businessObjectNavigationActions = { navigate(businessObject) {
		actions.onNavigateBusinessObject?.(businessObject);
	} };
	const repositoryMembershipActions = createRepositoryMembershipActions({ repositoryModel });
	let repositoryBrowser = null;
	let diagramBrowser = null;
	async function deliverExtract(text, fileName, label) {
		console.log(text);
		try {
			await navigator.clipboard.writeText(text);
			console.info(`SemArch ${label} extract copied to clipboard.`);
		} catch {
			console.info(`SemArch ${label} extract could not be copied to clipboard.`);
		}
		const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = fileName;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
		console.info(`SemArch ${label} extract downloaded as ${fileName}.`);
		return text;
	}
	async function extractUiTree() {
		const nodes = repositoryBrowser?.sidebar?.nodes || [];
		return deliverExtract(createUiTreeExtract(nodes), "semarch-ui-tree.txt", "UI Tree");
	}
	async function extractRepositoryGraph() {
		return deliverExtract(createRepositoryGraphExtract(repositoryModel), "semarch-repository-graph.txt", "Repository Graph");
	}
	async function extractBpmnModel() {
		const definitions = modeler.getDefinitions();
		return deliverExtract(createBpmnModelExtract(definitions), "semarch-bpmn-model.txt", "BPMN Model");
	}
	async function extractBpmnViews() {
		const definitions = modeler.getDefinitions();
		return deliverExtract(createBpmnViewsExtract(definitions), "semarch-bpmn-views.txt", "BPMN Views");
	}
	const toolbar = createToolbar({
		mode: appMode,
		capabilities: normalizedPublicationConfiguration?.capabilities,
		onNew: actions.onNew,
		onNewBpmnModel: actions.onNewBpmnModel || actions.onNew,
		onNewArchimate: actions.onNewArchimate,
		onNewBusinessObject: actions.onNewBusinessObject,
		onBrowseBusinessObjects: actions.onBrowseBusinessObjects,
		onImport: actions.onImport,
		onImportSparxEa: actions.onImportSparxEa,
		onImportArchimate: actions.onImportArchimate,
		onOpenBpmn: actions.onOpenBpmn,
		onOpenWorkspaceFolder: actions.onOpenWorkspaceFolder,
		onOpenWorkspaceArchive: actions.onOpenWorkspaceArchive,
		onSaveWorkspaceFolder: actions.onSaveWorkspaceFolder,
		onSaveWorkspaceArchive: actions.onSaveWorkspaceArchive,
		onRenameWorkspace: actions.onRenameWorkspace,
		onWorkspaceManifest: actions.onWorkspaceManifest,
		onNewRepository: actions.onNewRepository,
		onOpenRepository: actions.onOpenRepository,
		onAssembleRepository: actions.onAssembleRepository,
		onExportXml: actions.onExportXml,
		onExportSvg: actions.onExportSvg,
		onFit: actions.onFit,
		onContext: actions.onContext,
		onLint: actions.onLint,
		onValidate: actions.onValidate,
		onExtractUiTree: extractUiTree,
		onExtractRepositoryGraph: extractRepositoryGraph,
		onExtractBpmnModel: extractBpmnModel,
		onExtractBpmnViews: extractBpmnViews
	});
	const layout = createLayout({
		toolbar,
		mode: appMode
	});
	async function showArchimate({ xml = null, documentId = null } = {}) {
		const viewId = documentId ? `archimate:${documentId}` : "archimate";
		const archimateView = createArchimateView({
			id: viewId,
			createAdapter({ container }) {
				return new ArchimateAdapter({ container });
			},
			xml,
			onModelChanged({ adapter }) {
				if (!documentId) return;
				(async () => {
					try {
						if (!repositoryDocumentStore.getDocuments().find((document) => document.id === documentId)) return;
						const result = await adapter.saveXML({ format: true });
						if (!repositoryDocumentStore.getDocuments().find((document) => document.id === documentId)) return;
						repositoryDocumentStore.updateDocument(documentId, {
							xml: result.xml,
							dirty: true
						});
					} catch (error) {
						console.error("Unable to persist edited ArchiMate document:", error);
					}
				})();
			}
		});
		await layout.setCentralRepresentation(layout.CENTRAL_REPRESENTATION.ARCHIMATE, { view: archimateView });
		return archimateView;
	}
	layout.el("right").innerHTML = `
        <div
          id="properties-surfaces"
          style="
            width:100%;
            height:100%;
            position:relative;
            overflow:hidden;
          "
        >

          <div
            id="bpmn-props"
            style="
              width:100%;
              height:100%;
              overflow:hidden;
            "
          ></div>

          <div
            id="visual-props"
            style="
              display:none;
              width:100%;
              height:100%;
              overflow:auto;
            "
          ></div>

          <div
            id="diagram-props"
            style="
              display:none;
              width:100%;
              height:100%;
              overflow:auto;
            "
          ></div>

        </div>
      `;
	const bpmnPropertiesContainer = layout.el("right").querySelector("#bpmn-props");
	const diagramPropertiesContainer = layout.el("right").querySelector("#diagram-props");
	const visualPropertiesContainer = layout.el("right").querySelector("#visual-props");
	createLintPanel(layout);
	const modeler = createBpmnEngine({
		mode: appMode,
		container: "#bpmn-canvas",
		propertiesPanel: "#bpmn-props",
		profileRuntime,
		businessView,
		readRepositoryContext,
		businessObjectStore,
		businessObjectRepresentationActions,
		businessObjectNavigationActions
	});
	function getBpmnViewIndex() {
		const definitions = modeler.getDefinitions?.();
		return createBpmnViewIndex(definitions);
	}
	const readOnlyPropertiesPanel = isViewerMode(appMode) ? createReadOnlyPropertiesPanel({
		modeler,
		container: "#bpmn-props"
	}) : null;
	const diagramPropertiesPanel = createDiagramPropertiesPanel({
		container: diagramPropertiesContainer,
		bpmnPropertiesContainer
	});
	const visualPropertiesPanel = !isViewerMode(appMode) ? createVisualPropertiesPanel({
		container: visualPropertiesContainer,
		modeler,
		editable: true
	}) : null;
	function selectBpmnElement(bpmnElementId) {
		if (!bpmnElementId) return null;
		const elementRegistry = modeler.get("elementRegistry");
		const selection = modeler.get("selection");
		const element = elementRegistry.get(bpmnElementId);
		if (!element) return null;
		selection.select(element);
		return element;
	}
	modeler.on("selection.changed", (event) => {
		const selection = event?.newSelection || [];
		if (layout.navigation === "diagrams") {
			visualPropertiesPanel?.show(selection);
			return;
		}
		visualPropertiesPanel?.hide();
		if (selection.length > 0) diagramPropertiesPanel.showBpmnProperties();
	});
	layout.onNavigationChange?.((navigation) => {
		if (navigation !== "diagrams") {
			visualPropertiesPanel?.hide();
			return;
		}
		const selection = modeler.get("selection")?.get?.() || [];
		visualPropertiesPanel?.show(selection);
	});
	async function openBpmnDiagram(diagramTarget = null) {
		if (!diagramTarget) return null;
		const { diagramId = null, preferredRootElementId = null } = diagramTarget;
		if (!diagramId && !preferredRootElementId) return null;
		const diagrams = (modeler.getDefinitions?.())?.diagrams || [];
		if (diagramId) {
			const exactDiagram = diagrams.find((candidate) => candidate.id === diagramId) || null;
			if (!exactDiagram) return null;
			await modeler.open(exactDiagram);
			return modeler.get("canvas").getRootElement() || null;
		}
		const currentRootElement = modeler.get("canvas").getRootElement();
		if (currentRootElement?.id === preferredRootElementId) return currentRootElement;
		const diagram = diagrams.find((candidate) => candidate.plane?.bpmnElement?.id === preferredRootElementId) || null;
		if (!diagram) return null;
		await modeler.open(diagram);
		return modeler.get("canvas").getRootElement() || null;
	}
	function getBpmnDiagram(diagramId) {
		if (!diagramId) return null;
		return ((modeler.getDefinitions?.())?.diagrams || []).find((diagram) => diagram.id === diagramId) || null;
	}
	async function handleDiagramSelection(view) {
		if (!view?.diagramId) return;
		await openBpmnDiagram({
			diagramId: view.diagramId,
			preferredRootElementId: view.subject?.bpmnId || null
		});
		modeler.get("selection").select(null);
		const diagram = getBpmnDiagram(view.diagramId);
		diagramPropertiesPanel.showDiagram(diagram);
	}
	function resolveSelectionView(component, repositorySelection) {
		if (!repositorySelection) return null;
		switch (repositorySelection.kind) {
			case "participant": return resolveRepositoryView({
				repositoryModel,
				componentId: repositorySelection.participantComponentId
			});
			case "component": return resolveRepositoryView({
				repositoryModel,
				componentId: component?.id || repositorySelection.componentId || null
			});
			case "reference": return resolveRepositoryView({
				repositoryModel,
				referenceId: repositorySelection.referenceId
			});
			default: return null;
		}
	}
	function resolveSingleContextualView(resolvedView) {
		if (!resolvedView || resolvedView.diagramTarget) return resolvedView;
		const contextualViews = Array.isArray(resolvedView.contextualViews) ? resolvedView.contextualViews : [];
		if (contextualViews.length !== 1) return resolvedView;
		const processReferenceId = contextualViews[0]?.processReferenceId || null;
		if (!processReferenceId) return resolvedView;
		const contextualView = resolveRepositoryView({
			repositoryModel,
			referenceId: processReferenceId
		});
		if (!contextualView || contextualView.status !== "resolved") return resolvedView;
		return contextualView;
	}
	async function handleRepositorySelection(repositoryDocument, component, repositorySelection) {
		if (repositoryDocument?.kind === "archimate") {
			await showArchimate({
				xml: repositoryDocument.xml,
				documentId: repositoryDocument.id
			});
			return;
		}
		diagramPropertiesPanel.showBpmnProperties();
		await actions.onRepositoryDocumentSelected?.(repositoryDocument, component, repositorySelection);
		diagramBrowser?.render();
		let resolvedView = resolveSelectionView(component, repositorySelection);
		if (!resolvedView || resolvedView.status !== "resolved") return;
		resolvedView = resolveSingleContextualView(resolvedView);
		const diagramTarget = resolvedView.diagramTarget || null;
		const preferredElementId = resolvedView.graphicalTarget?.preferredElementId || null;
		if (diagramTarget) {
			await openBpmnDiagram(diagramTarget);
			selectBpmnElement(preferredElementId);
			return;
		}
		const contextualDiagramViews = Array.isArray(resolvedView.context?.diagramViews) ? resolvedView.context.diagramViews : [];
		if (contextualDiagramViews.length > 1) {
			openRepositoryViewDialog({
				views: contextualDiagramViews,
				title: "Choose BPMN View",
				onSelect: async (selectedView) => {
					await openBpmnDiagram({
						diagramId: selectedView.diagramId,
						preferredRootElementId: resolvedView.context?.collaborationBpmnId || null
					});
					selectBpmnElement(preferredElementId);
				}
			});
			return;
		}
		await openBpmnDiagram(diagramTarget);
		selectBpmnElement(preferredElementId);
	}
	repositoryBrowser = createRepositoryBrowser({
		store: repositoryDocumentStore,
		repositoryModel,
		projectionProfile,
		container: layout.repositoryBrowserContainer,
		onSelect: handleRepositorySelection,
		onContainerSelect: (repositoryContainer) => {
			console.info("Repository container selected:", repositoryContainer);
		}
	});
	diagramBrowser = createDiagramBrowser({
		container: layout.diagramBrowserContainer,
		getViewIndex: getBpmnViewIndex,
		onSelect: handleDiagramSelection
	});
	modeler.on("import.done", () => {
		layout.setCentralRepresentation?.(layout.CENTRAL_REPRESENTATION.BPMN);
		diagramBrowser.render();
	});
	const repositoryMembershipMenu = createRepositoryMembershipMenu({
		sidebar: repositoryBrowser.sidebar,
		repositoryModel,
		onAssignProcessToContainer({ containerId, processId }) {
			repositoryMembershipActions.assignProcessToContainer(containerId, processId);
			repositoryBrowser.render();
		},
		onUnassignProcessFromContainer({ containerId, processId }) {
			repositoryMembershipActions.unassignProcessFromContainer(containerId, processId);
			repositoryBrowser.render();
		}
	});
	const repositoryEditorSync = isViewerMode(appMode) ? null : createRepositoryEditorSync({
		modeler,
		repositoryDocumentStore,
		repositoryModel,
		repositoryBrowser
	});
	const renderLintResults = createLintRenderer(modeler);
	const lintResultStore = createLintResultStore({ onResult: renderLintResults });
	const linter = new SemArchLinter(modeler, (issues) => {
		lintResultStore.set("semarch", issues);
	});
	const bpmnlintPanelBridge = createBpmnlintPanelBridge({
		modeler,
		onResult: (issues) => {
			lintResultStore.set("bpmnlint", issues);
		}
	});
	function resizeBpmnCanvas() {
		setTimeout(() => {
			try {
				modeler.get("canvas").resized();
			} catch {}
		}, 50);
	}
	layout.on("resize", () => {
		try {
			layout.bpmnLayout.resize();
		} catch {}
		resizeBpmnCanvas();
	});
	layout.bpmnLayout.on("resize", () => {
		resizeBpmnCanvas();
	});
	return {
		layout,
		bpmnLayout: layout.bpmnLayout,
		modeler,
		linter,
		lintResultStore,
		bpmnlintPanelBridge,
		readOnlyPropertiesPanel,
		diagramPropertiesPanel,
		visualPropertiesPanel,
		repositoryDocumentStore,
		repositoryModel,
		businessObjectStore,
		businessObjectRepresentationStore,
		businessObjectRepresentationActions,
		repositoryBrowser,
		diagramBrowser,
		repositoryMembershipActions,
		repositoryMembershipMenu,
		repositoryEditorSync,
		extractUiTree,
		extractRepositoryGraph,
		extractBpmnModel,
		extractBpmnViews,
		showArchimate,
		cocConfiguration: normalizedCocConfiguration,
		mode: appMode
	};
}
//#endregion
export { createApp };
