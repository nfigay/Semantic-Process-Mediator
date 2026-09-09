import BpmnNavigatedViewer
  from 'bpmn-js/lib/NavigatedViewer'

import lintModule
  from 'bpmn-js-bpmnlint'

import 'bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css'

import * as bpmnlintConfig
  from '../linting/bpmnlint-packed-config.js'

import semarchModdle
  from '../extensions/semarch.json'


export function createViewer({
  container = '#bpmn-canvas'
} = {}) {

  return new BpmnNavigatedViewer({

    container,

    linting: {

      bpmnlint:
        bpmnlintConfig,

      active:
        true
    },

    additionalModules: [
      lintModule
    ],

    moddleExtensions: {

      semarch:
        semarchModdle
    }
  })
}