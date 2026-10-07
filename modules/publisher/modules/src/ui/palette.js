//#region src/ui/palette.js
function extractPalette() {
	const palette = document.querySelector("#bpmn-canvas .djs-palette");
	if (!palette) return false;
	const container = document.getElementById("bpmn-palette");
	if (!container) return false;
	container.innerHTML = "";
	container.appendChild(palette);
	Object.assign(palette.style, {
		position: "relative",
		left: "0",
		top: "0",
		width: "100%",
		height: "100%",
		border: "none",
		borderRadius: "0",
		boxShadow: "none",
		background: "transparent"
	});
	return true;
}
//#endregion
export { extractPalette };
