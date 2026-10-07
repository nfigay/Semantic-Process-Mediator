import { normalizePublicationConfiguration } from "./publication-configuration.js";
//#region src/configuration/engineering-publication-configuration.js
var engineeringPublicationConfiguration = normalizePublicationConfiguration({ capabilities: { utilities: false } });
//#endregion
export { engineeringPublicationConfiguration };
