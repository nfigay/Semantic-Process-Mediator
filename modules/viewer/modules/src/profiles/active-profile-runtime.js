//#region src/profiles/active-profile-runtime.js
function createActiveProfileRuntime(initialProfileRuntime = null) {
	let profileRuntime = initialProfileRuntime || null;
	function get() {
		return profileRuntime;
	}
	function set(nextProfileRuntime) {
		profileRuntime = nextProfileRuntime || null;
		return profileRuntime;
	}
	return {
		get,
		set
	};
}
//#endregion
export { createActiveProfileRuntime };
