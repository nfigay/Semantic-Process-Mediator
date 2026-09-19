import {
  normalizeCocConfiguration
} from './coc-configuration.js'


export const experimentalACocConfiguration =
  normalizeCocConfiguration({

    id:
      'experimental-a',

    label:
      'Experimental A',

    profileRef:
      'experimental-a',

    publicationRef:
      null,

    defaultMaturity:
      'L2'
  })
