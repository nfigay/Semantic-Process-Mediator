import {
  resolveMethodConfiguration
} from '../methodology/resolve-method-configuration.js'


export function createMethodValidationActions({
  modeler,
  linter,

  readRepositoryContext,
  setMethodConfiguration
}) {

  function buildValidatedConfiguration(
    context = {}
  ) {

    const configuration =
      resolveMethodConfiguration(
        context
      )


    return {
      ...configuration,

      validatedAt:
        new Date()
          .toISOString()
          .split('T')[0]
    }
  }


  function hasErrors(
    issues = []
  ) {

    return issues.some(
      issue =>
        issue.severity === 'error'
    )
  }


  function validate() {

    const context =
      readRepositoryContext?.() ||
      {}


    linter.setCoc(
      context.cocOwner ||
      null
    )


    linter.setProfile(
      context.maturity ||
      'L1'
    )


    const issues =
      linter.run() ||
      []


    if (
      hasErrors(
        issues
      )
    ) {

      return {
        status:
          'FAILED',

        validated:
          false,

        configuration:
          null,

        issues
      }
    }


    const configuration =
      buildValidatedConfiguration(
        context
      )


    setMethodConfiguration(
      modeler,
      configuration
    )


    return {
      status:
        'VALIDATED',

      validated:
        true,

      configuration,

      issues
    }
  }


  return {
    validate
  }
}