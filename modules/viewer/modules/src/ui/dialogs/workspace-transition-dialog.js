import { w2popup } from "../../../git/Semantic-Process-Mediator/node_modules/w2ui/w2ui-2.0.es6.min.js";
//#region src/ui/dialogs/workspace-transition-dialog.js
/** No save receipt is available from a browser ZIP download. */
function chooseWorkspaceReplacement({ reason = "WORKSPACE_STATE_UNKNOWN" } = {}) {
	return new Promise((resolve) => {
		let settled = false;
		const finish = (choice) => {
			if (settled) return;
			settled = true;
			resolve(choice);
			w2popup.close();
		};
		w2popup.open({
			title: "Change Workspace",
			width: 550,
			height: 280,
			body: `<div style="padding:18px;font-size:14px">
        <p>The current Workspace or canvas could contain unsaved changes.</p>
        <p>Reason: <code id="bpmnsm-transition-reason"></code></p>
        <p>Saving a ZIP download cannot currently be verified. Choose Don't Save only if you accept losing unsaved changes.</p>
      </div>`,
			buttons: `<button class="w2ui-btn" id="bpmnsm-transition-save" type="button" disabled title="A verified save is not available">Save (unavailable)</button>
        <button class="w2ui-btn" id="bpmnsm-transition-discard" type="button">Don't Save</button>
        <button class="w2ui-btn" id="bpmnsm-transition-cancel" type="button">Cancel</button>`,
			onOpen(event) {
				event.done(() => {
					const reasonElement = document.getElementById("bpmnsm-transition-reason");
					if (reasonElement) reasonElement.textContent = reason;
					document.getElementById("bpmnsm-transition-discard")?.addEventListener("click", () => finish("discard"));
					document.getElementById("bpmnsm-transition-cancel")?.addEventListener("click", () => finish("cancel"));
				});
			},
			onClose() {
				if (!settled) {
					settled = true;
					resolve("cancel");
				}
			}
		});
	});
}
//#endregion
export { chooseWorkspaceReplacement };

//# sourceMappingURL=workspace-transition-dialog.js.map