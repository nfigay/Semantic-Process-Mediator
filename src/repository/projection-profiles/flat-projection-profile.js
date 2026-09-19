/*
 * BPMNSM Flat Environment Projection Profile
 *
 * Responsibility:
 *
 *   Provide a minimal alternative Environment projection policy
 *   used to demonstrate that ProjectionProfile is a genuine
 *   projection strategy.
 *
 * The profile intentionally introduces no new business semantics.
 *
 * It projects the same RepositoryModel without contextualizing
 * Processes under Collaborations.
 */


export const flatProjectionProfile = {

  id:
    'flat',

  label:
    'Flat',

  rootComponentTypes: [
    'collaboration',
    'process'
  ],

  contextualizeProcessesUnderCollaborations:
    false,

  collaborationProcessContext: {},

  preferCollaborationContextOverDirectCocMembership:
    false
}
