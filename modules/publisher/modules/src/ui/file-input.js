//#region src/ui/file-input.js
function createFileInput({ id = "file-input", accept = ".bpmn, .xml", onLoad } = {}) {
	let loadHandler = onLoad;
	let input = document.getElementById(id);
	if (!input) {
		input = document.createElement("input");
		input.type = "file";
		input.id = id;
		input.accept = accept;
		input.style.display = "none";
		document.body.appendChild(input);
	}
	input.addEventListener("change", () => {
		const file = input.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = async (event) => {
			try {
				await loadHandler?.(event.target.result, file);
			} catch (error) {
				try {
					console.error("[File Load Failed]", error);
				} catch {}
			}
		};
		reader.readAsText(file);
		input.value = "";
	});
	return {
		open() {
			input.click();
		},
		setOnLoad(handler) {
			loadHandler = handler;
		},
		element: input
	};
}
//#endregion
export { createFileInput };

//# sourceMappingURL=file-input.js.map