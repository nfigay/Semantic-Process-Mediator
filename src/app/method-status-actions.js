import {
  resolveMethodStatus
} from '../methodology/resolve-method-status.js'


export function createMethodStatusActions({
  readRepositoryContext,
  getMethodConfiguration,
  modeler
}) {

  function getStatus() {

    const context =
      readRepositoryContext?.() ||
      {}


    const storedConfiguration =
      getMethodConfiguration(
        modeler
      ) || {}


    return resolveMethodStatus({
      context,
      storedConfiguration
    })
  }


  return {
    getStatus
  }
}