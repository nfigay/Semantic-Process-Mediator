import { w2popup } from "../../../node_modules/w2ui/w2ui-2.0.es6.min.js";
//#region src/ui/dialogs/sparx-ea-import-dialog.js
var state = null;
function openSparxEaImportDialog({ onSelectXmi } = {}) {
	state = { onSelectXmi };
	w2popup.open({
		title: "Import from Sparx Enterprise Architect",
		width: 640,
		height: 300,
		body: `<div style="padding:18px;font-size:13px">
      <p>Select an Enterprise Architect XMI file. BPMNSM converts it to BPMN 2.0 in your browser and validates it before adding it to the active Repository.</p>
      <button type="button" class="w2ui-btn" id="btn-select-sparx-ea-xmi">Select EA XMI…</button>
      <span id="sparx-ea-xmi-selection" style="margin-left:10px">No file selected</span>
      <p id="sparx-ea-import-status" role="status" aria-live="polite"></p>
    </div>`,
		buttons: "<button type=\"button\" class=\"w2ui-btn\" id=\"btn-cancel-sparx-ea\">Close</button>",
		onOpen(event) {
			event.done(() => {
				document.getElementById("btn-select-sparx-ea-xmi")?.addEventListener("click", () => state?.onSelectXmi?.());
				document.getElementById("btn-cancel-sparx-ea")?.addEventListener("click", () => w2popup.close());
			});
		}
	});
}
function setSparxEaXmiSelection(file) {
	const label = document.getElementById("sparx-ea-xmi-selection");
	if (label) label.textContent = file?.name || "No file selected";
}
function setSparxEaImportStatus(message) {
	const label = document.getElementById("sparx-ea-import-status");
	if (label) label.textContent = message;
}
//#endregion
export { openSparxEaImportDialog, setSparxEaImportStatus, setSparxEaXmiSelection };

//# sourceMappingURL=sparx-ea-import-dialog.js.map