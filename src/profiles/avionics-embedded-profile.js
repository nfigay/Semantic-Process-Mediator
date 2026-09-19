import avionicsProfile
  from '../tests/profiles/avionics-profile.json'

import avionicsXsdSource
  from '../tests/schemas/coc-avionics-test.xsd?raw'

import {
  createEmbeddedProfileRuntime
} from './embedded-profile-runtime.js'

import {
  XsdSchemaAdapter
} from '../schemas/xsd-schema-adapter.js'


const AVIONICS_XSD_SOURCE_REF =
  '../schemas/coc-avionics-test.xsd'


const embeddedSources = {

  [AVIONICS_XSD_SOURCE_REF]:
    avionicsXsdSource
}


export async function createAvionicsProfileRuntime() {

  return createEmbeddedProfileRuntime({

    profileSource:
      avionicsProfile,

    sources:
      embeddedSources,

    adapters: [
      new XsdSchemaAdapter()
    ]
  })
}
