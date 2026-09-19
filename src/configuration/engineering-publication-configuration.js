import {
  normalizePublicationConfiguration
} from './publication-configuration.js'


export const engineeringPublicationConfiguration =
  normalizePublicationConfiguration({

    capabilities: {
      utilities:
        false
    }
  })