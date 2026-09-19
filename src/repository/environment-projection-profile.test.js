import {
  describe,
  expect,
  it
} from 'vitest'

import {
  createRepositoryModel
} from './repository-model.js'

import {
  createEnvironmentProjection
} from './environment-projection.js'

import {
  cocProjectionProfile
} from './projection-profiles/coc-projection-profile.js'

import {
  flatProjectionProfile
} from './projection-profiles/flat-projection-profile.js'


describe(
  'environment projection profile',
  () => {

    it(
      'declares the root component types supported by the CoC profile',
      () => {

        expect(
          cocProjectionProfile
            .rootComponentTypes
        ).toEqual([
          'collaboration',
          'process'
        ])
      }
    )


    it(
      'uses rootComponentTypes to determine root component categories',
      () => {

        const repositoryModel =
          createRepositoryModel()


        repositoryModel.addComponent({

          id:
            'doc-1::Collaboration_A',

          type:
            'collaboration',

          name:
            'Collaboration A',

          documentId:
            'doc-1'
        })


        repositoryModel.addComponent({

          id:
            'doc-1::Process_A',

          type:
            'process',

          name:
            'Process A',

          documentId:
            'doc-1'
        })


        const processOnlyProfile = {

          ...cocProjectionProfile,

          rootComponentTypes: [
            'process'
          ]
        }


        const projection =
          createEnvironmentProjection({

            repositoryModel,

            projectionProfile:
              processOnlyProfile
          })


        expect(
          projection.collaborations
        ).toEqual(
          []
        )


        expect(
          projection.processes.map(
            process =>
              process.id
          )
        ).toEqual([
          'doc-1::Process_A'
        ])
      }
    )


    it(
      'declares Collaboration contextualization for Processes in the CoC profile',
      () => {

        expect(
          cocProjectionProfile
            .contextualizeProcessesUnderCollaborations
        ).toBe(
          true
        )
      }
    )


    it(
      'uses the profile to control Process contextualization under Collaborations',
      () => {

        const repositoryModel =
          createRepositoryModel()


        repositoryModel.addComponent({

          id:
            'doc-1::Collaboration_A',

          type:
            'collaboration',

          name:
            'Collaboration A',

          documentId:
            'doc-1'
        })


        repositoryModel.addComponent({

          id:
            'doc-1::Participant_A',

          type:
            'participant',

          name:
            'Participant A',

          documentId:
            'doc-1'
        })


        repositoryModel.addComponent({

          id:
            'doc-1::Process_A',

          type:
            'process',

          name:
            'Process A',

          documentId:
            'doc-1'
        })


        repositoryModel.addReference({

          id:
            'ref:collaboration:participant',

          type:
            'participant',

          sourceId:
            'doc-1::Collaboration_A',

          targetId:
            'doc-1::Participant_A'
        })


        repositoryModel.addReference({

          id:
            'ref:participant:process',

          type:
            'processRef',

          sourceId:
            'doc-1::Participant_A',

          targetId:
            'doc-1::Process_A'
        })


        const nonContextualProfile = {

          ...cocProjectionProfile,

          contextualizeProcessesUnderCollaborations:
            false
        }


        const projection =
          createEnvironmentProjection({

            repositoryModel,

            projectionProfile:
              nonContextualProfile
          })


        expect(
          projection.collaborations
        ).toHaveLength(
          1
        )


        expect(
          projection
            .collaborations[0]
            .processes
        ).toEqual(
          []
        )


        expect(
          projection.processes.map(
            process =>
              process.id
          )
        ).toEqual([
          'doc-1::Process_A'
        ])
      }
    )


    it(
      'declares the reference types used to contextualize Processes under Collaborations',
      () => {

        expect(
          cocProjectionProfile
            .collaborationProcessContext
        ).toEqual({

          participantReferenceType:
            'participant',

          processReferenceType:
            'processRef'
        })
      }
    )


    it(
      'uses the profile reference types to traverse from Collaboration to Process',
      () => {

        const repositoryModel =
          createRepositoryModel()


        repositoryModel.addComponent({

          id:
            'doc-1::Collaboration_A',

          type:
            'collaboration',

          name:
            'Collaboration A',

          documentId:
            'doc-1'
        })


        repositoryModel.addComponent({

          id:
            'doc-1::Participant_A',

          type:
            'participant',

          name:
            'Participant A',

          documentId:
            'doc-1'
        })


        repositoryModel.addComponent({

          id:
            'doc-1::Process_A',

          type:
            'process',

          name:
            'Process A',

          documentId:
            'doc-1'
        })


        repositoryModel.addReference({

          id:
            'ref:collaboration:participant',

          type:
            'participant',

          sourceId:
            'doc-1::Collaboration_A',

          targetId:
            'doc-1::Participant_A'
        })


        repositoryModel.addReference({

          id:
            'ref:participant:process',

          type:
            'processRef',

          sourceId:
            'doc-1::Participant_A',

          targetId:
            'doc-1::Process_A'
        })


        const differentTraversalProfile = {

          ...cocProjectionProfile,

          collaborationProcessContext: {

            ...cocProjectionProfile
              .collaborationProcessContext,

            participantReferenceType:
              'otherParticipantReference'
          }
        }


        const projection =
          createEnvironmentProjection({

            repositoryModel,

            projectionProfile:
              differentTraversalProfile
          })


        expect(
          projection.collaborations
        ).toHaveLength(
          1
        )


        expect(
          projection
            .collaborations[0]
            .processes
        ).toEqual(
          []
        )


        expect(
          projection.processes.map(
            process =>
              process.id
          )
        ).toEqual([
          'doc-1::Process_A'
        ])
      }
    )


    it(
      'declares that Collaboration context takes precedence over direct CoC membership',
      () => {

        expect(
          cocProjectionProfile
            .preferCollaborationContextOverDirectCocMembership
        ).toBe(
          true
        )
      }
    )


    it(
      'uses the profile to control whether Collaboration context hides direct CoC membership',
      () => {

        const repositoryModel =
          createRepositoryModel()


        repositoryModel.addContainer({

          id:
            'CoC_A',

          name:
            'CoC A'
        })


        repositoryModel.addComponent({

          id:
            'doc-1::Collaboration_A',

          type:
            'collaboration',

          name:
            'Collaboration A',

          documentId:
            'doc-1'
        })


        repositoryModel.addComponent({

          id:
            'doc-1::Participant_A',

          type:
            'participant',

          name:
            'Participant A',

          documentId:
            'doc-1'
        })


        repositoryModel.addComponent({

          id:
            'doc-1::Process_A',

          type:
            'process',

          name:
            'Process A',

          documentId:
            'doc-1'
        })


        repositoryModel.addReference({

          id:
            'membership:coc:collaboration',

          type:
            'contains',

          sourceId:
            'CoC_A',

          targetId:
            'doc-1::Collaboration_A'
        })


        repositoryModel.addReference({

          id:
            'membership:coc:process',

          type:
            'contains',

          sourceId:
            'CoC_A',

          targetId:
            'doc-1::Process_A'
        })


        repositoryModel.addReference({

          id:
            'ref:collaboration:participant',

          type:
            'participant',

          sourceId:
            'doc-1::Collaboration_A',

          targetId:
            'doc-1::Participant_A'
        })


        repositoryModel.addReference({

          id:
            'ref:participant:process',

          type:
            'processRef',

          sourceId:
            'doc-1::Participant_A',

          targetId:
            'doc-1::Process_A'
        })


        const nonPrecedenceProfile = {

          ...cocProjectionProfile,

          preferCollaborationContextOverDirectCocMembership:
            false
        }


        const projection =
          createEnvironmentProjection({

            repositoryModel,

            projectionProfile:
              nonPrecedenceProfile
          })


        expect(
          projection.cocs
        ).toHaveLength(
          1
        )


        expect(
          projection
            .cocs[0]
            .collaborations
        ).toHaveLength(
          1
        )


        expect(
          projection
            .cocs[0]
            .collaborations[0]
            .processes
            .map(
              occurrence =>
                occurrence.process?.id
            )
        ).toEqual([
          'doc-1::Process_A'
        ])


        expect(
          projection
            .cocs[0]
            .processes
            .map(
              process =>
                process.id
            )
        ).toEqual([
          'doc-1::Process_A'
        ])
      }
    )


    it(
      'uses the CoC projection profile explicitly without changing the projection',
      () => {

        const repositoryModel =
          createRepositoryModel()


        repositoryModel.addContainer({

          id:
            'CoC_A',

          name:
            'CoC A'
        })


        repositoryModel.addComponent({

          id:
            'doc-1::Process_A',

          type:
            'process',

          name:
            'Process A',

          documentId:
            'doc-1'
        })


        repositoryModel.addReference({

          id:
            'membership:coc:process',

          type:
            'contains',

          sourceId:
            'CoC_A',

          targetId:
            'doc-1::Process_A'
        })


        const implicitProjection =
          createEnvironmentProjection({
            repositoryModel
          })


        const explicitProjection =
          createEnvironmentProjection({

            repositoryModel,

            projectionProfile:
              cocProjectionProfile
          })


        expect(
          explicitProjection
        ).toEqual(
          implicitProjection
        )
      }
    )


    it(
      'projects the same RepositoryModel differently with the Flat projection profile',
      () => {

        const repositoryModel =
          createRepositoryModel()


        repositoryModel.addComponent({

          id:
            'doc-1::Collaboration_A',

          type:
            'collaboration',

          name:
            'Collaboration A',

          documentId:
            'doc-1'
        })


        repositoryModel.addComponent({

          id:
            'doc-1::Participant_A',

          type:
            'participant',

          name:
            'Participant A',

          documentId:
            'doc-1'
        })


        repositoryModel.addComponent({

          id:
            'doc-1::Process_A',

          type:
            'process',

          name:
            'Process A',

          documentId:
            'doc-1'
        })


        repositoryModel.addReference({

          id:
            'ref:collaboration:participant',

          type:
            'participant',

          sourceId:
            'doc-1::Collaboration_A',

          targetId:
            'doc-1::Participant_A'
        })


        repositoryModel.addReference({

          id:
            'ref:participant:process',

          type:
            'processRef',

          sourceId:
            'doc-1::Participant_A',

          targetId:
            'doc-1::Process_A'
        })


        const cocProjection =
          createEnvironmentProjection({

            repositoryModel,

            projectionProfile:
              cocProjectionProfile
          })


        const flatProjection =
          createEnvironmentProjection({

            repositoryModel,

            projectionProfile:
              flatProjectionProfile
          })


        expect(
          cocProjection
            .collaborations[0]
            .processes
            .map(
              occurrence =>
                occurrence.process?.id
            )
        ).toEqual([
          'doc-1::Process_A'
        ])


        expect(
          cocProjection.processes
        ).toEqual(
          []
        )


        expect(
          flatProjection
            .collaborations[0]
            .processes
        ).toEqual(
          []
        )


        expect(
          flatProjection.processes.map(
            process =>
              process.id
          )
        ).toEqual([
          'doc-1::Process_A'
        ])
      }
    )


    it(
      'rejects an unsupported projection profile',
      () => {

        const repositoryModel =
          createRepositoryModel()


        expect(
          () =>
            createEnvironmentProjection({

              repositoryModel,

              projectionProfile: {

                id:
                  'unsupported',

                label:
                  'Unsupported'
              }
            })
        ).toThrow(
          'Unsupported Environment projection profile: unsupported'
        )
      }
    )
  }
)