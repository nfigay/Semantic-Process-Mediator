/*
 * ------------------------------------------------------------
 * SemArch - ARIS Adapter
 * ------------------------------------------------------------
 *
 * Platform adapter for ARIS.
 *
 * This first version only declares:
 *
 * - platform identity
 * - platform capabilities
 *
 * ARIS identity mapping is intentionally not implemented yet.
 *
 * The exact behavior of ARIS identifiers must be established
 * through interoperability and round-trip tests before SemArch
 * defines import/export identity rules.
 * ------------------------------------------------------------
 */


/*
 * ------------------------------------------------------------
 * ARIS Adapter
 * ------------------------------------------------------------
 */

export const arisAdapter = {

  id:
    'aris',

  name:
    'ARIS',


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
      false,

    metadata:
      true
  }
}