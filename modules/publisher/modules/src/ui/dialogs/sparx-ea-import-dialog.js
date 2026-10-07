import { w2popup } from "../../../node_modules/w2ui/w2ui-2.0.es6.min.js";
//#region src/ui/dialogs/sparx-ea-import-dialog.js
var state = null;
function openSparxEaImportDialog({ onSelectBpmn, onSelectXmi, onApplyNativeNotePolicy } = {}) {
	state = {
		onSelectBpmn,
		onSelectXmi,
		onApplyNativeNotePolicy,
		bpmnFile: null,
		xmiFile: null,
		nativeNotePolicy: {}
	};
	w2popup.open({
		title: "Import from Sparx Enterprise Architect",
		width: 720,
		height: 620,
		body: `
      <div style="padding:18px;font-family:'DM Sans',sans-serif;font-size:13px;">
        <div style="margin-bottom:18px;color:#4A6580;">
          Select the native BPMN 2.0 export and its supporting Sparx EA XMI export.
          BPMNSM preprocesses the EA sources before adding normalized BPMN to the active Repository.
        </div>
        <div style="margin-bottom:20px;">
          <div style="font-weight:600;margin-bottom:7px;">1. Native BPMN export</div>
          <button type="button" class="w2ui-btn" id="btn-select-sparx-ea-bpmn">Select BPMN…</button>
          <span id="sparx-ea-bpmn-selection" style="margin-left:10px;color:#4A6580;">No file selected</span>
        </div>
        <div>
          <div style="font-weight:600;margin-bottom:7px;">2. Supporting XMI export</div>
          <button type="button" class="w2ui-btn" id="btn-select-sparx-ea-xmi" disabled>Select XMI…</button>
          <span id="sparx-ea-xmi-selection" style="margin-left:10px;color:#4A6580;">Select BPMN first</span>
        </div>
        <div id="sparx-ea-preprocessing-report" style="display:none;border-top:1px solid #d8dee6;padding-top:16px;margin-top:20px;">
          <div style="font-weight:600;font-size:14px;margin-bottom:10px;">EA preprocessing report</div>
          <div id="sparx-ea-preprocessing-summary" style="margin-bottom:12px;color:#4A6580;"></div>
          <details open><summary>Repairs</summary><pre id="sparx-ea-report-repairs"></pre></details>
          <details><summary>Unresolved issues</summary><pre id="sparx-ea-report-unresolved"></pre></details>
          <details><summary>Warnings</summary><pre id="sparx-ea-report-warnings"></pre></details>
          <details open><summary>Publication policy required</summary><pre id="sparx-ea-report-policy"></pre><div id="sparx-ea-native-note-policy"></div></details>
          <details><summary>Provenance</summary><pre id="sparx-ea-report-provenance"></pre></details>
        </div>
      </div>`,
		buttons: "<button type=\"button\" class=\"w2ui-btn\" id=\"btn-cancel-sparx-ea\">Cancel</button>",
		onOpen(event) {
			event.done(() => {
				document.getElementById("btn-select-sparx-ea-bpmn")?.addEventListener("click", () => state?.onSelectBpmn?.());
				document.getElementById("btn-select-sparx-ea-xmi")?.addEventListener("click", () => state?.onSelectXmi?.());
				document.getElementById("btn-cancel-sparx-ea")?.addEventListener("click", () => w2popup.close());
			});
		}
	});
}
function setSparxEaBpmnSelection(file) {
	if (!state) return;
	state.bpmnFile = file || null;
	const label = document.getElementById("sparx-ea-bpmn-selection");
	const xmiButton = document.getElementById("btn-select-sparx-ea-xmi");
	const xmiLabel = document.getElementById("sparx-ea-xmi-selection");
	if (label) label.textContent = file?.name || "No file selected";
	if (xmiButton) xmiButton.disabled = !file;
	if (xmiLabel && !state.xmiFile) xmiLabel.textContent = file ? "Ready to select XMI" : "Select BPMN first";
}
function setSparxEaXmiSelection(file) {
	if (!state) return;
	state.xmiFile = file || null;
	const label = document.getElementById("sparx-ea-xmi-selection");
	if (label) label.textContent = file?.name || "No file selected";
}
function setSparxEaPreprocessingReport(prepared) {
	const report = document.getElementById("sparx-ea-preprocessing-report");
	if (!report) return;
	const repairs = prepared?.repairs ?? [];
	const unresolvedIssues = prepared?.unresolvedIssues ?? [];
	const warnings = prepared?.warnings ?? [];
	const policy = prepared?.publicationPolicyRequired ?? null;
	const provenance = prepared?.provenance ?? null;
	const summary = document.getElementById("sparx-ea-preprocessing-summary");
	if (summary) summary.textContent = `Import completed — ${repairs.length} repair(s), ${unresolvedIssues.length} unresolved issue(s), ${warnings.length} warning(s).`;
	const values = [
		["sparx-ea-report-repairs", repairs],
		["sparx-ea-report-unresolved", unresolvedIssues],
		["sparx-ea-report-warnings", warnings],
		["sparx-ea-report-policy", policy],
		["sparx-ea-report-provenance", provenance]
	];
	for (const [id, value] of values) {
		const element = document.getElementById(id);
		if (element) element.textContent = JSON.stringify(value, null, 2);
	}
	const policyHost = document.getElementById("sparx-ea-native-note-policy");
	const nativeNotes = policy?.nativeNotes ?? [];
	if (policyHost) {
		policyHost.replaceChildren();
		for (const note of nativeNotes) {
			const row = document.createElement("div");
			row.style.margin = "10px 0";
			const label = document.createElement("div");
			label.textContent = note.text || note.id;
			label.style.marginBottom = "6px";
			row.appendChild(label);
			for (const [decision, caption] of [["convert", "Convert to BPMN TextAnnotation"], ["exclude", "Exclude from published BPMN"]]) {
				const button = document.createElement("button");
				button.type = "button";
				button.className = "w2ui-btn";
				button.textContent = caption;
				button.style.marginRight = "6px";
				button.addEventListener("click", () => {
					if (!state) return;
					state.nativeNotePolicy[note.id] = decision;
					if (nativeNotes.every((candidate) => state.nativeNotePolicy[candidate.id])) state.onApplyNativeNotePolicy?.({ ...state.nativeNotePolicy });
				});
				row.appendChild(button);
			}
			policyHost.appendChild(row);
		}
	}
	report.style.display = "block";
}
//#endregion
export { openSparxEaImportDialog, setSparxEaBpmnSelection, setSparxEaPreprocessingReport, setSparxEaXmiSelection };

//# sourceMappingURL=sparx-ea-import-dialog.js.map