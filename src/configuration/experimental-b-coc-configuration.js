import {
  normalizeCocConfiguration
} from './coc-configuration.js'


export const experimentalBCocConfiguration =
  normalizeCocConfiguration({

    id:
      'experimental-b',

    label:
      'Experimental B',

    profileRef:
      'experimental-b',

    publicationRef:
      null,

    defaultMaturity:
      'L2'
  })
