import {
  normalizeCocConfiguration
} from './coc-configuration.js'


export const avionicsCocConfiguration =
  normalizeCocConfiguration({

    id:
      'CoC_Avionics',

    label:
      'CoC Avionics',

    profileRef:
      'avionics',

    publicationRef:
      null,

    defaultMaturity:
      'L2'
  })
