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
  propertiesPanel = '#bpmn-props',
  profileRuntime = null,
  businessView = null,
  readRepositoryContext = null,
  businessObjectStore = null,
  businessObjectRepresentationActions = null,
  businessObjectNavigationActions = null
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
    propertiesPanel,
    profileRuntime,
    businessView,
    readRepositoryContext,
    businessObjectStore,
    businessObjectRepresentationActions,
    businessObjectNavigationActions
  })
}
