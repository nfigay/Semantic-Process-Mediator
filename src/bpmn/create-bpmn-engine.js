import {
  createModeler
} from './create-modeler.js'

import {
  createViewer
} from './create-viewer.js'

import {
  isViewerMode
} from '../app/app-mode.js'


export function createBpmnEngine({
  mode,
  container = '#bpmn-canvas',
  propertiesPanel = '#bpmn-props'
} = {}) {

  if (
    isViewerMode(
      mode
    )
  ) {

    return createViewer({
      container
    })
  }


  return createModeler({
    container,
    propertiesPanel
  })
}