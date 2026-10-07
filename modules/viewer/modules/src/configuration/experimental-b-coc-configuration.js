import { normalizeCocConfiguration } from "./coc-configuration.js";
//#region src/configuration/experimental-b-coc-configuration.js
var experimentalBCocConfiguration = normalizeCocConfiguration({
	id: "experimental-b",
	label: "Experimental B",
	profileRef: "experimental-b",
	publicationRef: null,
	defaultMaturity: "L2"
});
//#endregion
export { experimentalBCocConfiguration };
