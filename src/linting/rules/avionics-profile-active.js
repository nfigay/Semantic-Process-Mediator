export const avionicsProfileActiveRule = {
  id: 'semarch/avionics-profile-active',

  name:
    'Avionics lint profile active',

  severity:
    'info',

  appliesTo: [
    'bpmn:Task',
    'bpmn:UserTask',
    'bpmn:ServiceTask',
    'bpmn:ManualTask',
    'bpmn:BusinessRuleTask',
    'bpmn:ScriptTask',
    'bpmn:CallActivity',
    'bpmn:SubProcess'
  ],

  check(element) {

    if (
      !this.appliesTo.includes(
        element.type
      )
    ) {
      return []
    }


    return [{
      rule:
        'semarch/avionics-profile-active',

      severity:
        'error',

      element,

      message:
        'Diagnostic: CoC_Avionics lint rules are active'
    }]
  }
}