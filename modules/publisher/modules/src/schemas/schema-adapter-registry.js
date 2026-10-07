//#region src/schemas/schema-adapter-registry.js
function createSchemaAdapterRegistry({ adapters = [] } = {}) {
	const registeredAdapters = [];
	function register(adapter) {
		if (!adapter || typeof adapter.getTechnology !== "function") throw new Error("Schema adapter must implement getTechnology()");
		if (typeof adapter.getSpecification !== "function") throw new Error("Schema adapter must implement getSpecification()");
		if (typeof adapter.read !== "function") throw new Error("Schema adapter must implement read()");
		const technology = adapter.getTechnology();
		const specification = adapter.getSpecification();
		if (!technology) throw new Error("Schema adapter technology must not be empty");
		if (registeredAdapters.find((candidate) => sameText(candidate.getTechnology(), technology) && sameText(candidate.getSpecification(), specification))) throw new Error(`Schema adapter already registered: ${technology} ${specification}`);
		registeredAdapters.push(adapter);
		return adapter;
	}
	function find({ technology, specification = null } = {}) {
		if (!technology) return null;
		if (specification) {
			const exact = registeredAdapters.find((adapter) => sameText(adapter.getTechnology(), technology) && sameText(adapter.getSpecification(), specification));
			if (exact) return exact;
		}
		const technologyMatches = registeredAdapters.filter((adapter) => sameText(adapter.getTechnology(), technology));
		if (technologyMatches.length === 1) return technologyMatches[0];
		return null;
	}
	function requireAdapter(declaration) {
		const adapter = find(declaration);
		if (adapter) return adapter;
		const technology = declaration?.technology || "unknown";
		const specification = declaration?.specification ? ` ${declaration.specification}` : "";
		throw new Error(`No schema adapter registered for ${technology}${specification}`);
	}
	function getAdapters() {
		return [...registeredAdapters];
	}
	for (const adapter of adapters) register(adapter);
	return {
		register,
		find,
		requireAdapter,
		getAdapters
	};
}
function sameText(left, right) {
	return String(left || "").toLowerCase() === String(right || "").toLowerCase();
}
//#endregion
export { createSchemaAdapterRegistry };

//# sourceMappingURL=schema-adapter-registry.js.map