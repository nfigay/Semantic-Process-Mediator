/*
 * ------------------------------------------------------------
 * SemArch Identity Policy
 * ------------------------------------------------------------
 *
 * Defines which BPMN semantic elements may carry a persistent
 * SemArch identity and which elements currently receive one
 * automatically when created inside SemArch.
 *
 * This module does not generate GUIDs.
 * It does not modify BPMN elements.
 * It does not contain platform-specific identity rules.
 * ------------------------------------------------------------
 */

const SEMANTIC_IDENTITY_TYPES =
  new Set([
    'bpmn:Process',
    'bpmn:Collaboration',
    'bpmn:Participant',
    'bpmn:Lane',
    'bpmn:Task',
    'bpmn:SubProcess',
    'bpmn:CallActivity',
    'bpmn:StartEvent',
    'bpmn:IntermediateCatchEvent',
    'bpmn:IntermediateThrowEvent',
    'bpmn:EndEvent',
    'bpmn:ExclusiveGateway',
    'bpmn:InclusiveGateway',
    'bpmn:ParallelGateway',
    'bpmn:ComplexGateway',
    'bpmn:EventBasedGateway',
    'bpmn:SequenceFlow',
    'bpmn:MessageFlow',
    'bpmn:Association',
    'bpmn:DataObject',
    'bpmn:DataObjectReference',
    'bpmn:DataStore',
    'bpmn:DataStoreReference'
  ])


const AUTO_GENERATED_IDENTITY_TYPES =
  new Set([
    'bpmn:Process',
    'bpmn:Collaboration',
    'bpmn:Participant'
  ])


export function supportsStableGuid(
  bpmnElement
) {
  return (
    Boolean(
      bpmnElement
    )
    && SEMANTIC_IDENTITY_TYPES.has(
      bpmnElement.$type
    )
  )
}


export function shouldGenerateStableGuid(
  bpmnElement
) {
  return (
    Boolean(
      bpmnElement
    )
    && AUTO_GENERATED_IDENTITY_TYPES.has(
      bpmnElement.$type
    )
  )
}