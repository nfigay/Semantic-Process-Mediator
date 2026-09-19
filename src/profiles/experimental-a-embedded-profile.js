import experimentalProfile
  from '../tests/profiles/experimental-a-profile.json'

import experimentalXsdSource
  from '../tests/schemas/coc-experimental-a-test.xsd?raw'

import {
  createEmbeddedProfileRuntime
} from './embedded-profile-runtime.js'

import {
  XsdSchemaAdapter
} from '../schemas/xsd-schema-adapter.js'


const EXPERIMENTAL_A_XSD_SOURCE_REF =
  '../schemas/coc-experimental-a-test.xsd'


const embeddedSources = {

  [EXPERIMENTAL_A_XSD_SOURCE_REF]:
    experimentalXsdSource
}


export async function createExperimentalAProfileRuntime() {

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
