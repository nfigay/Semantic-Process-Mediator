import { normalizeCocConfiguration } from "./coc-configuration.js";
//#region src/configuration/avionics-coc-configuration.js
var avionicsCocConfiguration = normalizeCocConfiguration({
	id: "CoC_Avionics",
	label: "CoC Avionics",
	profileRef: "avionics",
	publicationRef: null,
	defaultMaturity: "L2"
});
//#endregion
export { avionicsCocConfiguration };
