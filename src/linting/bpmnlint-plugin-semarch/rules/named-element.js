const APPLIES_TO = [
  'bpmn:Task',
  'bpmn:UserTask',
  'bpmn:ServiceTask',
  'bpmn:ManualTask',
  'bpmn:BusinessRuleTask',
  'bpmn:ScriptTask',
  'bpmn:CallActivity',
  'bpmn:SubProcess',

  'bpmn:ExclusiveGateway',
  'bpmn:InclusiveGateway',
  'bpmn:ParallelGateway',
  'bpmn:EventBasedGateway',
  'bpmn:ComplexGateway',

  'bpmn:StartEvent',
  'bpmn:EndEvent',
  'bpmn:IntermediateCatchEvent',
  'bpmn:IntermediateThrowEvent',
  'bpmn:BoundaryEvent',

  'bpmn:DataObjectReference',
  'bpmn:DataStoreReference'
]


export default function() {

  function check(
    node,
    reporter
  ) {

    if (
      !APPLIES_TO.includes(
        node.$type
      )
    ) {
      return
    }


    if (
      !node.name ||
      node.name.trim() === ''
    ) {

      const type =
        node.$type.replace(
          'bpmn:',
          ''
        )


      reporter.report(
        node.id,

        `${type} "${node.id}" has no name — ` +
        'unnamed elements break traceability'
      )
    }
  }


  return {
    check
  }
}