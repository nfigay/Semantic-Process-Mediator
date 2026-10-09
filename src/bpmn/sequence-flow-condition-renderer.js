import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer'
import { append as svgAppend, create as svgCreate, attr as svgAttr } from 'tiny-svg'

export function getSequenceFlowCondition(bo) {
  return bo?.$type === 'bpmn:SequenceFlow'
    ? String(bo.conditionExpression?.body || '').trim()
    : ''
}

export function SequenceFlowConditionRenderer(eventBus, bpmnRenderer) {
  BaseRenderer.call(this, eventBus, 1700)
  this._bpmnRenderer = bpmnRenderer
}
SequenceFlowConditionRenderer.$inject = [ 'eventBus', 'bpmnRenderer' ]
SequenceFlowConditionRenderer.prototype = Object.create(BaseRenderer.prototype)
SequenceFlowConditionRenderer.prototype.constructor = SequenceFlowConditionRenderer
SequenceFlowConditionRenderer.prototype.canRender = function(element) {
  return element?.type === 'bpmn:SequenceFlow' &&
    Boolean(getSequenceFlowCondition(element.businessObject))
}
SequenceFlowConditionRenderer.prototype.drawConnection = function(parentGfx, element, attrs) {
  const gfx = this._bpmnRenderer.drawConnection(parentGfx, element, attrs)
  const points = element.waypoints || []
  if (points.length < 2) return gfx
  const lengths = points.slice(1).map((p, i) => Math.hypot(p.x - points[i].x, p.y - points[i].y))
  const half = lengths.reduce((a, b) => a + b, 0) / 2
  let remaining = half
  let x = points[0].x, y = points[0].y
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i]) {
      const t = lengths[i] ? remaining / lengths[i] : 0
      x = points[i].x + t * (points[i + 1].x - points[i].x)
      y = points[i].y + t * (points[i + 1].y - points[i].y)
      break
    }
    remaining -= lengths[i]
  }
  // Diagram-js renders connection graphics in diagram coordinates.
  const label = svgCreate('text')
  svgAttr(label, {
    x, y: y - 7, 'text-anchor': 'middle',
    'font-family': 'Arial, sans-serif', 'font-size': 12,
    fill: '#222', class: 'bpmns-condition-label',
    'pointer-events': 'none'
  })
  label.textContent = getSequenceFlowCondition(element.businessObject)
  svgAppend(parentGfx, label)
  return gfx
}
export default {
  __init__: [ 'sequenceFlowConditionRenderer' ],
  sequenceFlowConditionRenderer: [ 'type', SequenceFlowConditionRenderer ]
}
