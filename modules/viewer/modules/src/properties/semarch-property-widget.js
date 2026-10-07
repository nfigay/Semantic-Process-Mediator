import { RuntimeDatatype } from "../model/datatype-runtime.js";
//#region src/properties/semarch-property-widget.js
var PropertyWidget = {
	TEXT: "text",
	BOOLEAN: "boolean",
	INTEGER: "integer",
	DECIMAL: "decimal",
	DATE: "date",
	DATETIME: "datetime"
};
function resolvePropertyWidget(datatype) {
	switch (datatype) {
		case RuntimeDatatype.BOOLEAN: return PropertyWidget.BOOLEAN;
		case RuntimeDatatype.INTEGER: return PropertyWidget.INTEGER;
		case RuntimeDatatype.DECIMAL: return PropertyWidget.DECIMAL;
		case RuntimeDatatype.DATE: return PropertyWidget.DATE;
		case RuntimeDatatype.DATETIME: return PropertyWidget.DATETIME;
		case RuntimeDatatype.STRING:
		case RuntimeDatatype.UNKNOWN:
		default: return PropertyWidget.TEXT;
	}
}
//#endregion
export { PropertyWidget, resolvePropertyWidget };
