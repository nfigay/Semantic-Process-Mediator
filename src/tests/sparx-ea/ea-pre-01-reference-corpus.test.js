import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ref = path.join(here, 'EA-PRE-01', 'reference');
const omg = path.join(ref, 'omg-bpmn-2.0.2');
const sparx = path.join(ref, 'sparx-ea-16.1.1628');
const requiredOmg = ['BPMN20.cmof','BPMNDI.cmof','DC.cmof','DI.cmof','BPMN20.xsd','BPMNDI.xsd','DC.xsd','DI.xsd','Semantic.xsd','BPMN20-FromXMI.xslt','Infrastructure.cmof'];

describe('EA-PRE-01 normative/reference corpus', () => {
  it('keeps the supplied Sparx BPMN MDG reference', () => {
    const xml = fs.readFileSync(path.join(sparx, 'BPMN-2.0-Technology.xml'), 'utf8');
    expect(xml).toContain('id="BPMN2.0"');
    expect(xml).toContain('version="1.0.7"');
    expect(xml).toContain('Stereotype name="Group"');
    expect(xml).toContain('<Apply type="SysBoundary"');
    expect(xml).toContain('Stereotype name="TextAnnotation"');
    expect(xml).toContain('<Apply type="Note"');
    expect(xml).toContain('Stereotype name="Association"');
    expect(xml).toContain('<Apply type="Dependency"');
  });

  it('has all official OMG BPMN 2.0.2 machine-readable inputs after fetch', () => {
    const missing = requiredOmg.filter(name => !fs.existsSync(path.join(omg, name)));
    expect(missing, `Run ${path.join(omg, 'fetch-omg-bpmn-2.0.2.sh')} first`).toEqual([]);
  });

  it('captures the key CMOF grouping semantics', () => {
    const cmof = fs.readFileSync(path.join(omg, 'BPMN20.cmof'), 'utf8');
    expect(cmof).toContain('xmi:id="Group" name="Group" superClass="Artifact"');
    expect(cmof).toContain('xmi:id="Group-categoryValueRef" name="categoryValueRef" type="CategoryValue" lower="0"');
    expect(cmof).toContain('xmi:id="FlowElement-categoryValueRef" name="categoryValueRef" type="CategoryValue" upper="*" lower="0"');
    expect(cmof).toContain('xmi:id="CategoryValue-categorizedFlowElements" name="categorizedFlowElements" type="FlowElement" upper="*" lower="0" isDerived="true"');
  });

  it('captures the key CMOF Artifact mappings', () => {
    const cmof = fs.readFileSync(path.join(omg, 'BPMN20.cmof'), 'utf8');
    expect(cmof).toContain('xmi:id="TextAnnotation" name="TextAnnotation" superClass="Artifact"');
    expect(cmof).toContain('xmi:id="Association" name="Association" superClass="Artifact"');
    expect(cmof).toContain('xmi:id="Association-sourceRef" name="sourceRef" type="BaseElement"');
    expect(cmof).toContain('xmi:id="Association-targetRef" name="targetRef" type="BaseElement"');
  });
});
