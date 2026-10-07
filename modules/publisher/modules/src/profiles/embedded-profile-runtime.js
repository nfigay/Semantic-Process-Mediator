import { loadProfile } from "./profile-loader.js";
import { createProfileRuntime } from "./profile-runtime.js";
import { createSchemaAdapterRegistry } from "../schemas/schema-adapter-registry.js";
import { loadProfileSchemas } from "../schemas/profile-schema-loader.js";
//#region src/profiles/embedded-profile-runtime.js
async function createEmbeddedProfileRuntime({ profileSource, sources = {}, adapters = [] } = {}) {
	if (profileSource === void 0 || profileSource === null) throw new Error("Embedded profile runtime requires profileSource");
	if (!sources || typeof sources !== "object" || Array.isArray(sources)) throw new Error("Embedded profile runtime requires sources to be an object");
	if (!Array.isArray(adapters)) throw new Error("Embedded profile runtime requires adapters to be an array");
	const profile = loadProfile(profileSource);
	const registry = createSchemaAdapterRegistry({ adapters });
	const loadedSchemas = await loadProfileSchemas({
		profile,
		registry,
		loadSource(source) {
			if (!Object.prototype.hasOwnProperty.call(sources, source)) throw new Error(`Embedded BPMNSM source not found: ${source}`);
			const value = sources[source];
			if (typeof value !== "string") throw new Error(`Embedded BPMNSM source must be a string: ${source}`);
			return value;
		}
	});
	return createProfileRuntime({
		profile,
		loadedSchemas
	});
}
//#endregion
export { createEmbeddedProfileRuntime };

//# sourceMappingURL=embedded-profile-runtime.js.map