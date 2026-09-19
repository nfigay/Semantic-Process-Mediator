import {
  BpmnModdle
} from 'bpmn-moddle'

import semarchModdle
  from '../extensions/semarch.json'


function createModdle() {

  return new BpmnModdle({
    semarch:
      semarchModdle
  })
}


function readExtensionValues(
  element
) {

  return (
    element
      ?.extensionElements
      ?.values ||
    []
  )
}


function readSemanticTypeRefs(
  element
) {

  return readExtensionValues(
    element
  )
    .filter(
      value =>
        value?.$type ===
          'semarch:SemanticType'
    )
    .map(
      semanticType =>
        semanticType.ref
    )
    .filter(Boolean)
}


function isPublishedDataProperty({
  profileRuntime,
  semanticTypeRefs,
  dataProperty
}) {

  return Boolean(
    profileRuntime.resolveProperty({
      semanticTypes:
        semanticTypeRefs,

      propertyRef:
        dataProperty.propertyRef ||
        null
    })
  )
}


function projectExtensionValues({
  element,
  profileRuntime
}) {

  const extensionElements =
    element?.extensionElements


  if (
    !extensionElements ||
    !Array.isArray(
      extensionElements.values
    )
  ) {

    return
  }


  const semanticTypeRefs =
    readSemanticTypeRefs(
      element
    )


  extensionElements.values =
    extensionElements.values.filter(
      value => {

        if (
          value?.$type !==
            'semarch:DataProperty'
        ) {

          return true
        }


        return isPublishedDataProperty({
          profileRuntime,
          semanticTypeRefs,
          dataProperty:
            value
        })
      }
    )
}


export async function publishBpmnXml({
  sourceXml,
  profileRuntime
} = {}) {

  if (
    typeof sourceXml !==
      'string' ||
    !sourceXml.trim()
  ) {

    throw new Error(
      'BPMN publication requires sourceXml'
    )
  }


  if (
    !profileRuntime ||
    typeof profileRuntime.resolveProperty !==
      'function'
  ) {

    throw new Error(
      'BPMN publication requires profileRuntime'
    )
  }


  const moddle =
    createModdle()


  const imported =
    await moddle.fromXML(
      sourceXml
    )


  for (
    const element
    of Object.values(
      imported.elementsById ||
      {}
    )
  ) {

    projectExtensionValues({
      element,
      profileRuntime
    })
  }


  const serialized =
    await moddle.toXML(
      imported.rootElement,
      {
        format:
          true
      }
    )


  return serialized.xml
}
