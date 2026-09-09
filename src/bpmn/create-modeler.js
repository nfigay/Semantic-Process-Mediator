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


export function createModeler({
  container = '#bpmn-canvas',
  propertiesPanel = '#bpmn-props'
} = {}) {

  return new BpmnModeler({

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
      stableGuidCreationModule
    ],

    moddleExtensions: {
      semarch:
        semarchModdle
    }
  })
}