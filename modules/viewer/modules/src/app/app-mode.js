//#region src/app/app-mode.js
var APP_MODES = {
	VIEWER: "viewer",
	EDITOR: "editor"
};
function normalizeAppMode(mode) {
	if (mode === APP_MODES.VIEWER) return APP_MODES.VIEWER;
	return APP_MODES.EDITOR;
}
function isViewerMode(mode) {
	return normalizeAppMode(mode) === APP_MODES.VIEWER;
}
//#endregion
export { APP_MODES, isViewerMode, normalizeAppMode };
