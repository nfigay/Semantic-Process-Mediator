import {
  normalizeCocConfiguration
} from './coc-configuration.js'


export const engineeringCocConfiguration =
  normalizeCocConfiguration({

    id:
      'engineering',

    label:
      'Engineering',

    profileRef:
      'engineering',

    publicationRef:
      'engineering',

    defaultMaturity:
      'L2'
  })