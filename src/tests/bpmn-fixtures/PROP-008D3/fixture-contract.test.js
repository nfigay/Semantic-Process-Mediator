import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BpmnModdle } from 'bpmn-moddle';

const files = ['PROP008D3_PROCESS.bpmn', 'PROP008D3_COLLABORATION.bpmn'];
const load = (name) => readFileSync(fileURLToPath(new URL(name, import.meta.url)), 'utf8');

describe('PROP-008D3 Process and Collaboration fixtures', () => {
  for (const file of files) {
    it(`${file} loads and roundtrips with BPMN moddle and BPMN DI`, async () => {
      const moddle = new BpmnModdle();
      const xml = load(file);
      const parsed = await moddle.fromXML(xml);
      expect(parsed.rootElement.$type).toBe('bpmn:Definitions');
      expect(parsed.rootElement.diagrams?.length).toBeGreaterThan(0);
      const diagram = parsed.rootElement.diagrams[0];
      expect(diagram.plane?.planeElement?.length).toBeGreaterThan(0);
      const serialized = await moddle.toXML(parsed.rootElement, { format: true });
      const roundtrip = await moddle.fromXML(serialized.xml);
      expect(roundtrip.rootElement.diagrams?.length).toBeGreaterThan(0);
      expect(roundtrip.rootElement.rootElements?.length).toBe(parsed.rootElement.rootElements?.length);
    });
  }
});
