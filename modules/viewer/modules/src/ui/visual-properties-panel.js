import { w2form } from "../../node_modules/w2ui/w2ui-2.0.es6.min.js";
import { getOccurrenceDisplayLabel } from "../bpmn/occurrence-display-label.js";
import { getDi } from "../../node_modules/bpmn-js/lib/util/ModelUtil.js";
//#region src/ui/visual-properties-panel.js
var formSequence = 0;
function getDiColor(element, key, legacyKey = null) {
	const di = getDi(element);
	if (!di) return "";
	const value = di.get?.(`color:${key}`) ?? di.get?.(key) ?? di[key] ?? di.$attrs?.[key] ?? (legacyKey ? di.get?.(`bioc:${legacyKey}`) ?? di.get?.(legacyKey) ?? di[legacyKey] ?? di.$attrs?.[legacyKey] : null);
	return typeof value === "string" ? value : "";
}
function isConnection(element) {
	return Boolean(element?.waypoints) && !element?.children;
}
function toW2Color(value) {
	if (!value) return "";
	const color = String(value).trim();
	return /^#[0-9a-fA-F]{6}$/.test(color) ? color.slice(1) : color;
}
function normalizeW2Color(value) {
	if (value == null || value === "") return null;
	const color = String(value).trim();
	if (/^[0-9a-fA-F]{6}$/.test(color)) return `#${color}`;
	if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
	return color;
}
function createVisualPropertiesPanel({ container, modeler, editable = true } = {}) {
	if (!container) throw new Error("Visual properties panel requires a container");
	if (!modeler) throw new Error("Visual properties panel requires a modeler");
	const formName = `bpmn_visual_properties_${++formSequence}`;
	const identityHeader = document.createElement("div");
	identityHeader.className = "bpmnsm-visual-properties-identity";
	identityHeader.style.cssText = `
    display:none;
    padding:10px 12px;
    border-bottom:1px solid #D4DCE6;
    background:#F8FAFC;
  `;
	const identityType = document.createElement("div");
	identityType.className = "bpmnsm-visual-properties-identity-type";
	identityType.style.cssText = `
    font-size:11px;
    font-weight:600;
    color:#52606D;
    margin-bottom:3px;
  `;
	const identityName = document.createElement("div");
	identityName.className = "bpmnsm-visual-properties-identity-name";
	identityName.style.cssText = `
    font-size:13px;
    font-weight:600;
    color:#1F2933;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  `;
	const identityId = document.createElement("div");
	identityId.className = "bpmnsm-visual-properties-identity-id";
	identityId.style.cssText = `
    margin-top:3px;
    font-size:11px;
    color:#7B8794;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  `;
	identityHeader.append(identityType, identityName, identityId);
	const formContainer = document.createElement("div");
	formContainer.className = "bpmnsm-visual-properties-form";
	const form = new w2form({
		name: formName,
		focus: -1,
		style: "border: 0; background: transparent;",
		fields: [
			{
				field: "x",
				type: "float",
				disabled: true,
				html: {
					label: "X",
					group: "Geometry",
					groupCollapsible: true
				}
			},
			{
				field: "y",
				type: "float",
				disabled: true,
				html: { label: "Y" }
			},
			{
				field: "width",
				type: "float",
				disabled: true,
				html: { label: "Width" }
			},
			{
				field: "height",
				type: "float",
				disabled: true,
				html: { label: "Height" }
			},
			{
				field: "fill",
				type: "color",
				html: {
					label: "Fill",
					group: "Appearance",
					groupCollapsible: true
				},
				options: {
					advanced: true,
					transparent: true
				}
			},
			{
				field: "stroke",
				type: "color",
				html: { label: "Stroke" },
				options: {
					advanced: true,
					transparent: true
				}
			}
		],
		actions: { Reset() {
			const selection = modeler.get("selection")?.get?.() || [];
			if (!selection.length || !editable) return;
			const modeling = modeler.get("modeling");
			const element = selection[0];
			modeling.setColor(selection, isConnection(element) ? { stroke: null } : {
				fill: null,
				stroke: null
			});
			sync(selection);
		} },
		onChange(event) {
			const selection = modeler.get("selection").get() || [];
			if (!editable || selection.length !== 1) return;
			const element = selection[0];
			const target = event.target;
			if (!isConnection(element) && [
				"x",
				"y",
				"width",
				"height"
			].includes(target)) {
				const rawValue = event?.detail?.value?.current ?? form.record?.[target];
				const value = Number(rawValue);
				if (!Number.isFinite(value)) {
					event.onComplete = () => sync(selection);
					return;
				}
				const modeling = modeler.get("modeling");
				if (target === "x" || target === "y") {
					const delta = {
						x: target === "x" ? value - element.x : 0,
						y: target === "y" ? value - element.y : 0
					};
					if (delta.x || delta.y) modeling.moveShape(element, delta, element.parent);
				} else {
					const newBounds = {
						x: element.x,
						y: element.y,
						width: target === "width" ? value : element.width,
						height: target === "height" ? value : element.height
					};
					if (newBounds.width > 0 && newBounds.height > 0 && (newBounds.width !== element.width || newBounds.height !== element.height)) modeling.resizeShape(element, newBounds);
				}
				event.onComplete = () => sync(selection);
				return;
			}
			const colors = {};
			const value = normalizeW2Color(event?.detail?.value?.current ?? (event?.target ? form.record?.[event.target] : null) ?? null);
			if (event.target === "fill") colors.fill = value || null;
			if (event.target === "stroke") colors.stroke = value || null;
			if (!Object.keys(colors).length) return;
			modeler.get("modeling").setColor(selection, colors);
			event.onComplete = () => sync(selection);
		}
	});
	function sync(selection) {
		const element = selection?.[0] || null;
		if (!element) {
			form.clear();
			identityHeader.style.display = "none";
			identityType.textContent = "";
			identityName.textContent = "";
			identityId.textContent = "";
			container.style.display = "none";
			return;
		}
		const businessObject = element.businessObject || null;
		identityType.textContent = businessObject?.$type || element.type || "";
		identityName.textContent = getOccurrenceDisplayLabel(businessObject) || "(unnamed)";
		identityId.textContent = businessObject?.id || element.id || "";
		identityHeader.style.display = "block";
		const connection = isConnection(element);
		form.record = {
			x: connection ? "" : element.x ?? "",
			y: connection ? "" : element.y ?? "",
			width: connection ? "" : element.width ?? "",
			height: connection ? "" : element.height ?? "",
			fill: connection ? "" : toW2Color(getDiColor(element, "background-color", "fill")),
			stroke: toW2Color(getDiColor(element, "border-color", "stroke"))
		};
		if (connection) {
			form.hide("x");
			form.hide("y");
			form.hide("width");
			form.hide("height");
			form.hide("fill");
		} else {
			form.show("x");
			form.show("y");
			form.show("width");
			form.show("height");
			form.show("fill");
		}
		form.refresh();
		container.style.display = editable ? "block" : "none";
	}
	container.innerHTML = "";
	container.append(identityHeader, formContainer);
	form.render(formContainer);
	container.style.display = "none";
	const selection = modeler.get("selection");
	const onSelectionChanged = ({ newSelection = [] } = {}) => {
		sync(newSelection);
	};
	modeler.on("selection.changed", onSelectionChanged);
	const onPropertiesChanged = () => {
		const currentSelection = selection?.get?.() || [];
		if (currentSelection.length) sync(currentSelection);
	};
	modeler.on("commandStack.changed", onPropertiesChanged);
	return {
		form,
		sync,
		show(selection) {
			sync(selection || modeler.get("selection")?.get?.() || []);
		},
		hide() {
			container.style.display = "none";
		},
		destroy() {
			modeler.off?.("selection.changed", onSelectionChanged);
			modeler.off?.("commandStack.changed", onPropertiesChanged);
			form.destroy();
			container.innerHTML = "";
		}
	};
}
//#endregion
export { createVisualPropertiesPanel };

//# sourceMappingURL=visual-properties-panel.js.map