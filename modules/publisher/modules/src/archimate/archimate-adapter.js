import Modeler from "../../node_modules/archimate-js/lib/Modeler.js";
/* empty css                                                  */
/* empty css                                                   */
/* empty css                                                        */
//#region src/archimate/archimate-adapter.js
var ArchimateAdapter = class {
	constructor(options = {}) {
		this.modeler = new Modeler(options);
	}
	async createNewModel() {
		return this.modeler.createNewModel();
	}
	async importXML(xml) {
		const result = await this.modeler.importXML(xml);
		await this.modeler.openView();
		return result;
	}
	async saveXML(options = {}) {
		return this.modeler.saveXML(options);
	}
	getCanvas() {
		return this.modeler.get("canvas");
	}
	getElementRegistry() {
		return this.modeler.get("elementRegistry");
	}
	onModelChanged(callback) {
		if (typeof callback !== "function") throw new Error("ArchimateAdapter.onModelChanged requires a callback");
		const eventBus = this.modeler.get("eventBus");
		eventBus.on("commandStack.changed", callback);
		return () => {
			eventBus.off("commandStack.changed", callback);
		};
	}
	destroy() {
		this.modeler.destroy();
	}
};
//#endregion
export { ArchimateAdapter };
