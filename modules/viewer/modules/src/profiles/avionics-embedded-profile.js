import { createEmbeddedProfileRuntime } from "./embedded-profile-runtime.js";
import { XsdSchemaAdapter } from "../schemas/xsd-schema-adapter.js";
import avionics_profile_default from "../tests/profiles/avionics-profile.js";
import coc_avionics_test_default from "../tests/schemas/coc-avionics-test.js";
//#region src/profiles/avionics-embedded-profile.js
var embeddedSources = { ["../schemas/coc-avionics-test.xsd"]: coc_avionics_test_default };
async function createAvionicsProfileRuntime() {
	return createEmbeddedProfileRuntime({
		profileSource: avionics_profile_default,
		sources: embeddedSources,
		adapters: [new XsdSchemaAdapter()]
	});
}
//#endregion
export { createAvionicsProfileRuntime };

//# sourceMappingURL=avionics-embedded-profile.js.map