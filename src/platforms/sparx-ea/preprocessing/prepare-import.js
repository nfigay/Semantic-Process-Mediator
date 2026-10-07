import {
  analyzeSparxEaImport
} from './analyze-import.js'

import {
  normalizeSparxEaImport
} from './normalize-import.js'


function unresolvedIssuesAfterNormalization({
  normalizedBpmnXml,
  xmiXml
}) {

  const analysis =
    analyzeSparxEaImport({
      bpmnXml:
        normalizedBpmnXml,
      xmiXml
    })


  return {
    analysis,

    blockingIssues:
      analysis.blockingIssues,

    warnings:
      analysis.warnings
  }
}


export function prepareSparxEaBpmnImport({
  bpmnXml,
  xmiXml,
  nativeNotePolicy = {}
}) {

  const sourceAnalysis =
    analyzeSparxEaImport({
      bpmnXml,
      xmiXml
    })


  const normalized =
    normalizeSparxEaImport({
      bpmnXml,
      xmiXml,
      nativeNotePolicy
    })


  const after =
    unresolvedIssuesAfterNormalization({
      normalizedBpmnXml:
        normalized.bpmnXml,
      xmiXml
    })


  const nativeNotes =
    sourceAnalysis.xmi.notes
      .filter(
        note =>
          note.sourceKind ===
          'uml-note'
          && (
            Boolean(
              note.text
            )
            || note.noteLinks.length > 0
          )
      )
      .map(
        note => ({
          id:
            note.id,

          text:
            note.text,

          noteLinks:
            note.noteLinks
        })
      )


  return {
    platform:
      'sparx-ea',

    source: {
      bpmnXml,
      xmiXml
    },

    normalizedBpmnXml:
      normalized.bpmnXml,

    sourceAnalysis,

    normalizedAnalysis:
      after.analysis,

    repairs:
      normalized.repairs,

    unresolvedIssues:
      after.blockingIssues,

    warnings:
      after.warnings,

    publicationPolicyRequired: {
      nativeNotes: nativeNotes.filter(note => !nativeNotePolicy[note.id])
    },

    publicationPolicyApplied:
      nativeNotePolicy,

    provenance: {
      platform:
        'sparx-ea',

      transformation:
        'ea-bpmn-import-preprocessing',

      supportingArtifact:
        'ea-xmi'
    }
  }
}
