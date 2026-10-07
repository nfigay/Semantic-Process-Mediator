import {
  describe,
  expect,
  it
} from 'vitest'

import {
  createRepositoryScopeStore
} from './repository-scope-store.js'

import {
  activateCocProfileRuntime
} from '../profiles/coc-profile-runtime-activation.js'

import {
  createActiveProfileRuntime
} from '../profiles/active-profile-runtime.js'

import {
  resolveEmbeddedProfileRuntime
} from '../profiles/embedded-profile-resolver.js'

import {
  experimentalACocConfiguration
} from '../configuration/experimental-a-coc-configuration.js'

import {
  experimentalBCocConfiguration
} from '../configuration/experimental-b-coc-configuration.js'


const cocConfigurations = [
  experimentalACocConfiguration,
  experimentalBCocConfiguration
]


function seedRepository(
  repository,
  {
    componentName,
    documentContent,
    businessObjectName
  }
) {
  const component =
    repository.model.addComponent({
      id:
        'process-1',

      name:
        componentName
    })

  const document =
    repository.documents.addDocument({
      id:
        'doc-1',

      content:
        documentContent
    })

  repository.documents.setActiveDocument(
    document.id
  )

  const businessObject =
    repository.businessObjectStore
      .addBusinessObject({
        id:
          'BO-1',

        name:
          businessObjectName,

        typeRefs:
          [ 'demo:Application' ]
      })

  const representation =
    repository.businessObjectRepresentationStore
      .attach({
        businessObjectId:
          'BO-1',

        documentId:
          'doc-1',

        representationId:
          'DataStore_1'
      })

  return {
    component,
    document,
    businessObject,
    representation
  }
}


function expectRepositoryState(
  repository,
  expected
) {
  expect(
    repository.model.getComponent(
      'process-1'
    )
  ).toBe(
    expected.component
  )

  expect(
    repository.documents.getDocument(
      'doc-1'
    )
  ).toBe(
    expected.document
  )

  expect(
    repository.documents.getActiveDocument()
  ).toBe(
    expected.document
  )

  expect(
    repository.businessObjectStore
      .getBusinessObject(
        'BO-1'
      )
  ).toBe(
    expected.businessObject
  )

  expect(
    repository.businessObjectRepresentationStore
      .getRepresentations(
        'BO-1'
      )
  ).toEqual([
    expected.representation
  ])
}


describe(
  'Repository scope A -> B -> A coexistence',
  () => {

    it(
      'switches the editor profile A -> B -> A without replacing either autonomous repository scope',
      async () => {

        const scopeStore =
          createRepositoryScopeStore()

        const repositoryA =
          scopeStore.createRepository(
            'repository-a'
          )

        const repositoryB =
          scopeStore.createRepository(
            'repository-b'
          )

        const stateA =
          seedRepository(
            repositoryA,
            {
              componentName:
                'Process A',

              documentContent:
                '<definitions id="A" />',

              businessObjectName:
                'Application A'
            }
          )

        const stateB =
          seedRepository(
            repositoryB,
            {
              componentName:
                'Process B',

              documentContent:
                '<definitions id="B" />',

              businessObjectName:
                'Application B'
            }
          )

        expectRepositoryState(
          repositoryA,
          stateA
        )

        expectRepositoryState(
          repositoryB,
          stateB
        )

        const runtimeA =
          await resolveEmbeddedProfileRuntime({
            profileRef:
              experimentalACocConfiguration.profileRef
          })

        const activeProfileRuntime =
          createActiveProfileRuntime(
            runtimeA
          )

        const activationA1 =
          await activateCocProfileRuntime({
            cocId:
              experimentalACocConfiguration.id,

            cocConfigurations,

            resolveProfileRuntime:
              resolveEmbeddedProfileRuntime,

            activeProfileRuntime
          })

        expect(
          activationA1.profileRuntime.profile.id
        ).toBe(
          'experimental-a'
        )

        expect(
          activeProfileRuntime.get()
        ).toBe(
          activationA1.profileRuntime
        )

        const activationB =
          await activateCocProfileRuntime({
            cocId:
              experimentalBCocConfiguration.id,

            cocConfigurations,

            resolveProfileRuntime:
              resolveEmbeddedProfileRuntime,

            activeProfileRuntime
          })

        expect(
          activationB.profileRuntime.profile.id
        ).toBe(
          'experimental-b'
        )

        expect(
          activeProfileRuntime.get()
        ).toBe(
          activationB.profileRuntime
        )

        expectRepositoryState(
          repositoryA,
          stateA
        )

        expectRepositoryState(
          repositoryB,
          stateB
        )

        const activationA2 =
          await activateCocProfileRuntime({
            cocId:
              experimentalACocConfiguration.id,

            cocConfigurations,

            resolveProfileRuntime:
              resolveEmbeddedProfileRuntime,

            activeProfileRuntime
          })

        expect(
          activationA2.profileRuntime.profile.id
        ).toBe(
          'experimental-a'
        )

        expect(
          activeProfileRuntime.get()
        ).toBe(
          activationA2.profileRuntime
        )

        expectRepositoryState(
          repositoryA,
          stateA
        )

        expectRepositoryState(
          repositoryB,
          stateB
        )

        expect(
          scopeStore.getRepositories()
        ).toEqual([
          repositoryA,
          repositoryB
        ])

        expect(
          repositoryA.model.getComponent(
            'process-1'
          )
        ).not.toBe(
          repositoryB.model.getComponent(
            'process-1'
          )
        )

        expect(
          repositoryA.documents.getDocument(
            'doc-1'
          )
        ).not.toBe(
          repositoryB.documents.getDocument(
            'doc-1'
          )
        )

        expect(
          repositoryA.businessObjectStore
            .getBusinessObject(
              'BO-1'
            )
        ).not.toBe(
          repositoryB.businessObjectStore
            .getBusinessObject(
              'BO-1'
            )
        )
      }
    )
  }
)
