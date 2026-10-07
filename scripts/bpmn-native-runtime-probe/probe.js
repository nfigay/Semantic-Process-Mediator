import {
  createModeler
} from '../../src/bpmn/create-modeler.js'


const BPMN_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Definitions_RuntimeProbe"
  targetNamespace="http://bpmn.io/schema/bpmn">

  <bpmn:dataStore
    id="DataStore_Master"
    name="Master Store"
    capacity="100"
    isUnlimited="false" />

  <bpmn:collaboration
    id="Collaboration_RuntimeProbe">

    <bpmn:participant
      id="Participant_RuntimeProbe"
      name="Probe Participant"
      processRef="Process_RuntimeProbe" />

  </bpmn:collaboration>

  <bpmn:process
    id="Process_RuntimeProbe"
    name="Runtime Probe"
    isExecutable="false">

    <bpmn:startEvent
      id="StartEvent_RuntimeProbe" />

    <bpmn:task
      id="Task_RuntimeProbe"
      name="Probe Task" />

    <bpmn:adHocSubProcess
      id="AdHoc_RuntimeProbe"
      name="Probe Ad Hoc"
      cancelRemainingInstances="true">

      <bpmn:completionCondition
        xsi:type="bpmn:tFormalExpression">true</bpmn:completionCondition>

    </bpmn:adHocSubProcess>

    <bpmn:dataObject
      id="DataObject_Master"
      name="Master Data Object" />

    <bpmn:dataObjectReference
      id="DataObjectReference_RuntimeProbe"
      name="Data Object Reference"
      dataObjectRef="DataObject_Master" />

    <bpmn:dataStoreReference
      id="DataStoreReference_RuntimeProbe"
      name="Data Store Reference"
      dataStoreRef="DataStore_Master" />

    <bpmn:textAnnotation
      id="TextAnnotation_RuntimeProbe">
      <bpmn:text>Probe annotation</bpmn:text>
    </bpmn:textAnnotation>

    <bpmn:endEvent
      id="EndEvent_RuntimeProbe" />

    <bpmn:sequenceFlow
      id="Flow_1"
      sourceRef="StartEvent_RuntimeProbe"
      targetRef="Task_RuntimeProbe" />

    <bpmn:sequenceFlow
      id="Flow_2"
      sourceRef="Task_RuntimeProbe"
      targetRef="AdHoc_RuntimeProbe" />

    <bpmn:sequenceFlow
      id="Flow_3"
      sourceRef="AdHoc_RuntimeProbe"
      targetRef="EndEvent_RuntimeProbe" />

  </bpmn:process>

  <bpmndi:BPMNDiagram
    id="Diagram_RuntimeProbe">

    <bpmndi:BPMNPlane
      id="Plane_RuntimeProbe"
      bpmnElement="Collaboration_RuntimeProbe">

      <bpmndi:BPMNShape
        id="Participant_RuntimeProbe_di"
        bpmnElement="Participant_RuntimeProbe"
        isHorizontal="true">
        <dc:Bounds x="50" y="50" width="900" height="450" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape
        id="StartEvent_RuntimeProbe_di"
        bpmnElement="StartEvent_RuntimeProbe">
        <dc:Bounds x="120" y="140" width="36" height="36" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape
        id="Task_RuntimeProbe_di"
        bpmnElement="Task_RuntimeProbe">
        <dc:Bounds x="210" y="118" width="100" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape
        id="AdHoc_RuntimeProbe_di"
        bpmnElement="AdHoc_RuntimeProbe"
        isExpanded="true">
        <dc:Bounds x="370" y="98" width="160" height="120" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape
        id="EndEvent_RuntimeProbe_di"
        bpmnElement="EndEvent_RuntimeProbe">
        <dc:Bounds x="600" y="140" width="36" height="36" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape
        id="DataObjectReference_RuntimeProbe_di"
        bpmnElement="DataObjectReference_RuntimeProbe">
        <dc:Bounds x="210" y="290" width="36" height="50" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape
        id="DataStoreReference_RuntimeProbe_di"
        bpmnElement="DataStoreReference_RuntimeProbe">
        <dc:Bounds x="370" y="290" width="50" height="50" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape
        id="TextAnnotation_RuntimeProbe_di"
        bpmnElement="TextAnnotation_RuntimeProbe">
        <dc:Bounds x="540" y="290" width="120" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNEdge
        id="Flow_1_di"
        bpmnElement="Flow_1">
        <di:waypoint x="156" y="158" />
        <di:waypoint x="210" y="158" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge
        id="Flow_2_di"
        bpmnElement="Flow_2">
        <di:waypoint x="310" y="158" />
        <di:waypoint x="370" y="158" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge
        id="Flow_3_di"
        bpmnElement="Flow_3">
        <di:waypoint x="530" y="158" />
        <di:waypoint x="600" y="158" />
      </bpmndi:BPMNEdge>

    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>

</bpmn:definitions>`


const CONTEXTS = [
  {
    id: 'Task_RuntimeProbe'
  },
  {
    id: 'AdHoc_RuntimeProbe'
  },
  {
    id: 'Participant_RuntimeProbe',
    semanticLinks: [
      {
        property: 'processRef'
      }
    ]
  },
  {
    id: 'TextAnnotation_RuntimeProbe'
  },
  {
    id: 'DataObjectReference_RuntimeProbe',
    semanticLinks: [
      {
        property: 'dataObjectRef'
      }
    ]
  },
  {
    id: 'DataStoreReference_RuntimeProbe',
    semanticLinks: [
      {
        property: 'dataStoreRef'
      }
    ]
  }
]


function describeBusinessObject(
  businessObject
) {

  if (!businessObject) {
    return null
  }


  return {
    id:
      businessObject.id ||
      null,

    type:
      businessObject.$type ||
      null
  }
}


function inspectContext(
  provider,
  registry,
  definition
) {

  const element =
    registry.get(
      definition.id
    )


  if (!element) {

    return {
      contextId:
        definition.id,

      status:
        'CONTEXT_NOT_FOUND'
    }
  }


  const businessObject =
    element.businessObject


  const groups =
    provider
      .getGroups(element)([])


  const semanticLinks =
    (
      definition.semanticLinks ||
      []
    )
      .map(link => {

        const target =
          businessObject?.[
            link.property
          ] ||
          null


        return {
          property:
            link.property,

          owner:
            describeBusinessObject(
              businessObject
            ),

          target:
            describeBusinessObject(
              target
            )
        }
      })


  return {
    status:
      'OBSERVED',

    context: {
      id:
        element.id,

      type:
        businessObject?.$type ||
        null
    },

    groups:
      groups.map(
        group => ({
          id:
            group.id ||
            null,

          entries:
            (
              group.entries ||
              []
            )
              .map(
                entry =>
                  entry.id ||
                  null
              )
              .filter(Boolean)
        })
      ),

    entryIds:
      groups
        .flatMap(
          group =>
            group.entries ||
            []
        )
        .map(
          entry =>
            entry.id ||
            null
        )
        .filter(Boolean),

    semanticLinks
  }
}


async function run() {

  const output =
    document.querySelector('#result')

  try {

    const modeler =
      createModeler({
        container: '#bpmn-canvas',
        propertiesPanel: '#bpmn-props',
        capabilities: {
          linting: false
        }
      })


    await modeler.importXML(
      BPMN_XML
    )


    const registry =
      modeler.get(
        'elementRegistry'
      )


    const provider =
      modeler.get(
        'bpmnPropertiesProvider'
      )


    const observations =
      CONTEXTS.map(
        definition =>
          inspectContext(
            provider,
            registry,
            definition
          )
      )


    const report = {
      probeVersion:
        3,

      status:
        observations.every(
          item =>
            item.status ===
            'OBSERVED'
        )
          ? 'GREEN'
          : 'RED',

      provider:
        'bpmnPropertiesProvider',

      observations
    }


    output.textContent =
      JSON.stringify(
        report,
        null,
        2
      )


    window.__BPMNSM_BPMN_NATIVE_PROBE__ =
      report


    console.log(
      '[BPMNSM BPMN NATIVE PROBE V3]',
      report
    )

  } catch (error) {

    const report = {
      probeVersion:
        3,

      status:
        'RED',

      error:
        error?.stack ||
        error?.message ||
        String(error)
    }


    output.textContent =
      JSON.stringify(
        report,
        null,
        2
      )


    window.__BPMNSM_BPMN_NATIVE_PROBE__ =
      report


    console.error(
      '[BPMNSM BPMN NATIVE PROBE V3]',
      error
    )
  }
}


run()
