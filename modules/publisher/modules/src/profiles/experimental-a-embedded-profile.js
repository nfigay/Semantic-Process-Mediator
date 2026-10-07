import { createEmbeddedProfileRuntime } from "./embedded-profile-runtime.js";
import { XsdSchemaAdapter } from "../schemas/xsd-schema-adapter.js";
import experimental_a_profile_default from "../tests/profiles/experimental-a-profile.js";
import coc_experimental_a_test_default from "../tests/schemas/coc-experimental-a-test.js";
//#region src/profiles/experimental-a-embedded-profile.js
var embeddedSources = { ["../schemas/coc-experimental-a-test.xsd"]: coc_experimental_a_test_default };
async function createExperimentalAProfileRuntime() {
	return createEmbeddedProfileRuntime({
		profileSource: experimental_a_profile_default,
		sources: embeddedSources,
		adapters: [new XsdSchemaAdapter()]
	});
}
//#endregion
export { createExperimentalAProfileRuntime };

//# sourceMappingURL=experimental-a-embedded-profile.js.map