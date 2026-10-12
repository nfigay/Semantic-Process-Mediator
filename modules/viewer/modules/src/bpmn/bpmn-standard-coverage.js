//#region src/bpmn/bpmn-standard-coverage.js
/** Pure metadata helpers. Never infer a native editor from an arbitrary ID suffix. */
function nativePropertyIndex(groups) {
	const names = /* @__PURE__ */ new Set();
	for (const group of groups || []) for (const entry of group.entries || []) {
		if (typeof entry.semanticProperty === "string" && entry.semanticProperty) names.add(entry.semanticProperty);
		const id = String(entry.id || "");
		const exact = /^(?:[A-Za-z0-9_-]+-)?(id|name|documentation|isExecutable|asyncBefore|asyncAfter)$/.exec(id);
		if (exact) names.add(exact[1]);
	}
	return names;
}
function enumOptions(moddle, type) {
	try {
		return ((moddle.getType(type)?.$descriptor)?.literals || []).map((x) => typeof x === "string" ? x : x?.name).filter(Boolean);
	} catch {
		return [];
	}
}
function propertyCoverage(moddle, type, groups, collect) {
	const native = nativePropertyIndex(groups);
	return collect(moddle, type).map(({ property, kind }) => {
		const options = kind === "Enum" ? enumOptions(moddle, property.type) : [];
		return {
			property,
			kind,
			options,
			status: native.has(property.name) ? "NATIVE" : kind === "Enum" && !options.length ? "UNSUPPORTED_ENUM" : "GENERATED"
		};
	});
}
//#endregion
export { enumOptions, nativePropertyIndex, propertyCoverage };

//# sourceMappingURL=bpmn-standard-coverage.js.map