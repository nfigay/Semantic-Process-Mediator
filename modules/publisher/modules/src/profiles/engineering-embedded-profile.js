import engineering_profile_default from "../tests/profiles/engineering-profile.js";
import coc_engineering_test_default from "../tests/schemas/coc-engineering-test.js";
import { createEmbeddedProfileRuntime } from "./embedded-profile-runtime.js";
import { XsdSchemaAdapter } from "../schemas/xsd-schema-adapter.js";
//#region src/profiles/engineering-embedded-profile.js
var embeddedSources = { ["../schemas/coc-engineering-test.xsd"]: coc_engineering_test_default };
async function createEngineeringProfileRuntime() {
	return createEmbeddedProfileRuntime({
		profileSource: engineering_profile_default,
		sources: embeddedSources,
		adapters: [new XsdSchemaAdapter()]
	});
}
//#endregion
export { createEngineeringProfileRuntime };

//# sourceMappingURL=engineering-embedded-profile.js.map