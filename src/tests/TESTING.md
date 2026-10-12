# SemArch testing strategy

This directory contains test models and external test resources used to validate
SemArch invariants and interoperability mechanisms.

The objective is not only to validate a feature once, but to preserve validated
behaviour as a reproducible non-regression test whenever practical.


## Validation levels

SemArch uses three complementary validation levels.


### 1. Vitest — logic and structural invariants

Used for deterministic behaviour that does not require user interaction.

Examples:

- schema adapters
- semantic bindings
- identity rules
- repository projection
- BPMN semantic structure
- BPMN-DI structure
- BPMN import/export round-trip
- SemArch moddle extensions
- lint rule logic


### 2. Browser / Playwright — application behaviour

Used when the real SemArch application and user interaction matter.

Examples:

- Repository Browser navigation
- Diagram Browser navigation
- exact BPMNDiagram selection
- contextual view chooser
- Properties Panel
- canvas selection
- palette restrictions
- Viewer versus Editor behaviour
- lint rendering
- editing interactions


### 3. Manual release validation

Reserved for packaging and environments that are not useful to reproduce in
every unit or integration test.

Examples:

- standalone Viewer opened directly with file://
- standalone Editor opened directly with file://
- GitHub Pages deployment
- browser-specific packaging checks


## Test model policy

Tests must never infer business meaning from BPMN technical IDs or graphical
geometry.

Examples:

- `DataObjectReference_1` does not imply a state or role.
- `DataState.name` explicitly carries the state.
- `Participant.processRef` determines whether a Participant references a Process.
- BPMN-DI determines graphical representation.
- `SemanticType.ref` explicitly carries external semantic typing.
- schema bindings explicitly connect semantic types to external schema types.


## Existing and planned regression coverage

| Behaviour | Target |
| --- | --- |
| Starter BPMN invariants | Vitest |
| stableGuid creation and preservation | Vitest integration |
| Import with existing stableGuid | Vitest integration |
| Import without stableGuid remains without generated identity in Viewer | Vitest integration |
| Black-box Participant has no processRef | Vitest |
| No Process invented for black-box Participant | Vitest |
| White-box / opaque representation derived from BPMN + BPMN-DI | Vitest |
| Multiple lanes remain one Process | Vitest |
| Multiple BPMNDiagram for one semantic subject | Vitest |
| Exact BPMNDiagram identity and geometry | Vitest integration |
| Repository Process / Collaboration / Participant projection | Vitest |
| Repository create/delete synchronization | Vitest integration |
| Repository Undo/Redo synchronization | Vitest integration |
| Independent repository references survive BPMN projection rebuild | Vitest |
| Import does not arbitrarily select the first repository component | Playwright |
| Diagram Browser groups views by BPMNPlane subject | Vitest + Playwright |
| Clicking View A opens exact View A | Playwright |
| Clicking View B opens exact View B | Playwright |
| Repository contextual view chooser | Playwright |
| Diagram selection targets BPMNDiagram properties | Playwright |
| Canvas element selection returns Properties to BPMN element | Playwright |
| Viewer versus Editor application mode | Playwright |
| SemanticType BPMN round-trip | Vitest integration |
| DataProperty BPMN round-trip | Vitest integration |
| DataObjectReference and DataState round-trip | Vitest integration |
| DataInputAssociation / DataOutputAssociation round-trip | Vitest integration |
| BPMN-DI edges preserved through round-trip | Vitest integration |
| XSD adapter | Vitest |
| Explicit semantic type binding | Vitest |
| BPMN SemanticType → binding → external XSD | Vitest |
| Properties generated from schema | Playwright |
| Property editing updates BPMN semantic model | Playwright + Vitest where possible |
| Undo/Redo of semantic property editing | Integration / Playwright |
| Method palette restrictions | Playwright |
| bpmnlint rule logic | Vitest |
| bpmnlint rendering on canvas | Playwright |
| Standalone Viewer file:// packaging | Manual release validation |
| Standalone Editor file:// packaging | Manual release validation |


## Round-trip protocol

For semantic information intended to survive interchange, use the following
validation sequence:

DEFINE
→ MODEL
→ EDIT
→ SERIALIZE
→ REIMPORT
→ VERIFY
→ ROUND-TRIP

A successful visual rendering alone is not sufficient evidence of semantic
preservation.


## Current living deliverable test

Model:

`src/tests/semarch/living-deliverable-binding-test.bpmn`

It currently exercises:

- one BPMN DataObject as the master logical object
- two BPMN DataObjectReference occurrences
- Draft and Approved BPMN DataState values
- DataInputAssociation
- DataOutputAssociation
- BPMN-DI shapes and edges
- multiple SemArch SemanticType extensions
- one SemArch DataProperty
- explicit binding to an external XSD type
- external XSD definition of documentNumber


## Future browser automation

Playwright should be introduced progressively.

Do not convert every historic browser-console check immediately.

Priority order:

1. preserve semantic/model invariants with Vitest
2. preserve bpmn-js import/export behaviour with integration tests
3. automate critical UI navigation with Playwright
4. keep packaging checks manual where automation adds little value