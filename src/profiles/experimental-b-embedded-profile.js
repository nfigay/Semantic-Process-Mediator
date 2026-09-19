import experimentalProfile
  from '../tests/profiles/experimental-b-profile.json'

import experimentalXsdSource
  from '../tests/schemas/coc-experimental-b-test.xsd?raw'

import {
  createEmbeddedProfileRuntime
} from './embedded-profile-runtime.js'

import {
  XsdSchemaAdapter
} from '../schemas/xsd-schema-adapter.js'


const EXPERIMENTAL_B_XSD_SOURCE_REF =
  '../schemas/coc-experimental-b-test.xsd'


const embeddedSources = {

  [EXPERIMENTAL_B_XSD_SOURCE_REF]:
    experimentalXsdSource
}


export async function createExperimentalBProfileRuntime() {

  return createEmbeddedProfileRuntime({

    profileSource:
      experimentalProfile,

    sources:
      embeddedSources,

    adapters: [
      new XsdSchemaAdapter()
    ]
  })
}
