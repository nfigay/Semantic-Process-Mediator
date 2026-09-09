// ════════════════════════════════════════════════════════════════════════════
// DEFAULT DIAGRAM — Collaboration with two Pools
// ════════════════════════════════════════════════════════════════════════════
export const EMPTY_DIAGRAM = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:semarch="http://semarch.io/schema/1.0"
  targetNamespace="http://semarch.io/repository"
  id="Definitions_Repository">

  <bpmn:extensionElements>
    <semarch:RepositoryContext
      cocOwner=""
      organization=""
      maturity="L1"
      stdRef=""
      targetPlatform="Standalone"
      programContext=""
      repositoryVersion="1.0"
      lastReview=""/>
  </bpmn:extensionElements>

  <bpmn:collaboration id="Collaboration_1">
    <bpmn:participant id="Participant_A" name="System A" processRef="Process_A"/>
    <bpmn:participant id="Participant_B" name="System B" processRef="Process_B"/>
  </bpmn:collaboration>

  <bpmn:process id="Process_A" isExecutable="true">
    <bpmn:startEvent id="Process_A_Start" name="Start"/>
  </bpmn:process>

  <bpmn:process id="Process_B" isExecutable="false">
    <bpmn:startEvent id="Process_B_Start" name="Start"/>
  </bpmn:process>

  <bpmndi:BPMNDiagram id="BPMNDiagram_Collaboration">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_1">
      <bpmndi:BPMNShape id="Participant_A_di" bpmnElement="Participant_A" isHorizontal="true">
        <dc:Bounds x="120" y="80" width="600" height="160"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Process_A_Start_di" bpmnElement="Process_A_Start">
        <dc:Bounds x="200" y="142" width="36" height="36"/>
        <bpmndi:BPMNLabel/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Participant_B_di" bpmnElement="Participant_B" isHorizontal="true">
        <dc:Bounds x="120" y="280" width="600" height="160"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Process_B_Start_di" bpmnElement="Process_B_Start">
        <dc:Bounds x="200" y="342" width="36" height="36"/>
        <bpmndi:BPMNLabel/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`