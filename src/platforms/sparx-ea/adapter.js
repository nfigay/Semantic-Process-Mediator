/*
 * ------------------------------------------------------------
 * SemArch - Sparx Enterprise Architect Adapter
 * ------------------------------------------------------------
 *
 * Platform adapter for Sparx Enterprise Architect.
 *
 * This first version only declares:
 *
 * - platform identity
 * - platform capabilities
 * - GUID representation helpers
 *
 * BPMN import/export behavior will be added only after
 * round-trip tests with Enterprise Architect.
 * ------------------------------------------------------------
 */

import {
  normalizeGuid
} from '../../identity/guid-generator.js'


/*
 * ------------------------------------------------------------
 * Import EA GUID
 * ------------------------------------------------------------
 *
 * EA commonly represents GUIDs using braces:
 *
 * {550E8400-E29B-41D4-A716-446655440000}
 *
 * SemArch canonical representation:
 *
 * 550e8400-e29b-41d4-a716-446655440000
 * ------------------------------------------------------------
 */

function importGuid(
  value
) {

  return normalizeGuid(
    value
  )
}


/*
 * ------------------------------------------------------------
 * Export EA GUID
 * ------------------------------------------------------------
 */

function exportGuid(
  value
) {

  const guid =
    normalizeGuid(
      value
    )


  if (
    !guid
  ) {

    return null
  }


  return (
    `{${guid.toUpperCase()}}`
  )
}


/*
 * ------------------------------------------------------------
 * Sparx EA Adapter
 * ------------------------------------------------------------
 */

export const sparxEaAdapter = {

  id:
    'sparx-ea',

  name:
    'Sparx Enterprise Architect',


  /*
   * These capabilities describe the intended SemArch
   * integration surface.
   *
   * They do not yet claim complete round-trip support.
   */

  capabilities: {

    bpmn:
      true,

    repository:
      true,

    identity:
      true,

    metadata:
      true
  },


  /*
   * Platform-specific identity representation.
   */

  identity: {

    importGuid,

    exportGuid
  }
}