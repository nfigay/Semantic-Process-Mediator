import {
  describe,
  expect,
  test
} from 'vitest'

import {
  BpmnModdle
} from 'bpmn-moddle'


const BPMN_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:color="http://www.omg.org/spec/BPMN/non-normative/color/1.0"
  xmlns:bioc="http://bpmn.io/schema/bpmn/biocolor/1.0"
  id="Definitions_VIS_STYLE_001"
  targetNamespace="urn:bpmnsm:test:visual-style">

  <bpmn:process
    id="Process_VIS_STYLE_001"
    isExecutable="false">

    <bpmn:task
      id="Activity_VIS_STYLE_001"
      name="Colored Task" />

  </bpmn:process>

  <bpmndi:BPMNDiagram
    id="Diagram_VIS_STYLE_001">

    <bpmndi:BPMNPlane
      id="Plane_VIS_STYLE_001"
      bpmnElement="Process_VIS_STYLE_001">

      <bpmndi:BPMNShape
        id="Activity_VIS_STYLE_001_di"
        bpmnElement="Activity_VIS_STYLE_001"
        color:background-color="#2676c7"
        color:border-color="#123456"
        bioc:fill="#2676c7"
        bioc:stroke="#123456">

        <dc:Bounds
          x="200"
          y="80"
          width="100"
          height="80" />

      </bpmndi:BPMNShape>

    </bpmndi:BPMNPlane>

  </bpmndi:BPMNDiagram>

</bpmn:definitions>`


function createModdle() {
  return new BpmnModdle()
}


function findTaskShape(definitions) {
  const diagram =
    definitions.diagrams?.find(
      candidate =>
        candidate.id ===
          'Diagram_VIS_STYLE_001'
    )

  const plane =
    diagram?.plane

  return (
    plane?.planeElement || []
  ).find(
    element =>
      element.$type ===
        'bpmndi:BPMNShape' &&
      element.id ===
        'Activity_VIS_STYLE_001_di'
  ) || null
}


function readColors(shape) {
  return {
    background:
      shape?.get?.(
        'color:background-color'
      ) ??
      shape?.$attrs?.[
        'color:background-color'
      ] ??
      null,

    border:
      shape?.get?.(
        'color:border-color'
      ) ??
      shape?.$attrs?.[
        'color:border-color'
      ] ??
      null,

    fill:
      shape?.get?.(
        'bioc:fill'
      ) ??
      shape?.fill ??
      shape?.$attrs?.[
        'bioc:fill'
      ] ??
      null,

    stroke:
      shape?.get?.(
        'bioc:stroke'
      ) ??
      shape?.stroke ??
      shape?.$attrs?.[
        'bioc:stroke'
      ] ??
      null
  }
}


describe(
  'VIS-STYLE-001 BPMN DI XML round-trip',
  () => {

    test(
      'preserves modern and legacy visual colors through two moddle serializations',
      async () => {

        const firstModdle =
          createModdle()

        const {
          rootElement:
            firstDefinitions
        } =
          await firstModdle.fromXML(
            BPMN_XML
          )

        const firstShape =
          findTaskShape(
            firstDefinitions
          )

        expect(firstShape)
          .toBeTruthy()

        expect(
          readColors(firstShape)
        ).toEqual({
          background: '#2676c7',
          border: '#123456',
          fill: '#2676c7',
          stroke: '#123456'
        })

        const firstSerialized =
          await firstModdle.toXML(
            firstDefinitions,
            {
              format: true
            }
          )

        expect(firstSerialized.xml)
          .toContain(
            'color:background-color="#2676c7"'
          )

        expect(firstSerialized.xml)
          .toContain(
            'color:border-color="#123456"'
          )

        expect(firstSerialized.xml)
          .toContain(
            'bioc:fill="#2676c7"'
          )

        expect(firstSerialized.xml)
          .toContain(
            'bioc:stroke="#123456"'
          )

        /*
         * Second independent moddle instance:
         * proves reopen + serialization rather than
         * merely serializing the original object graph.
         */
        const secondModdle =
          createModdle()

        const {
          rootElement:
            secondDefinitions
        } =
          await secondModdle.fromXML(
            firstSerialized.xml
          )

        const secondShape =
          findTaskShape(
            secondDefinitions
          )

        expect(secondShape)
          .toBeTruthy()

        expect(
          readColors(secondShape)
        ).toEqual({
          background: '#2676c7',
          border: '#123456',
          fill: '#2676c7',
          stroke: '#123456'
        })

        const secondSerialized =
          await secondModdle.toXML(
            secondDefinitions,
            {
              format: true
            }
          )

        expect(secondSerialized.xml)
          .toContain(
            'color:background-color="#2676c7"'
          )

        expect(secondSerialized.xml)
          .toContain(
            'color:border-color="#123456"'
          )

        expect(secondSerialized.xml)
          .toContain(
            'bioc:fill="#2676c7"'
          )

        expect(secondSerialized.xml)
          .toContain(
            'bioc:stroke="#123456"'
          )
      }
    )
  }
)
