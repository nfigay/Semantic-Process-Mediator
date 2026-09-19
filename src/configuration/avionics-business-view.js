import {
  normalizeBusinessView
} from './business-view.js'


const AVIONICS_NAMESPACE =
  'urn:semarch:test:coc-avionics'


export const avionicsBusinessView =
  normalizeBusinessView({

    id:
      'avionics',

    version:
      '1.0',

    stakeholderRef:
      'CoC_Avionics',

    projections: [
      {
        typeRef:
          'PAF_Deliverable',

        propertyRefs: [
          `${AVIONICS_NAMESPACE}#PAFDeliverableType.domain`,
          `${AVIONICS_NAMESPACE}#PAFDeliverableType.isKID`,
          `${AVIONICS_NAMESPACE}#PAFDeliverableType.isProcessIO`,
          `${AVIONICS_NAMESPACE}#PAFDeliverableType.template`
        ]
      },
      {
        typeRef:
          'PAF_Document',

        propertyRefs: [
          `${AVIONICS_NAMESPACE}#PAFDocumentType.URL`,
          `${AVIONICS_NAMESPACE}#PAFDocumentType.domain`
        ]
      }
    ]
  })
