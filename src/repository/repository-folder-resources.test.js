import {
  describe,
  expect,
  it
} from 'vitest'

import {
  readRepositoryFolderResources
} from './repository-folder-resources.js'


function fileHandle(
  name,
  content
) {

  return {
    kind:
      'file',

    name,

    async getFile() {

      return {
        async text() {

          return content
        }
      }
    }
  }
}


function directoryHandle(
  name,
  entries
) {

  return {
    kind:
      'directory',

    name,

    async *entries() {

      for (
        const entry
        of entries
      ) {

        yield entry
      }
    }
  }
}


describe(
  'Repository folder resources',
  () => {

    it(
      'reads nested folder resources with exact paths, contents, and physical file handles',
      async () => {

        const process =
          fileHandle(
            'order.bpmn',
            '<definitions id="Order" />'
          )

        const architecture =
          fileHandle(
            'landscape.archimate',
            '<model id="Landscape" />'
          )

        const businessModel =
          fileHandle(
            'enterprise.business.json',
            '{"formatVersion":"1","name":"Café"}'
          )


        const root =
          directoryHandle(
            'repository',
            [
              [
                'processes',
                directoryHandle(
                  'processes',
                  [
                    [
                      'order.bpmn',
                      process
                    ]
                  ]
                )
              ],
              [
                'architecture',
                directoryHandle(
                  'architecture',
                  [
                    [
                      'landscape.archimate',
                      architecture
                    ]
                  ]
                )
              ],
              [
                'enterprise.business.json',
                businessModel
              ]
            ]
          )


        const {
          resources,
          fileHandles
        } =
          await readRepositoryFolderResources(
            root
          )


        expect(
          resources
        ).toEqual([
          {
            path:
              'processes/order.bpmn',
            content:
              '<definitions id="Order" />'
          },
          {
            path:
              'architecture/landscape.archimate',
            content:
              '<model id="Landscape" />'
          },
          {
            path:
              'enterprise.business.json',
            content:
              '{"formatVersion":"1","name":"Café"}'
          }
        ])


        expect(
          fileHandles.get(
            'processes/order.bpmn'
          )
        ).toBe(
          process
        )

        expect(
          fileHandles.get(
            'architecture/landscape.archimate'
          )
        ).toBe(
          architecture
        )

        expect(
          fileHandles.get(
            'enterprise.business.json'
          )
        ).toBe(
          businessModel
        )
      }
    )


    it(
      'rejects a read failure instead of returning partially prepared resources',
      async () => {

        const broken =
          {
            kind:
              'file',

            async getFile() {

              throw new Error(
                'physical read failed'
              )
            }
          }


        const root =
          directoryHandle(
            'repository',
            [
              [
                'good.bpmn',
                fileHandle(
                  'good.bpmn',
                  '<good />'
                )
              ],
              [
                'broken.bpmn',
                broken
              ]
            ]
          )


        await expect(
          readRepositoryFolderResources(
            root
          )
        ).rejects.toThrow(
          'physical read failed'
        )
      }
    )


    it(
      'rejects a value that is not a directory handle',
      async () => {

        await expect(
          readRepositoryFolderResources()
        ).rejects.toThrow(
          'Repository folder resources require a directory handle'
        )
      }
    )
  }
)
