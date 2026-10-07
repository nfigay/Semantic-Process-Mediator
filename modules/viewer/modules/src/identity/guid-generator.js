//#region src/identity/guid-generator.js
var UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function createGuid() {
	if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") return globalThis.crypto.randomUUID().toLowerCase();
	if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === "function") {
		const bytes = /* @__PURE__ */ new Uint8Array(16);
		globalThis.crypto.getRandomValues(bytes);
		bytes[6] = bytes[6] & 15 | 64;
		bytes[8] = bytes[8] & 63 | 128;
		const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0"));
		return [
			hex.slice(0, 4).join(""),
			hex.slice(4, 6).join(""),
			hex.slice(6, 8).join(""),
			hex.slice(8, 10).join(""),
			hex.slice(10, 16).join("")
		].join("-");
	}
	throw new Error("Secure GUID generation is not available in this environment.");
}
function isGuid(value) {
	return typeof value === "string" && UUID_PATTERN.test(value);
}
function normalizeGuid(value) {
	if (typeof value !== "string") return null;
	const normalized = value.trim().replace(/^\{/, "").replace(/\}$/, "").toLowerCase();
	if (!isGuid(normalized)) return null;
	return normalized;
}
//#endregion
export { createGuid, isGuid, normalizeGuid };
