import { resolveCocConfiguration } from "../configuration/coc-configuration-resolver.js";
//#region src/profiles/coc-profile-runtime-activation.js
async function activateCocProfileRuntime({ cocId, cocConfigurations = [], resolveProfileRuntime, activeProfileRuntime } = {}) {
	const cocConfiguration = resolveCocConfiguration({
		cocConfigurations,
		cocId
	});
	if (!cocConfiguration || !cocConfiguration.profileRef) return null;
	if (typeof resolveProfileRuntime !== "function") throw new Error("CoC profile runtime activation requires resolveProfileRuntime");
	if (!activeProfileRuntime || typeof activeProfileRuntime.set !== "function") throw new Error("CoC profile runtime activation requires activeProfileRuntime");
	const profileRuntime = await resolveProfileRuntime({ profileRef: cocConfiguration.profileRef });
	activeProfileRuntime.set(profileRuntime);
	return {
		cocConfiguration,
		profileRuntime
	};
}
//#endregion
export { activateCocProfileRuntime };

//# sourceMappingURL=coc-profile-runtime-activation.js.map