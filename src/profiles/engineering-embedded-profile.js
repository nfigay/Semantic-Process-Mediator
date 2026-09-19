import engineeringProfile
  from '../tests/profiles/engineering-profile.json'

import engineeringXsdSource
  from '../tests/schemas/coc-engineering-test.xsd?raw'

import {
  createEmbeddedProfileRuntime
} from './embedded-profile-runtime.js'

import {
  XsdSchemaAdapter
} from '../schemas/xsd-schema-adapter.js'


/*
 * ------------------------------------------------------------
 * Engineering bundled profile
 *
 * Distribution configuration only.
 *
 * The BPMNSM Core remains independent from Engineering.
 *
 * Vite embeds:
 *
 *   - the BPMNSM profile JSON
 *   - the external XSD source
 *
 * into the generated application bundle.
 *
 * No runtime transport is required:
 *
 *   - no fetch
 *   - no filesystem
 *   - no server
 * ------------------------------------------------------------
 */


const ENGINEERING_XSD_SOURCE_REF =
  '../schemas/coc-engineering-test.xsd'


const embeddedSources = {

  [ENGINEERING_XSD_SOURCE_REF]:
    engineeringXsdSource
}


/*
 * ------------------------------------------------------------
 * Public factory
 * ------------------------------------------------------------
 */

export async function createEngineeringProfileRuntime() {

  return createEmbeddedProfileRuntime({

    profileSource:
      engineeringProfile,

    sources:
      embeddedSources,

    adapters: [
      new XsdSchemaAdapter()
    ]
  })
}