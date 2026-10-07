//#region src/app/install-beforeunload-protection.js
function installBeforeUnloadProtection(target = window) {
	function handleBeforeUnload(event) {
		event.preventDefault();
		event.returnValue = "";
	}
	target.addEventListener("beforeunload", handleBeforeUnload);
	return { destroy() {
		target.removeEventListener("beforeunload", handleBeforeUnload);
	} };
}
//#endregion
export { installBeforeUnloadProtection };

//# sourceMappingURL=install-beforeunload-protection.js.map