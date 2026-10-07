import { createEmbeddedProfileRuntime } from "./embedded-profile-runtime.js";
import { XsdSchemaAdapter } from "../schemas/xsd-schema-adapter.js";
import experimental_b_profile_default from "../tests/profiles/experimental-b-profile.js";
import coc_experimental_b_test_default from "../tests/schemas/coc-experimental-b-test.js";
//#region src/profiles/experimental-b-embedded-profile.js
var embeddedSources = { ["../schemas/coc-experimental-b-test.xsd"]: coc_experimental_b_test_default };
async function createExperimentalBProfileRuntime() {
	return createEmbeddedProfileRuntime({
		profileSource: experimental_b_profile_default,
		sources: embeddedSources,
		adapters: [new XsdSchemaAdapter()]
	});
}
//#endregion
export { createExperimentalBProfileRuntime };
