import fs from 'node:fs'
import path from 'node:path'
import {
  fileURLToPath
} from 'node:url'

import {
  describe,
  expect,
  test
} from 'vitest'

import {
  BpmnModdle
} from 'bpmn-moddle'

import semarchModdle
  from '../extensions/semarch.json'

import {
  createBusinessObjectStore
} from '../model/business-object-store.js'

import {
  createBusinessObjectRepresentationStore
} from '../model/business-object-representation-store.js'

import {
  getBusinessObjectRepresentations,
  projectBusinessObjects,
  projectBusinessObjectRepresentations,
  setBusinessObjects
} from '../extensions/business-objects.js'


const __filename =
  fileURLToPath(
    import.meta.url
  )

const __dirname =
  path.dirname(
    __filename
  )

const BPMN_PATH =
  path.resolve(
    __dirname,
    '../tests/semarch/Simple.bpmn'
  )


function readTestBpmn() {

  return fs.readFileSync(
    BPMN_PATH,
    'utf8'
  )
}


function createModdle() {

  return new BpmnModdle({
    semarch:
      semarchModdle
  })
}


async function importDefinitions(
  moddle,
  xml
) {

  const result =
    await moddle.fromXML(
      xml
    )

  return result.rootElement
}


function createRepositoryModeler(
  moddle,
  definitions
) {

  return {
    get(
      service
    ) {

      if (
        service ===
          'moddle'
      ) {

        return moddle
      }

      return null
    },

    getDefinitions() {

      return definitions
    }
  }
}


describe(
  'Business Object zero-representation BPMN round-trip',
  () => {

    test(
      'preserves a canonical Business Object through save and reopen without creating a representation',
      async () => {

        const sourceXml =
          readTestBpmn()

        /*
         * First repository instance.
         */
        const firstModdle =
          createModdle()

        const firstDefinitions =
          await importDefinitions(
            firstModdle,
            sourceXml
          )

        const firstModeler =
          createRepositoryModeler(
            firstModdle,
            firstDefinitions
          )

        setBusinessObjects(
          firstModeler,
          [
            {
              id:
                'BO-E13-001',
              typeRefs: [
                'PAF_Deliverable',
                'PAF_Document'
              ]
            }
          ]
        )

        expect(
          getBusinessObjectRepresentations(
            firstModeler
          )
        ).toEqual([])

        /*
         * Save the repository as real BPMN XML.
         */
        const serialized =
          await firstModdle.toXML(
            firstDefinitions,
            {
              format:
                true
            }
          )

        expect(
          serialized.xml
        ).toContain(
          'semarch:BusinessObject'
        )

        expect(
          serialized.xml
        ).toContain(
          'BO-E13-001'
        )

        expect(
          serialized.xml
        ).not.toContain(
          'semarch:BusinessObjectRepresentation'
        )

        /*
         * Reopen in a completely new moddle instance.
         */
        const secondModdle =
          createModdle()

        const secondDefinitions =
          await importDefinitions(
            secondModdle,
            serialized.xml
          )

        const secondModeler =
          createRepositoryModeler(
            secondModdle,
            secondDefinitions
          )

        const businessObjectStore =
          createBusinessObjectStore()

        const businessObjectRepresentationStore =
          createBusinessObjectRepresentationStore()

        const projectedBusinessObjects =
          projectBusinessObjects({
            modeler:
              secondModeler,
            businessObjectStore
          })

        const projectedRepresentations =
          projectBusinessObjectRepresentations({
            modeler:
              secondModeler,
            businessObjectStore,
            businessObjectRepresentationStore
          })

        expect(
          projectedBusinessObjects
        ).toEqual([
          {
            id:
              'BO-E13-001',
            typeRefs: [
              'PAF_Deliverable',
              'PAF_Document'
            ]
          }
        ])

        expect(
          businessObjectStore
            .getBusinessObject(
              'BO-E13-001'
            )
        ).toEqual(
          projectedBusinessObjects[0]
        )

        expect(
          projectedRepresentations
        ).toEqual([])

        expect(
          businessObjectRepresentationStore
            .getRepresentations(
              'BO-E13-001'
            )
        ).toEqual([])

        expect(
          getBusinessObjectRepresentations(
            secondModeler
          )
        ).toEqual([])
      }
    )
  }
)
