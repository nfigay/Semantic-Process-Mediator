import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer'
import { append as svgAppend, classes as svgClasses } from 'tiny-svg'
import { getOccurrenceDisplayLabel } from './occurrence-display-label.js'

export function OccurrenceLabelRenderer(eventBus, bpmnRenderer, textRenderer) {
  BaseRenderer.call(this, eventBus, 1600)
  this._bpmnRenderer = bpmnRenderer
  this._textRenderer = textRenderer
}

OccurrenceLabelRenderer.$inject = [ 'eventBus', 'bpmnRenderer', 'textRenderer' ]
OccurrenceLabelRenderer.prototype = Object.create(BaseRenderer.prototype)
OccurrenceLabelRenderer.prototype.constructor = OccurrenceLabelRenderer

OccurrenceLabelRenderer.prototype.canRender = function(element) {
  return Boolean(element?.labelTarget) &&
    [ 'bpmn:DataObjectReference', 'bpmn:DataStoreReference' ]
      .includes(element.labelTarget?.businessObject?.$type) &&
    Boolean(getOccurrenceDisplayLabel(element.labelTarget.businessObject))
}

OccurrenceLabelRenderer.prototype.drawShape = function(parentGfx, element, attrs = {}) {
  const label = getOccurrenceDisplayLabel(element.labelTarget.businessObject)
  // Geometry has one owner: the model label, sized by the lifecycle adapter.
  const text = this._textRenderer.createText(label, {
    box: { width: element.width, height: element.height,
      x: element.width / 2, y: element.height / 2 },
    style: this._textRenderer.getExternalStyle(),
    ...attrs
  })
  svgClasses(text).add('djs-label')
  svgAppend(parentGfx, text)
  return text
}

export default {
  __init__: [ 'occurrenceLabelRenderer' ],
  occurrenceLabelRenderer: [ 'type', OccurrenceLabelRenderer ]
}
