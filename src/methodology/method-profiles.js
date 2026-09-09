/**
 * Methodological profiles.
 *
 * A profile identifies a versioned modelling method.
 *
 * Important:
 * - profiles are NOT duplicated per BPMN model;
 * - profiles are NOT duplicated per user;
 * - a BPMN model only stores the profile ID/version
 *   that was effectively applied to it.
 *
 * Rule activation remains handled separately.
 */


export const METHOD_PROFILES = {

  'semarch-core': {

    id:
      'semarch-core',

    version:
      '1.0.1',

    name:
      'SemArch BPMN Core',

    description:
      'Common SemArch BPMN modelling method shared by all Centres of Competence.',

    appliesToCocs:
      '*',

    supportedMaturities: [
      'L1',
      'L2',
      'L3',
      'L4'
    ]
  },


  'avionics-standard': {

    id:
      'avionics-standard',

    version:
      '1.0.0',

    name:
      'Avionics BPMN Method',

    description:
      'Avionics-specific extension of the common SemArch BPMN modelling method.',

    extends:
      'semarch-core',

    appliesToCocs: [
      'CoC_Avionics'
    ],

    supportedMaturities: [
      'L1',
      'L2',
      'L3',
      'L4'
    ]
  }

}


/**
 * Return the methodological profile applicable
 * to a repository/model context.
 *
 * For now:
 *
 * CoC_Avionics -> avionics-standard
 * everything else -> semarch-core
 *
 * This mapping is deliberately simple.
 */
export function resolveMethodProfile({
  cocOwner
} = {}) {

  if (
    cocOwner ===
    'CoC_Avionics'
  ) {
    return METHOD_PROFILES[
      'avionics-standard'
    ]
  }


  return METHOD_PROFILES[
    'semarch-core'
  ]
}