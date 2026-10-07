import {
  describe,
  expect,
  it,
  vi
} from 'vitest'

import {
  createRepositoryMembershipActions
} from './repository-membership-actions.js'


function createHarness({
  withExtensionElements = true
} = {}) {

  const container = {
    id: 'coc-space',
    name: 'Space Engineering'
  }

  const process = {
    id: 'doc::Process_1',
    type: 'process',
    metadata: {
      bpmnId: 'Process_1'
    }
  }

  const references = []

  const repositoryModel = {
    getContainer: id =>
      id === container.id
        ? container
        : null,

    getComponent: id =>
      id === process.id
        ? process
        : null,

    getOutgoingReferences: id =>
      references.filter(
        reference =>
          reference.sourceId === id
      ),

    addReference(reference) {
      references.push(reference)
      return reference
    },

    removeReference(id) {
      const index = references.findIndex(
        reference => reference.id === id
      )

      if (index !== -1) {
        references.splice(index, 1)
      }
    }
  }

  const extensionElements =
    withExtensionElements
      ? {
          $type: 'bpmn:ExtensionElements',
          values: []
        }
      : null

  const definitions = {
    extensionElements
  }

  const moddle = {
    create(type, values = {}) {
      return {
        $type: type,
        ...values
      }
    }
  }

  const modeling = {
    updateModdleProperties: vi.fn(
      (_element, target, properties) => {
        Object.assign(target, properties)
      }
    )
  }

  const rootElement = {
    id: 'Process_1',
    type: 'bpmn:Process'
  }

  const canvas = {
    getRootElement: () => rootElement
  }

  const modeler = {
    getDefinitions: () => definitions,
    get: name =>
      name === 'moddle'
        ? moddle
        : name === 'modeling'
          ? modeling
          : name === 'canvas'
            ? canvas
            : null
  }

  return {
    container,
    process,
    references,
    repositoryModel,
    definitions,
    modeling,
    rootElement,
    modeler
  }
}


describe(
  'repository membership actions persistence',
  () => {

    it(
      'persists an assigned Process as semarch CoC + Membership using the BPMN id',
      () => {

        const harness =
          createHarness()

        const actions =
          createRepositoryMembershipActions({
            repositoryModel:
              harness.repositoryModel,
            modeler:
              harness.modeler
          })

        actions.assignProcessToContainer(
          harness.container.id,
          harness.process.id
        )

        expect(
          harness.definitions
            .extensionElements
            .values
        ).toEqual([
          expect.objectContaining({
            $type: 'semarch:CoC',
            id: 'coc-space',
            name: 'Space Engineering'
          }),
          expect.objectContaining({
            $type: 'semarch:Membership',
            cocRef: 'coc-space',
            componentRef: 'Process_1'
          })
        ])
      }
    )


    it(
      'creates bpmn ExtensionElements when the document has none',
      () => {

        const harness =
          createHarness({
            withExtensionElements: false
          })

        const actions =
          createRepositoryMembershipActions({
            repositoryModel:
              harness.repositoryModel,
            modeler:
              harness.modeler
          })

        actions.assignProcessToContainer(
          harness.container.id,
          harness.process.id
        )

        expect(
          harness.definitions.extensionElements
        ).toEqual(
          expect.objectContaining({
            $type: 'bpmn:ExtensionElements'
          })
        )

        expect(
          harness.modeling
            .updateModdleProperties
        ).toHaveBeenCalledTimes(2)

        expect(
          harness.modeling
            .updateModdleProperties
            .mock.calls
            .every(
              ([ element ]) =>
                element === harness.rootElement
            )
        ).toBe(true)
      }
    )


    it(
      'removes the serialized Membership when unassigned while preserving the CoC',
      () => {

        const harness =
          createHarness()

        const actions =
          createRepositoryMembershipActions({
            repositoryModel:
              harness.repositoryModel,
            modeler:
              harness.modeler
          })

        actions.assignProcessToContainer(
          harness.container.id,
          harness.process.id
        )

        actions.unassignProcessFromContainer(
          harness.container.id,
          harness.process.id
        )

        expect(
          harness.definitions
            .extensionElements
            .values
            .filter(
              value =>
                value.$type ===
                'semarch:Membership'
            )
        ).toEqual([])

        expect(
          harness.definitions
            .extensionElements
            .values
            .some(
              value =>
                value.$type ===
                  'semarch:CoC' &&
                value.id ===
                  harness.container.id
            )
        ).toBe(true)
      }
    )
  }
)
