import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

function findDescriptor() {
  let current = path.dirname(
    require.resolve('bpmn-moddle')
  )

  while (current !== path.dirname(current)) {
    const candidate = path.join(
      current,
      'resources',
      'bpmn',
      'json',
      'bpmn.json'
    )

    if (fs.existsSync(candidate)) {
      return candidate
    }

    current = path.dirname(current)
  }

  throw new Error('bpmn-moddle BPMN descriptor not found')
}

function classify(property, enumNames) {
  if (property.isMany) {
    return 'collection'
  }

  if (property.isReference) {
    return 'reference'
  }

  if (
    property.type === 'Expression' ||
    property.type?.endsWith('Expression')
  ) {
    return 'expression'
  }

  if (
    [ 'String', 'Boolean', 'Integer', 'Real' ]
      .includes(property.type) ||
    enumNames.has(property.type)
  ) {
    return 'scalar'
  }

  return 'complex'
}

function buildEffectiveProperties(descriptor) {
  const types = new Map(
    descriptor.types.map(type => [
      type.name,
      type
    ])
  )

  const enumNames = new Set(
    (descriptor.enumerations || [])
      .map(item => item.name)
  )

  const cache = new Map()

  function resolve(typeName, stack = []) {
    if (cache.has(typeName)) {
      return cache.get(typeName)
    }

    if (stack.includes(typeName)) {
      throw new Error(
        `Cyclic BPMN inheritance: ${
          [ ...stack, typeName ].join(' -> ')
        }`
      )
    }

    const type = types.get(typeName)

    if (!type) {
      return []
    }

    const inherited = (
      type.superClass || []
    ).flatMap(parent =>
      resolve(
        parent,
        [ ...stack, typeName ]
      ).map(property => ({
        ...property,
        inherited: true
      }))
    )

    const own = (
      type.properties || []
    ).map(property => ({
      property: property.name,
      owner: `bpmn:${typeName}`,
      propertyType: property.type || '',
      shape: classify(property, enumNames),
      isMany: Boolean(property.isMany),
      isReference: Boolean(property.isReference),
      isAttr: Boolean(property.isAttr),
      serialization:
        property.isAttr
          ? 'attribute'
          : property.xml?.serialize || 'element',
      inherited: false
    }))

    const ownNames =
      new Set(own.map(item => item.property))

    const inheritedUnique = []
    const inheritedKeys = new Set()

    for (const item of inherited) {
      if (ownNames.has(item.property)) {
        continue
      }

      const key =
        `${item.owner}::${item.property}`

      if (inheritedKeys.has(key)) {
        continue
      }

      inheritedKeys.add(key)
      inheritedUnique.push(item)
    }

    const effective = [
      ...inheritedUnique,
      ...own
    ]

    cache.set(typeName, effective)

    return effective
  }

  return descriptor.types.flatMap(type =>
    resolve(type.name).map(property => ({
      type: `bpmn:${type.name}`,
      ...property
    }))
  )
}

const descriptorPath = findDescriptor()

const descriptor = JSON.parse(
  fs.readFileSync(descriptorPath, 'utf8')
)

const properties =
  buildEffectiveProperties(descriptor)

const rows = properties.map(item => ({
  standard: 'BPMN',
  type: item.type,
  property: item.property,
  owner: item.owner,
  propertyType: item.propertyType,
  shape: item.shape,
  inherited: item.inherited,
  isMany: item.isMany,
  isReference: item.isReference,
  serialization: item.serialization
}))

const ownerDeclarations =
  new Map()

for (const row of rows) {
  const key =
    `${row.owner}::${row.property}`

  if (!ownerDeclarations.has(key)) {
    ownerDeclarations.set(key, row)
  }
}

const uniqueOwnerRows =
  [ ...ownerDeclarations.values() ]

const columns = [
  'standard',
  'type',
  'property',
  'owner',
  'propertyType',
  'shape',
  'inherited',
  'isMany',
  'isReference',
  'serialization'
]

console.log(columns.join('\t'))

for (const row of rows) {
  console.log(
    columns.map(column =>
      String(row[column] ?? '')
        .replaceAll('\t', ' ')
        .replaceAll('\n', ' ')
    ).join('\t')
  )
}

console.error(
  JSON.stringify({
    descriptor: descriptorPath,
    types: descriptor.types.length,
    enumerations:
      descriptor.enumerations?.length || 0,
    effectivePropertyRows: rows.length,
    uniqueOwnerPropertyDeclarations:
      uniqueOwnerRows.length,
    uniqueByShape: {
      scalar:
        uniqueOwnerRows.filter(
          x => x.shape === 'scalar'
        ).length,
      reference:
        uniqueOwnerRows.filter(
          x => x.shape === 'reference'
        ).length,
      collection:
        uniqueOwnerRows.filter(
          x => x.shape === 'collection'
        ).length,
      expression:
        uniqueOwnerRows.filter(
          x => x.shape === 'expression'
        ).length,
      complex:
        uniqueOwnerRows.filter(
          x => x.shape === 'complex'
        ).length
    },
    effectiveByShape: {
      scalar:
        rows.filter(x => x.shape === 'scalar').length,
      reference:
        rows.filter(x => x.shape === 'reference').length,
      collection:
        rows.filter(x => x.shape === 'collection').length,
      expression:
        rows.filter(x => x.shape === 'expression').length,
      complex:
        rows.filter(x => x.shape === 'complex').length
    }
  })
)


/* OFFICIAL_PROVIDER_MATRIX_V1 */

function inspectOfficialBpmnProvider() {
  const packageJsonPath =
    require.resolve(
      'bpmn-js-properties-panel/package.json'
    )

  const packageRoot =
    path.dirname(packageJsonPath)

  const mapPath =
    path.join(
      packageRoot,
      'dist',
      'index.esm.js.map'
    )

  const sourceMap =
    JSON.parse(
      fs.readFileSync(mapPath, 'utf8')
    )

  const sources =
    sourceMap.sources.map(
      (source, index) => ({
        source,
        content:
          sourceMap.sourcesContent[index] || ''
      })
    )

  const provider =
    sources.find(
      row =>
        row.source ===
        '../src/provider/bpmn/BpmnPropertiesProvider.js'
    )

  if (!provider) {
    throw new Error(
      'BpmnPropertiesProvider source not found'
    )
  }

  const modules =
    sources.filter(
      row =>
        row.source.startsWith(
          '../src/provider/bpmn/properties/'
        )
    )

  const rows = []

  for (const module of modules) {
    const moduleName =
      path.basename(
        module.source,
        '.js'
      )

    const entryIds = [
      ...module.content.matchAll(
        /\bid\s*:\s*['"]([^'"]+)['"]/g
      )
    ].map(match => match[1])

    const bpmnTypes = [
      ...new Set(
        [
          ...module.content.matchAll(
            /['"](bpmn:[A-Za-z0-9_]+)['"]/g
          )
        ].map(match => match[1])
      )
    ]

    const directProperties = [
      ...new Set(
        [
          ...module.content.matchAll(
            /\.get\(\s*['"]([^'"]+)['"]\s*\)/g
          )
        ].map(match => match[1])
      )
    ]

    const updateProperties = [
      ...new Set(
        [
          ...module.content.matchAll(
            /(?:updateProperties|properties\s*:)\s*(?:\([^,]+,\s*)?\{([\s\S]*?)\}/g
          )
        ].flatMap(match =>
          [
            ...match[1].matchAll(
              /\b([A-Za-z_$][\w$]*)\s*:/g
            )
          ].map(propertyMatch =>
            propertyMatch[1]
          )
        )
      )
    ]

    rows.push({
      module: moduleName,
      source: module.source,
      entryIds,
      bpmnTypes,
      directProperties,
      updateProperties
    })
  }

  return {
    sourceMap: mapPath,
    providerSource: provider.source,
    modules: rows
  }
}

const officialProvider =
  inspectOfficialBpmnProvider()

const officialTsv = [
  [
    'provider',
    'module',
    'entryIds',
    'bpmnTypes',
    'directProperties',
    'updatedProperties',
    'source'
  ].join('\t'),

  ...officialProvider.modules.map(
    row => [
      'bpmn-js-properties-panel',
      row.module,
      row.entryIds.join(','),
      row.bpmnTypes.join(','),
      row.directProperties.join(','),
      row.updateProperties.join(','),
      row.source
    ].join('\t')
  )
].join('\n')

fs.writeFileSync(
  'test/evidence/bpmn-native-properties/bpmn-official-properties-provider.tsv',
  officialTsv + '\n'
)

console.error(
  JSON.stringify({
    officialProviderSourceMap:
      officialProvider.sourceMap,
    officialProviderModules:
      officialProvider.modules.length,
    officialProviderMatrix:
      'test/evidence/bpmn-native-properties/bpmn-official-properties-provider.tsv'
  })
)

/* BPMN_JS_TYPE_REFERENCES_V1 */

function inspectBpmnJsTypeReferences(descriptor) {
  const packageJsonPath =
    require.resolve('bpmn-js/package.json')

  const packageRoot =
    path.dirname(packageJsonPath)

  const featuresRoot =
    path.join(packageRoot, 'lib', 'features')

  const descriptorTypes =
    new Set(
      descriptor.types.map(
        type => `bpmn:${type.name}`
      )
    )

  const referencedBy = new Map()

  function walk(directory) {
    let entries = []

    try {
      entries =
        fs.readdirSync(
          directory,
          { withFileTypes: true }
        )
    } catch {
      return
    }

    for (const entry of entries) {
      const full =
        path.join(directory, entry.name)

      if (entry.isDirectory()) {
        walk(full)
        continue
      }

      if (
        !entry.isFile() ||
        !entry.name.endsWith('.js')
      ) {
        continue
      }

      const content =
        fs.readFileSync(full, 'utf8')

      const matches =
        content.match(
          /bpmn:[A-Za-z][A-Za-z0-9_]*/g
        ) || []

      for (const qname of matches) {
        if (!descriptorTypes.has(qname)) {
          continue
        }

        if (!referencedBy.has(qname)) {
          referencedBy.set(
            qname,
            new Set()
          )
        }

        referencedBy
          .get(qname)
          .add(
            path.relative(
              packageRoot,
              full
            )
          )
      }
    }
  }

  walk(featuresRoot)

  return descriptor.types
    .map(type => {
      const qname =
        `bpmn:${type.name}`

      const files =
        referencedBy.get(qname) ||
        new Set()

      return {
        type: qname,
        bpmnJsReferenced:
          files.size > 0,
        referenceCount:
          files.size,
        files:
          [ ...files ].sort()
      }
    })
    .sort(
      (a, b) =>
        a.type.localeCompare(b.type)
    )
}

const bpmnJsTypeReferences =
  inspectBpmnJsTypeReferences(descriptor)

const bpmnJsTypeColumns = [
  'type',
  'bpmnJsReferenced',
  'referenceCount',
  'files'
]

const bpmnJsTypeTsv = [
  bpmnJsTypeColumns.join('\t'),

  ...bpmnJsTypeReferences.map(
    row =>
      [
        row.type,
        row.bpmnJsReferenced,
        row.referenceCount,
        row.files.join(',')
      ].join('\t')
  )
].join('\n')

fs.writeFileSync(
  'test/evidence/bpmn-native-properties/bpmn-js-type-references.tsv',
  bpmnJsTypeTsv + '\n'
)

console.error(
  JSON.stringify({
    bpmnJsDescriptorTypes:
      bpmnJsTypeReferences.length,

    bpmnJsReferencedTypes:
      bpmnJsTypeReferences.filter(
        row => row.bpmnJsReferenced
      ).length,

    bpmnJsUnreferencedTypes:
      bpmnJsTypeReferences.filter(
        row => !row.bpmnJsReferenced
      ).length,

    bpmnJsTypeReferenceMatrix:
      'test/evidence/bpmn-native-properties/bpmn-js-type-references.tsv'
  })
)

/* BPMN_NATIVE_PROPERTIES_STATIC_EVIDENCE */

function buildNativePropertiesStaticEvidence(
  uniqueOwnerRows,
  bpmnJsTypeReferences,
  officialProvider
) {
  const bpmnJsByType =
    new Map(
      bpmnJsTypeReferences.map(
        row => [ row.type, row ]
      )
    )

  return uniqueOwnerRows
    .map(row => {
      const bpmnJs =
        bpmnJsByType.get(row.owner)

      const evidence =
        officialProvider.modules
          .map(module => {
            const typeMatch =
              module.bpmnTypes.includes(
                row.owner
              )

            const readMatch =
              module.directProperties.includes(
                row.property
              )

            const writeMatch =
              module.updateProperties.includes(
                row.property
              )

            const propertyMatch =
              readMatch || writeMatch

            if (!typeMatch && !propertyMatch) {
              return null
            }

            let strength = 'NONE'

            if (typeMatch && propertyMatch) {
              strength = 'TYPE_AND_PROPERTY'
            } else if (propertyMatch) {
              strength = 'PROPERTY_ONLY'
            } else if (typeMatch) {
              strength = 'TYPE_ONLY'
            }

            const kinds = []

            if (typeMatch) {
              kinds.push('type')
            }

            if (readMatch) {
              kinds.push('read')
            }

            if (writeMatch) {
              kinds.push('write')
            }

            return {
              module: module.module,
              strength,
              kinds
            }
          })
          .filter(Boolean)

      const strong =
        evidence.filter(
          item =>
            item.strength ===
            'TYPE_AND_PROPERTY'
        )

      const propertyOnly =
        evidence.filter(
          item =>
            item.strength ===
            'PROPERTY_ONLY'
        )

      const typeOnly =
        evidence.filter(
          item =>
            item.strength ===
            'TYPE_ONLY'
        )

      let staticEvidence =
        'NONE'

      if (strong.length) {
        staticEvidence =
          'TYPE_AND_PROPERTY'
      } else if (propertyOnly.length) {
        staticEvidence =
          'PROPERTY_ONLY'
      } else if (typeOnly.length) {
        staticEvidence =
          'TYPE_ONLY'
      }

      return {
        standard: 'BPMN',
        owner: row.owner,
        property: row.property,
        propertyType: row.propertyType,
        shape: row.shape,
        isMany: row.isMany,
        isReference: row.isReference,
        serialization: row.serialization,

        bpmnJsReferenced:
          bpmnJs
            ? bpmnJs.bpmnJsReferenced
            : false,

        bpmnJsReferenceCount:
          bpmnJs
            ? bpmnJs.referenceCount
            : 0,

        officialPanelStaticEvidence:
          staticEvidence,

        strongModules:
          strong
            .map(item => item.module)
            .join(','),

        propertyOnlyModules:
          propertyOnly
            .map(item => item.module)
            .join(','),

        typeOnlyModules:
          typeOnly
            .map(item => item.module)
            .join(','),

        evidenceDetail:
          evidence
            .map(item =>
              `${item.module}:${
                item.strength
              }:${
                item.kinds.join('+')
              }`
            )
            .join(','),

        officialPanelSupport:
          'UNDETERMINED'
      }
    })
    .sort((a, b) =>
      (
        a.owner +
        '\u0000' +
        a.property
      ).localeCompare(
        b.owner +
        '\u0000' +
        b.property
      )
    )
}

const staticEvidenceMatrix =
  buildNativePropertiesStaticEvidence(
    uniqueOwnerRows,
    bpmnJsTypeReferences,
    officialProvider
  )

const staticEvidenceColumns = [
  'standard',
  'owner',
  'property',
  'propertyType',
  'shape',
  'isMany',
  'isReference',
  'serialization',
  'bpmnJsReferenced',
  'bpmnJsReferenceCount',
  'officialPanelStaticEvidence',
  'strongModules',
  'propertyOnlyModules',
  'typeOnlyModules',
  'evidenceDetail',
  'officialPanelSupport'
]

const staticEvidenceTsv = [
  staticEvidenceColumns.join('\t'),

  ...staticEvidenceMatrix.map(
    row =>
      staticEvidenceColumns
        .map(column =>
          String(row[column] ?? '')
            .replaceAll('\t', ' ')
            .replaceAll('\n', ' ')
        )
        .join('\t')
  )
].join('\n')

fs.writeFileSync(
  'test/evidence/bpmn-native-properties/bpmn-native-properties-static-evidence.tsv',
  staticEvidenceTsv + '\n'
)

const evidenceCounts = {}

for (const row of staticEvidenceMatrix) {
  const key =
    row.officialPanelStaticEvidence

  evidenceCounts[key] =
    (evidenceCounts[key] || 0) + 1
}

console.error(
  JSON.stringify({
    staticEvidenceRows:
      staticEvidenceMatrix.length,
    staticEvidence:
      evidenceCounts,
    officialPanelSupport:
      'UNDETERMINED_FOR_ALL_ROWS',
    staticEvidenceMatrix:
      'test/evidence/bpmn-native-properties/bpmn-native-properties-static-evidence.tsv'
  })
)
