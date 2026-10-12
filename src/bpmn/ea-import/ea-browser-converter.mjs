import { normalizeEaBytes } from './ea-xml-normalize.mjs';
import { verifyDocuments } from './coverage-core.mjs';
import { verifyStructure } from './structure-core.mjs';

function parseXml(xml, label) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length || doc.documentElement?.localName === 'parsererror')
    throw new Error(`${label}: invalid XML`);
  return doc;
}

/** Browser-only EA XMI -> BPMN adapter. No Node runtime, file paths or filesystem access. */
export async function convertEaBytes({ bytes, stylesheetLocation, SaxonJS, validate = true }) {
  const { xml, sourceEncoding } = normalizeEaBytes(bytes);
  const result = await convertNormalizedEaXml({ xml, stylesheetLocation, SaxonJS, validate });
  return { ...result, sourceEncoding };
}

export async function convertEaFile({ file, ...options }) {
  if (!file || typeof file.arrayBuffer !== 'function') throw new TypeError('Expected browser File or Blob');
  return convertEaBytes({ bytes: await file.arrayBuffer(), ...options });
}

export async function convertNormalizedEaXml({ xml, stylesheetLocation, SaxonJS, validate = true }) {
  if (typeof xml !== 'string' || !xml.trim()) throw new TypeError('xml must be non-empty');
  if (!stylesheetLocation) throw new TypeError('Compiled SEF stylesheetLocation is required');
  if (typeof SaxonJS?.transform !== 'function') throw new TypeError('SaxonJS.transform is required');
  const started = performance.now();
  const source = parseXml(xml, 'EA XMI');
  const result = await SaxonJS.transform({ stylesheetLocation, sourceText: xml, destination: 'serialized' }, 'async');
  const bpmnXml = result?.principalResult;
  if (typeof bpmnXml !== 'string' || !bpmnXml.trim()) throw new Error('No serialized BPMN returned by SaxonJS');
  const bpmn = parseXml(bpmnXml, 'BPMN');
  const coverage = validate ? verifyDocuments(source, bpmn) : null;
  const structure = validate ? verifyStructure(bpmn) : null;
  return { bpmnXml, validation: { coverage, structure, ok: validate ? coverage.ok && structure.ok : null }, elapsedMs: performance.now() - started };
}
