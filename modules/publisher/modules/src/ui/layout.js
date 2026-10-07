import { w2layout, w2tabs } from "../../node_modules/w2ui/w2ui-2.0.es6.min.js";
import { createCentralViewHost } from "./central-view-host.js";
import { createWelcomeView } from "./views/welcome-view.js";
//#region src/ui/layout.js
function createLayout({ toolbar, mode = "editor" } = {}) {
	const isViewer = mode === "viewer";
	const layout = new w2layout({
		box: "#app",
		name: "main-layout",
		panels: [
			{
				type: "top",
				size: 40,
				resizable: false,
				style: "background:#1E3A5F;color:#fff;",
				toolbar
			},
			{
				type: "left",
				size: 260,
				minSize: 180,
				resizable: true,
				style: "background:#F4F6F9;border-right:1px solid #D4DCE6;overflow:hidden;padding:0;"
			},
			{
				type: "main",
				style: "background:#fff;overflow:hidden;"
			},
			{
				type: "right",
				size: 320,
				minSize: 220,
				resizable: true,
				hidden: true,
				style: "background:#F9FAFB;border-left:1px solid #D4DCE6;overflow:hidden;"
			},
			{
				type: "bottom",
				size: 130,
				minSize: 70,
				resizable: true,
				style: "background:#F4F6F9;border-top:1px solid #D4DCE6;overflow:hidden;"
			}
		]
	});
	layout.el("left").innerHTML = `
    <div id="workspace-navigation-layout" style="width:100%;height:100%;overflow:hidden;"></div>
  `;
	const workspaceNavigationLayout = new w2layout({
		box: "#workspace-navigation-layout",
		name: "workspace-navigation-layout",
		padding: 1,
		panels: [{
			type: "top",
			size: "58%",
			minSize: 170,
			resizable: true,
			style: "background:#F4F6F9;overflow:hidden;padding:0;"
		}, {
			type: "main",
			minSize: 170,
			style: "background:#F4F6F9;overflow:hidden;padding:0;"
		}]
	});
	workspaceNavigationLayout.el("top").innerHTML = `
    <div style="width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;">
      <div id="repositories-navigation-tabs" style="flex:0 0 34px;"></div>
      <div id="repositories-search" style="flex:0 0 auto;"></div>
      <div style="flex:1 1 auto;min-height:0;position:relative;overflow:hidden;">
        <div id="contexts-browser" style="position:absolute;inset:0;overflow:hidden;"></div>
        <div id="repository-diagram-browser" style="display:none;position:absolute;inset:0;overflow:hidden;"></div>
      </div>
    </div>
  `;
	workspaceNavigationLayout.el("main").innerHTML = `
    <div style="width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;">
      <div id="models-navigation-tabs" style="flex:0 0 34px;"></div>
      <div id="models-search" style="flex:0 0 auto;"></div>
      <div style="flex:1 1 auto;min-height:0;position:relative;overflow:hidden;">
        <div id="repository-browser" style="position:absolute;inset:0;overflow:hidden;"></div>
        <div id="model-diagram-browser" style="display:none;position:absolute;inset:0;overflow:hidden;"></div>
      </div>
    </div>
  `;
	layout.workspaceNavigationLayout = workspaceNavigationLayout;
	layout.contextsTreeSearchContainer = workspaceNavigationLayout.el("top").querySelector("#repositories-search");
	layout.repositoriesTreeSearchContainer = layout.contextsTreeSearchContainer;
	layout.contextsBrowserContainer = workspaceNavigationLayout.el("top").querySelector("#contexts-browser");
	layout.repositoryDiagramBrowserContainer = workspaceNavigationLayout.el("top").querySelector("#repository-diagram-browser");
	layout.sourcesTreeSearchContainer = workspaceNavigationLayout.el("main").querySelector("#models-search");
	layout.workspaceTreeSearchContainer = layout.sourcesTreeSearchContainer;
	layout.repositoryBrowserContainer = workspaceNavigationLayout.el("main").querySelector("#repository-browser");
	layout.modelDiagramBrowserContainer = workspaceNavigationLayout.el("main").querySelector("#model-diagram-browser");
	layout.diagramBrowserContainer = layout.modelDiagramBrowserContainer;
	let repositoryNavigationChangeHandler = null;
	let modelNavigationChangeHandler = null;
	function showRepositoryNavigation(navigation) {
		const diagrams = navigation === "diagrams";
		layout.contextsBrowserContainer.style.display = diagrams ? "none" : "block";
		layout.repositoryDiagramBrowserContainer.style.display = diagrams ? "block" : "none";
		if (layout.repositoryNavigationTabs?.active !== navigation) layout.repositoryNavigationTabs?.select(navigation);
		repositoryNavigationChangeHandler?.(navigation);
	}
	function showModelNavigation(navigation) {
		const diagrams = navigation === "diagrams";
		layout.repositoryBrowserContainer.style.display = diagrams ? "none" : "block";
		layout.modelDiagramBrowserContainer.style.display = diagrams ? "block" : "none";
		if (layout.modelNavigationTabs?.active !== navigation) layout.modelNavigationTabs?.select(navigation);
		modelNavigationChangeHandler?.(navigation);
	}
	layout.repositoryNavigationTabs = new w2tabs({
		name: "repositories-navigation-tabs",
		active: "contexts",
		tabs: [{
			id: "contexts",
			text: "Repositories / Contexts"
		}, {
			id: "diagrams",
			text: "Diagrams"
		}],
		onClick(event) {
			showRepositoryNavigation(event.target);
		}
	});
	layout.repositoryNavigationTabs.render(workspaceNavigationLayout.el("top").querySelector("#repositories-navigation-tabs"));
	layout.modelNavigationTabs = new w2tabs({
		name: "models-navigation-tabs",
		active: "models",
		tabs: [
			{
				id: "models",
				text: "Models"
			},
			{
				id: "sources",
				text: "Sources"
			},
			{
				id: "diagrams",
				text: "Diagrams"
			}
		],
		onClick(event) {
			showModelNavigation(event.target);
		}
	});
	layout.modelNavigationTabs.render(workspaceNavigationLayout.el("main").querySelector("#models-navigation-tabs"));
	layout.showRepositoryNavigation = showRepositoryNavigation;
	layout.showModelNavigation = showModelNavigation;
	layout.onRepositoryNavigationChange = (handler) => {
		repositoryNavigationChangeHandler = typeof handler === "function" ? handler : null;
	};
	layout.onModelNavigationChange = (handler) => {
		modelNavigationChangeHandler = typeof handler === "function" ? handler : null;
	};
	layout.showNavigation = (navigation) => {
		if (navigation === "environment") return showRepositoryNavigation("contexts");
		if (navigation === "sources") return showModelNavigation("sources");
		if (navigation === "models") return showModelNavigation("models");
		if (navigation === "diagrams") return showModelNavigation("diagrams");
	};
	layout.onNavigationChange = (handler) => layout.onModelNavigationChange(handler);
	layout.setSourcesTabVisible = (visible) => {
		const show = visible !== false;
		if (show) layout.modelNavigationTabs?.show("sources");
		else layout.modelNavigationTabs?.hide("sources");
		return show;
	};
	showRepositoryNavigation("contexts");
	showModelNavigation("models");
	layout.el("main").innerHTML = `
        <div
          id="bpmn-layout"
          style="
            width:100%;
            height:100%;

            overflow:hidden;
          "
        ></div>
      `;
	const bpmnLayout = new w2layout({
		box: "#bpmn-layout",
		name: "bpmn-layout",
		padding: 0,
		panels: [{
			type: "left",
			size: 52,
			minSize: 52,
			resizable: false,
			hidden: true,
			style: "background:#F4F6F9;border-right:1px solid #D4DCE6;overflow:hidden;padding:0;"
		}, {
			type: "main",
			style: "background:#fff;overflow:hidden;"
		}]
	});
	bpmnLayout.el("main").innerHTML = `
        <div
          id="bpmn-workspace"
          style="
            position:absolute;
            inset:0;

            overflow:hidden;

            background:#FFFFFF;
          "
        >

          <div
            id="bpmn-canvas"
            style="
              position:absolute;
              inset:0;

              overflow:hidden;

              background:#FFFFFF;
            "
          ></div>


          <div
            id="central-view-host"
            style="
              position:absolute;
              inset:0;

              z-index:100;

              overflow:auto;

              background:#FFFFFF;
            "
          ></div>

        </div>
      `;
	if (!isViewer) bpmnLayout.el("left").innerHTML = `
          <div
            id="bpmn-palette"
            style="
              width:100%;
              height:100%;

              overflow:hidden;
            "
          ></div>
        `;
	layout.bpmnLayout = bpmnLayout;
	const centralViewContainer = bpmnLayout.el("main").querySelector("#central-view-host");
	const centralViewHost = createCentralViewHost({ container: centralViewContainer });
	const welcomeView = createWelcomeView({
		mode,
		onNewProcess() {
			toolbar?.invoke?.("new-process");
		},
		onOpenRepository() {
			toolbar?.invoke?.("open-repository");
		},
		onImportBpmn() {
			toolbar?.invoke?.("import-environment");
		}
	});
	layout.centralViewHost = centralViewHost;
	layout.welcomeView = welcomeView;
	function setToolbarModelState(active) {
		const toolbarInstance = layout.get("top")?.toolbar;
		if (!toolbarInstance) return;
		for (const itemId of toolbar?.modelCommandIds || []) if (active) toolbarInstance.enable(itemId);
		else toolbarInstance.disable(itemId);
	}
	const CENTRAL_REPRESENTATION = {
		WELCOME: "welcome",
		BPMN: "bpmn",
		ARCHIMATE: "archimate"
	};
	let centralRepresentation = CENTRAL_REPRESENTATION.WELCOME;
	function showCentralViewContainer() {
		if (!centralViewContainer) return;
		centralViewContainer.style.display = "block";
	}
	function hideCentralViewContainer() {
		if (!centralViewContainer) return;
		centralViewContainer.style.display = "none";
	}
	async function showWelcome() {
		showCentralViewContainer();
		if (!centralViewHost.isActive(welcomeView.id)) await centralViewHost.show(welcomeView);
	}
	async function showHostedView(view) {
		if (!view || !view.id) throw new Error("Central representation requires a view with an id");
		showCentralViewContainer();
		if (!centralViewHost.isActive(view.id)) await centralViewHost.show(view);
	}
	function updateCentralRepresentationChrome(representation) {
		const bpmnActive = representation === CENTRAL_REPRESENTATION.BPMN;
		if (bpmnActive) {
			layout.show("right", true);
			if (!isViewer) bpmnLayout.show("left", true);
		} else {
			layout.hide("right", true);
			if (!isViewer) bpmnLayout.hide("left", true);
		}
		setToolbarModelState(bpmnActive);
	}
	function resizeCentralWorkspace() {
		window.setTimeout(() => {
			try {
				layout.resize();
			} catch {}
			try {
				bpmnLayout.resize();
			} catch {}
			try {
				window.semarchApp?.modeler?.get("canvas")?.resized?.();
			} catch {}
		}, 0);
	}
	async function setCentralRepresentation(representation, { view = null } = {}) {
		if (!Object.values(CENTRAL_REPRESENTATION).includes(representation)) throw new Error(`Unsupported central representation: ${representation}`);
		switch (representation) {
			case CENTRAL_REPRESENTATION.WELCOME:
				await showWelcome();
				break;
			case CENTRAL_REPRESENTATION.BPMN:
				hideCentralViewContainer();
				break;
			case CENTRAL_REPRESENTATION.ARCHIMATE: await showHostedView(view);
		}
		centralRepresentation = representation;
		updateCentralRepresentationChrome(centralRepresentation);
		resizeCentralWorkspace();
		return centralRepresentation;
	}
	function getCentralRepresentation() {
		return centralRepresentation;
	}
	function setModelActive(active) {
		return setCentralRepresentation(active ? CENTRAL_REPRESENTATION.BPMN : CENTRAL_REPRESENTATION.WELCOME);
	}
	function hasActiveModel() {
		return centralRepresentation !== CENTRAL_REPRESENTATION.WELCOME;
	}
	layout.CENTRAL_REPRESENTATION = CENTRAL_REPRESENTATION;
	layout.setCentralRepresentation = setCentralRepresentation;
	layout.getCentralRepresentation = getCentralRepresentation;
	layout.setModelActive = setModelActive;
	layout.hasActiveModel = hasActiveModel;
	setToolbarModelState(false);
	setCentralRepresentation(CENTRAL_REPRESENTATION.WELCOME);
	return layout;
}
//#endregion
export { createLayout };

//# sourceMappingURL=layout.js.map