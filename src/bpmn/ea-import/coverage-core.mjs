/** Portable DOM-based EA-to-BPMN message-flow identity audit. No Node APIs. */
const EA_NS = 'http://www.sparxsystems.com/profiles/BPMN2.0/1.5';
const BPMN_NS = 'http://www.omg.org/spec/BPMN/20100524/MODEL';
const XMI_NS = 'http://www.omg.org/spec/XMI/20131001';
const list = (doc, ns, local) => Array.from(doc.getElementsByTagNameNS(ns, local));
const xmiId = el => el.getAttributeNS(XMI_NS, 'id') || el.getAttribute('xmi:id') || '';
const freq = values => { const m = new Map(); for (const v of values) m.set(v, (m.get(v) || 0) + 1); return m; };
const duplicates = values => [...freq(values)].filter(([, n]) => n > 1).map(([id]) => id);
export function verifyDocuments(ea, bpmn) {
  if (!ea?.documentElement || !bpmn?.documentElement) throw new Error('Expected parsed XML documents');
  const stereotypes = list(ea, EA_NS, 'MessageFlow');
  const controlFlows = Array.from(ea.getElementsByTagName('*')).filter(e => e.getAttribute('xmi:type') === 'uml:ControlFlow' || e.getAttributeNS(XMI_NS, 'type') === 'uml:ControlFlow');
  const controlById = new Map(controlFlows.map(e => [xmiId(e), e]));
  const sourceLinks = stereotypes.map(s => ({ stereotypeId: xmiId(s), controlId: s.getAttribute('base_ControlFlow') || '' }));
  const missingControls = sourceLinks.filter(s => !controlById.has(s.controlId));
  const duplicatedSourceControls = duplicates(sourceLinks.map(s => s.controlId).filter(Boolean));
  const expected = new Set(sourceLinks.filter(s => controlById.has(s.controlId)).map(s => `EA_${s.controlId}`));
  const flows = list(bpmn, BPMN_NS, 'messageFlow');
  const actual = flows.map(f => f.getAttribute('id') || '');
  const actualSet = new Set(actual);
  const allElements = Array.from(bpmn.getElementsByTagName('*'));
  const allIds = allElements.map(e => e.getAttribute('id')).filter(Boolean);
  const idSet = new Set(allIds);
  const missingIds = flows.filter(f => !f.getAttribute('id')).length;
  const missing = [...expected].filter(id => !actualSet.has(id));
  const extra = [...actualSet].filter(id => id && !expected.has(id));
  const brokenEndpoints = flows.filter(f => !idSet.has(f.getAttribute('sourceRef')) || !idSet.has(f.getAttribute('targetRef'))).map(f => f.getAttribute('id'));
  const duplicateBpmnIds = duplicates(allIds);
  const duplicateControlIds = duplicates(controlFlows.map(xmiId).filter(Boolean));
  const ok = !missingControls.length && !duplicatedSourceControls.length && !duplicateControlIds.length && stereotypes.length === expected.size && expected.size === flows.length && !missing.length && !extra.length && !brokenEndpoints.length && !duplicateBpmnIds.length && !missingIds;
  return { ok, eaMessageFlows: stereotypes.length, eaControlFlows: controlFlows.length, expectedUniqueFlows: expected.size, bpmnMessageFlows: flows.length, missingControls, duplicatedSourceControls, duplicateControlIds, missing, extra, brokenEndpoints, duplicateBpmnIds, missingIds };
}
export function formatReport(r) {
  const fields = [
    ['EA_MESSAGE_FLOW_STEREOTYPES', r.eaMessageFlows], ['EA_UML_CONTROL_FLOWS', r.eaControlFlows],
    ['EXPECTED_UNIQUE_MESSAGE_FLOWS', r.expectedUniqueFlows], ['BPMN_MESSAGE_FLOWS', r.bpmnMessageFlows],
    ['EA_STEREOTYPES_WITHOUT_CONTROL_FLOW', r.missingControls.length], ['DUPLICATE_EA_MESSAGE_FLOW_REFERENCES', r.duplicatedSourceControls.length],
    ['DUPLICATE_UML_CONTROL_FLOW_IDS', r.duplicateControlIds.length], ['MISSING_BPMN_FLOW_IDS', r.missing.length],
    ['EXTRA_BPMN_FLOW_IDS', r.extra.length], ['BROKEN_MESSAGE_ENDPOINTS', r.brokenEndpoints.length],
    ['DUPLICATE_BPMN_IDS', r.duplicateBpmnIds.length], ['MISSING_BPMN_FLOW_ID', r.missingIds],
    ['COVERAGE_STATUS', r.ok ? 'OK' : 'REVIEW']
  ];
  for (const [label, values] of [['MISSING_CONTROL_IDS', r.missingControls.map(x => x.controlId)], ['DUPLICATE_SOURCE_CONTROL_IDS', r.duplicatedSourceControls], ['MISSING_IDS', r.missing], ['EXTRA_IDS', r.extra], ['BROKEN_IDS', r.brokenEndpoints], ['DUPLICATE_IDS', r.duplicateBpmnIds]]) if (values.length) fields.push([label, values.join(',')]);
  return fields.map(([k,v]) => `${k}=${v}`).join('\n');
}
