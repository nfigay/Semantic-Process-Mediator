export function createBpmnlintPanelBridge({
  modeler,
  onResult
}) {

  const eventBus =
    modeler.get(
      'eventBus'
    )

  const elementRegistry =
    modeler.get(
      'elementRegistry'
    )


  function normalizeIssues(
    groupedIssues = {}
  ) {

    const issues = []


    for (
      const [
        displayedElementId,
        elementIssues
      ]
      of Object.entries(
        groupedIssues
      )
    ) {

      for (
        const issue
        of elementIssues
      ) {

        const elementId =
          issue.actualElementId ||
          issue.id ||
          displayedElementId


        const element =
          elementRegistry.get(
            elementId
          ) ||
          elementRegistry.get(
            displayedElementId
          )


        issues.push({

          rule:
            issue.rule,

          severity:
            normalizeSeverity(
              issue.category
            ),

          element,

          elementId,

          elementName:
            element
              ?.businessObject
              ?.name ||
            '',

          message:
            issue.message
        })
      }
    }


    return issues
  }


  function normalizeSeverity(
    category
  ) {

    switch (
      category
    ) {

      case 'error':
        return 'error'

      case 'warn':
        return 'warning'

      case 'info':
        return 'info'

      default:
        return 'warning'
    }
  }


  function onCompleted(
    event
  ) {

    const issues =
      normalizeIssues(
        event.issues
      )


    onResult?.(
      issues
    )
  }


  eventBus.on(
    'linting.completed',
    onCompleted
  )


  return {

    destroy() {

      eventBus.off(
        'linting.completed',
        onCompleted
      )
    }

  }
}