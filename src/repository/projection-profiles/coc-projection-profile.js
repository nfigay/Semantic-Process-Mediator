/*
 * BPMNSM CoC Environment Projection Profile
 *
 * Responsibility:
 *
 *   Describe the policy of the CoC-oriented Environment projection.
 *
 * The profile is intentionally small.
 *
 * Projection decisions are moved behind this boundary progressively,
 * while createEnvironmentProjection() remains responsible for the
 * generic mechanics of building the runtime projection.
 */


export const cocProjectionProfile = {

  id:
    'coc',

  label:
    'Centres of Competence',

  rootComponentTypes: [
    'collaboration',
    'process'
  ],

  contextualizeProcessesUnderCollaborations:
    true,

  collaborationProcessContext: {

    participantReferenceType:
      'participant',

    processReferenceType:
      'processRef'
  },

  preferCollaborationContextOverDirectCocMembership:
    true
}