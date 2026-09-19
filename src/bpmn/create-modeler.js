import BpmnModeler from 'bpmn-js/lib/Modeler'

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule
} from 'bpmn-js-properties-panel'

import lintModule
  from 'bpmn-js-bpmnlint'

import 'bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css'

import * as bpmnlintConfig
  from '../linting/bpmnlint-packed-config.js'

import semarchModdle
  from '../extensions/semarch.json'

import stableGuidCreationModule
  from '../identity/stable-guid-creation-module.js'

import dataStoreReferenceCreationModule
  from './data-store-reference-creation-module.js'

import dataStoreOccurrenceContextPadModule
  from './data-store-occurrence-context-pad-module.js'

import semarchPropertiesProviderModule
  from '../properties/semarch-properties-provider.js'

import {
  createActiveProfileRuntime
} from '../profiles/active-profile-runtime.js'

import {
  createActiveBusinessView
} from '../configuration/active-business-view.js'


function createProfileRuntimeModule(
  profileRuntime
) {

  return {

    activeProfileRuntime: [
      'value',
      createActiveProfileRuntime(
        profileRuntime
      )
    ]
  }
}


function createBusinessViewModule(
  businessView
) {

  return {

    activeBusinessView: [
      'value',
      createActiveBusinessView(
        businessView
      )
    ]
  }
}


function createRepositoryContextModule(
  readRepositoryContext,
  getModeler
) {

  return {

    readRepositoryContext: [
      'value',
      () => {

        const modeler =
          getModeler?.() ||
          null


        if (
          !modeler ||
          !readRepositoryContext
        ) {

          return {}
        }


        return (
          readRepositoryContext(
            modeler
          ) ||
          {}
        )
      }
    ]
  }
}


function createBusinessObjectModule(
  businessObjectStore,
  businessObjectRepresentationActions,
  businessObjectNavigationActions
) {

  return {

    businessObjectStore: [
      'value',
      businessObjectStore
    ],

    businessObjectRepresentationActions: [
      'value',
      businessObjectRepresentationActions
    ],

    businessObjectNavigationActions: [
      'value',
      businessObjectNavigationActions
    ]
  }
}


export function createModeler({
  container = '#bpmn-canvas',
  propertiesPanel = '#bpmn-props',
  profileRuntime = null,
  businessView = null,
  readRepositoryContext = null,
  businessObjectStore = null,
  businessObjectRepresentationActions = null,
  businessObjectNavigationActions = null
} = {}) {

  let modeler =
    null


  modeler =
    new BpmnModeler({

    container,

    propertiesPanel: {
      parent:
        propertiesPanel
    },

    linting: {
      bpmnlint:
        bpmnlintConfig,

      active:
        true
    },

    additionalModules: [
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
      lintModule,
      stableGuidCreationModule,
      dataStoreReferenceCreationModule,
      dataStoreOccurrenceContextPadModule,
      createProfileRuntimeModule(
        profileRuntime
      ),
      createBusinessViewModule(
        businessView
      ),
      createRepositoryContextModule(
        readRepositoryContext,
        () => modeler
      ),
      createBusinessObjectModule(
        businessObjectStore,
        businessObjectRepresentationActions,
        businessObjectNavigationActions
      ),
      semarchPropertiesProviderModule
    ],

    moddleExtensions: {
      semarch:
        semarchModdle
    }
  })


  return modeler
}
