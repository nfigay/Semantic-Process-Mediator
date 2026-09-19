import ArchimateModeler from 'archimate-js/lib/Modeler'

import 'archimate-js/assets/archimate-js.css'
import 'archimate-js/assets/palette-icons.css'
import 'archimate-font/dist/css/archimate-font.css'

export class ArchimateAdapter {

  constructor(options = {}) {
    this.modeler = new ArchimateModeler(options)
  }

  async createNewModel() {
    return this.modeler.createNewModel()
  }

  async importXML(xml) {
    const result = await this.modeler.importXML(xml)

    await this.modeler.openView()

    return result
  }

  async saveXML(options = {}) {
    return this.modeler.saveXML(options)
  }

  getCanvas() {
    return this.modeler.get('canvas')
  }

  getElementRegistry() {
    return this.modeler.get('elementRegistry')
  }

  onModelChanged(callback) {
    if (
      typeof callback !==
      'function'
    ) {
      throw new Error(
        'ArchimateAdapter.onModelChanged requires a callback'
      )
    }

    const eventBus =
      this.modeler.get('eventBus')

    eventBus.on(
      'commandStack.changed',
      callback
    )

    return () => {
      eventBus.off(
        'commandStack.changed',
        callback
      )
    }
  }

  destroy() {
    this.modeler.destroy()
  }

}
