import { w2layout } from "../../node_modules/w2ui/w2ui-2.0.es6.min.js";
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
        <div
          id="navigation-panel"
          style="
            width:100%;
            height:100%;

            display:flex;
            flex-direction:column;

            overflow:hidden;
          "
        >

          <div
            id="navigation-tabs"
            style="
              flex:0 0 34px;

              display:flex;

              border-bottom:1px solid #D4DCE6;

              background:#E9EDF2;
            "
          >

            <button
              id="navigation-repository"
              type="button"
              style="
                flex:1;

                border:0;
                border-right:1px solid #D4DCE6;

                background:#FFFFFF;

                cursor:pointer;
              "
            >
              Environment
            </button>


            <button
              id="navigation-diagrams"
              type="button"
              style="
                flex:1;

                border:0;

                background:#E9EDF2;

                cursor:pointer;
              "
            >
              Diagrams
            </button>

          </div>


          <div
            id="navigation-content"
            style="
              flex:1 1 auto;
              min-height:0;

              position:relative;

              overflow:hidden;
            "
          >

            <div
              id="repository-browser"
              style="
                width:100%;
                height:100%;

                overflow:hidden;
              "
            ></div>


            <div
              id="diagram-browser"
              style="
                display:none;

                width:100%;
                height:100%;

                overflow:hidden;
              "
            ></div>

          </div>

        </div>
      `;
	const leftPanel = layout.el("left");
	layout.repositoryBrowserContainer = leftPanel.querySelector("#repository-browser");
	layout.diagramBrowserContainer = leftPanel.querySelector("#diagram-browser");
	const repositoryButton = leftPanel.querySelector("#navigation-repository");
	const diagramsButton = leftPanel.querySelector("#navigation-diagrams");
	const navigationListeners = /* @__PURE__ */ new Set();
	layout.navigation = "repository";
	layout.onNavigationChange = (listener) => {
		navigationListeners.add(listener);
		return () => navigationListeners.delete(listener);
	};
	function showNavigation(navigation) {
		layout.navigation = navigation;
		const showRepository = navigation === "repository";
		layout.repositoryBrowserContainer.style.display = showRepository ? "block" : "none";
		layout.diagramBrowserContainer.style.display = showRepository ? "none" : "block";
		repositoryButton.style.background = showRepository ? "#FFFFFF" : "#E9EDF2";
		diagramsButton.style.background = showRepository ? "#E9EDF2" : "#FFFFFF";
		navigationListeners.forEach((listener) => listener(navigation));
	}
	repositoryButton.addEventListener("click", () => {
		showNavigation("repository");
	});
	diagramsButton.addEventListener("click", () => {
		showNavigation("diagrams");
	});
	layout.showNavigation = showNavigation;
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
