import { DOMParser } from '@xmldom/xmldom'

import {
  SchemaAdapter,
  createNormalizedSchema,
  createNormalizedType,
  createNormalizedProperty
} from './schema-adapter.js'

import {
  createDataTypeRef
} from '../model/datatype-ref.js'

import {
  XSD_NAMESPACE,
  resolveRuntimeDatatype
} from '../model/datatype-runtime.js'


export class XsdSchemaAdapter extends SchemaAdapter {

  getTechnology() {
    return 'XSD'
  }


  getSpecification() {
    return '1.0'
  }


  getCapabilities() {
    return [
      'complexType',
      'extension',
      'element',
      'simpleDatatype',
      'cardinality'
    ]
  }


  canRead(source) {

    if (
      typeof source !==
      'string'
    ) {
      return false
    }


    return source.includes(
      XSD_NAMESPACE
    )
  }


  async read(source) {

    if (
      !this.canRead(
        source
      )
    ) {

      throw new Error(
        'XsdSchemaAdapter cannot read this source'
      )
    }


    const parser =
      new DOMParser()


    const document =
      parser.parseFromString(
        source,
        'application/xml'
      )


    const schemaElement =
      document.documentElement


    if (
      !schemaElement
    ) {

      throw new Error(
        'XsdSchemaAdapter could not parse XML'
      )
    }


    if (
      schemaElement.namespaceURI !==
        XSD_NAMESPACE ||
      schemaElement.localName !==
        'schema'
    ) {

      throw new Error(
        'XsdSchemaAdapter expected an XML Schema document'
      )
    }


    const targetNamespace =
      schemaElement.getAttribute(
        'targetNamespace'
      ) ||
      null


    const namespaces =
      readNamespaces(
        schemaElement
      )


    const declaredComplexTypeIds =
      readDeclaredComplexTypeIds(
        schemaElement,
        targetNamespace
      )


    const types =
      readComplexTypes(
        schemaElement,
        targetNamespace,
        declaredComplexTypeIds
      )


    return createNormalizedSchema({

      id:
        targetNamespace,

      technology:
        this.getTechnology(),

      specification:
        this.getSpecification(),

      source:
        schemaElement,

      namespaces,

      types
    })
  }
}


function readNamespaces(
  schemaElement
) {

  const namespaces =
    {}


  for (
    let index = 0;
    index < schemaElement.attributes.length;
    index += 1
  ) {

    const attribute =
      schemaElement
        .attributes
        .item(
          index
        )


    if (
      attribute.name ===
      'xmlns'
    ) {

      namespaces[''] =
        attribute.value

      continue
    }


    if (
      attribute.prefix ===
      'xmlns'
    ) {

      namespaces[
        attribute.localName
      ] =
        attribute.value
    }
  }


  return namespaces
}


function readDeclaredComplexTypeIds(
  schemaElement,
  targetNamespace
) {

  const result =
    new Set()


  for (
    let index = 0;
    index < schemaElement.childNodes.length;
    index += 1
  ) {

    const child =
      schemaElement
        .childNodes
        .item(
          index
        )


    if (
      !isXsdElement(
        child,
        'complexType'
      )
    ) {

      continue
    }


    const name =
      child.getAttribute(
        'name'
      )


    if (
      !name
    ) {

      continue
    }


    result.add(
      createQualifiedId(
        targetNamespace,
        name
      )
    )
  }


  return result
}


function readComplexTypes(
  schemaElement,
  targetNamespace,
  declaredComplexTypeIds
) {

  const result =
    []


  for (
    let index = 0;
    index < schemaElement.childNodes.length;
    index += 1
  ) {

    const child =
      schemaElement
        .childNodes
        .item(
          index
        )


    if (
      !isXsdElement(
        child,
        'complexType'
      )
    ) {

      continue
    }


    result.push(
      readComplexType(
        child,
        targetNamespace,
        declaredComplexTypeIds
      )
    )
  }


  return result
}


function readComplexType(
  complexTypeElement,
  targetNamespace,
  declaredComplexTypeIds
) {

  const name =
    complexTypeElement.getAttribute(
      'name'
    )


  if (
    !name
  ) {

    throw new Error(
      'Anonymous top-level XSD complexType is not supported'
    )
  }


  const extensionElement =
    findDescendant(
      complexTypeElement,
      'extension'
    )


  const baseType =
    extensionElement
      ? resolveQName(
          extensionElement.getAttribute(
            'base'
          ),
          extensionElement,
          targetNamespace
        )
      : null


  const propertyContainer =
    extensionElement ||
    complexTypeElement


  const properties =
    readProperties(
      propertyContainer,
      targetNamespace,
      name,
      declaredComplexTypeIds
    )


  return createNormalizedType({

    id:
      createQualifiedId(
        targetNamespace,
        name
      ),

    name,

    kind:
      'complexType',

    baseType,

    properties,

    source:
      complexTypeElement
  })
}


function readProperties(
  container,
  targetNamespace,
  ownerTypeName,
  declaredComplexTypeIds
) {

  const result =
    []


  const sequences =
    directChildren(
      container,
      'sequence'
    )


  for (
    const sequence
    of sequences
  ) {

    for (
      let index = 0;
      index < sequence.childNodes.length;
      index += 1
    ) {

      const child =
        sequence
          .childNodes
          .item(
            index
          )


      if (
        !isXsdElement(
          child,
          'element'
        )
      ) {

        continue
      }


      result.push(
        readProperty(
          child,
          targetNamespace,
          ownerTypeName,
          declaredComplexTypeIds
        )
      )
    }
  }


  return result
}


function readProperty(
  element,
  targetNamespace,
  ownerTypeName,
  declaredComplexTypeIds
) {

  const name =
    element.getAttribute(
      'name'
    )


  if (
    !name
  ) {

    throw new Error(
      'XSD element references are not supported yet'
    )
  }


  const nativeDatatype =
    element.getAttribute(
      'type'
    ) ||
    null


  const resolvedType =
    resolveQName(
      nativeDatatype,
      element,
      targetNamespace
    )


  const isObjectProperty =
    declaredComplexTypeIds
      ?.has(
        resolvedType
      ) ||
    false


  const datatypeRef =
    isObjectProperty
      ? null
      : resolveDataTypeRef(
          nativeDatatype,
          element,
          targetNamespace
        )


  const datatype =
    isObjectProperty
      ? null
      : resolveRuntimeDatatype(
          datatypeRef
        )


  const minOccurs =
    parseOccurs(
      element.getAttribute(
        'minOccurs'
      ),
      1
    )


  const maxOccurs =
    parseMaxOccurs(
      element.getAttribute(
        'maxOccurs'
      ),
      1
    )


  return createNormalizedProperty({

    id:
      createQualifiedId(
        targetNamespace,
        `${ownerTypeName}.${name}`
      ),

    name,

    kind:
      isObjectProperty
        ? 'object'
        : 'data',

    datatype,

    nativeDatatype:
      isObjectProperty
        ? null
        : nativeDatatype,

    datatypeRef,

    targetType:
      isObjectProperty
        ? resolvedType
        : null,

    minOccurs,

    maxOccurs,

    source:
      element
  })
}


function resolveDataTypeRef(
  value,
  contextElement,
  targetNamespace
) {

  if (
    !value
  ) {

    return null
  }


  const separatorIndex =
    value.indexOf(
      ':'
    )


  if (
    separatorIndex ===
    -1
  ) {

    return createDataTypeRef({

      namespaceUri:
        targetNamespace,

      localName:
        value
    })
  }


  const prefix =
    value.slice(
      0,
      separatorIndex
    )


  const localName =
    value.slice(
      separatorIndex + 1
    )


  if (
    !prefix ||
    !localName ||
    localName.includes(
      ':'
    )
  ) {

    return createDataTypeRef({

      namespaceUri:
        null,

      localName:
        value
    })
  }


  const namespaceUri =
    contextElement
      ?.lookupNamespaceURI?.(
        prefix
      ) ||
    null


  return createDataTypeRef({

    namespaceUri,

    localName
  })
}


function resolveQName(
  value,
  contextElement,
  targetNamespace
) {

  if (
    !value
  ) {

    return null
  }


  const separatorIndex =
    value.indexOf(
      ':'
    )


  if (
    separatorIndex ===
    -1
  ) {

    return createQualifiedId(
      targetNamespace,
      value
    )
  }


  const prefix =
    value.slice(
      0,
      separatorIndex
    )


  const localName =
    value.slice(
      separatorIndex + 1
    )


  const namespace =
    contextElement
      ?.lookupNamespaceURI?.(
        prefix
      ) ||
    null


  if (
    !namespace
  ) {

    return value
  }


  if (
    namespace ===
    XSD_NAMESPACE
  ) {

    return value
  }


  return createQualifiedId(
    namespace,
    localName
  )
}


function directChildren(
  parent,
  localName
) {

  const result =
    []


  for (
    let index = 0;
    index < parent.childNodes.length;
    index += 1
  ) {

    const child =
      parent
        .childNodes
        .item(
          index
        )


    if (
      isXsdElement(
        child,
        localName
      )
    ) {

      result.push(
        child
      )
    }
  }


  return result
}


function findDescendant(
  parent,
  localName
) {

  const elements =
    parent.getElementsByTagNameNS(
      XSD_NAMESPACE,
      localName
    )


  return elements.length >
    0
      ? elements.item(0)
      : null
}


function isXsdElement(
  element,
  localName
) {

  return (
    element &&
    element.nodeType ===
      1 &&
    element.namespaceURI ===
      XSD_NAMESPACE &&
    element.localName ===
      localName
  )
}


function parseOccurs(
  value,
  defaultValue
) {

  if (
    value === null ||
    value === ''
  ) {

    return defaultValue
  }


  const parsed =
    Number.parseInt(
      value,
      10
    )


  if (
    Number.isNaN(
      parsed
    )
  ) {

    throw new Error(
      `Invalid XSD occurrence value: ${value}`
    )
  }


  return parsed
}


function parseMaxOccurs(
  value,
  defaultValue
) {

  if (
    value === null ||
    value === ''
  ) {

    return defaultValue
  }


  if (
    value ===
    'unbounded'
  ) {

    return 'unbounded'
  }


  return parseOccurs(
    value,
    defaultValue
  )
}


function createQualifiedId(
  namespace,
  localName
) {

  if (
    !namespace
  ) {

    return localName
  }


  return (
    `${namespace}#${localName}`
  )
}