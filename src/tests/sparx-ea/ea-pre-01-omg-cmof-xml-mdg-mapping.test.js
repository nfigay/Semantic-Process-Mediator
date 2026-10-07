import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const mapping = JSON.parse(read('src/tests/sparx-ea/EA-PRE-01/analysis/omg-cmof-xml-sparx-mdg-mapping.json'));

describe('EA-PRE-01 OMG CMOF/XML/Sparx mapping evidence', () => {
  it('locks the exact normative and Sparx source hashes used by the analysis', () => {
    expect(mapping.basis.omgBpmn20CmofSha256).toBe('72f5bf035da7bea80dc53131a22e6ba466789abd7437532e64abd3a7cff20139');
    expect(mapping.basis.omgSemanticXsdSha256).toBe('c4318842f7d2bbc262d7954c9452c501db16f0868eac0b8732ec5d7fb384d9a7');
    expect(mapping.basis.omgFromXmiXsltSha256).toBe('4dee343f0bd9e114b2be6bebd9e1084c19a59a0bb893cf99c3438a5f2030fb4b');
    expect(mapping.basis.sparxMdgSha256).toBe('ce95200e7fcefbd2e85bb38f94d5d27e55424107b095644e7d627bdb493bd6d1');
  });

  it('keeps Group categorization distinct from BPMN Association', () => {
    expect(mapping.elements.Group.cmof.superClass).toBe('Artifact');
    expect(mapping.elements.Group.cmof.properties.categoryValueRef.type).toBe('CategoryValue');
    expect(mapping.elements.FlowElement.cmof.properties.categoryValueRef.upper).toBe('*');
    expect(mapping.elements.Association.cmof.properties).toHaveProperty('sourceRef');
  });

  it('records the EA native projections without inventing missing tagged values', () => {
    expect(mapping.elements.Group.sparx.baseType).toBe('SysBoundary');
    expect(mapping.elements.Association.sparx.baseType).toBe('Dependency');
    expect(mapping.elements.TextAnnotation.sparx.baseType).toBe('Note');
    expect(mapping.elements.Association.sparx.unresolvedMappings).toEqual(['sourceRef', 'targetRef', 'associationDirection']);
    expect(mapping.elements.TextAnnotation.sparx.unresolvedMappings).toEqual(['text', 'textFormat']);
  });

  it('records OMG XSLT/XSD inter-artifact mismatches explicitly', () => {
    expect(mapping.elements.FlowElement.xsd.categoryValueRef.serialization).toBe('element');
    expect(mapping.elements.FlowElement.xslt.output).toBe('@categoryValueRef');
    expect(mapping.elements.FlowElement.xslt.xsdMismatch).toBe(true);
    expect(mapping.elements.CategoryValue.xsd.categorizedFlowElements).toBe(null);
    expect(mapping.elements.CategoryValue.xslt.xsdMismatch).toBe(true);
  });

  it('does not claim experimental EA export evidence yet', () => {
    expect(mapping.experimentalStatus).toEqual({ eaXmi: 'pending', eaBpmnExport: 'pending' });
  });
});
