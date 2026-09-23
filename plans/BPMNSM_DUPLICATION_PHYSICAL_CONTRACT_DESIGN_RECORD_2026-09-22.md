# BPMNSM — Resource duplication physical contract design record — 2026-09-22

## Scope

This record isolates the physical Source contract from Environment correspondence.
No Resource-to-logical-object correspondence model is introduced by this tranche.

## UI-W2-SOURCES-TAB

`Sources` is the first Browser tab and owns the physical Source trees.

## UI-W2-PHYSICAL-TREE

Each Source subtree reflects its real folder/file Resource structure. It must not mimic the logical Environment tree.

## UI-W2-ENVIRONMENT-SEPARATION

`Environment` remains a separate logical projection. Sources and `Source: <active>` are not children of Environment.

## UI-W2-TARGETED-SOURCE-REFRESH

After a successful physical COPY, refresh the affected target Source subtree. Preserve relevant W2UI tree expansion/selection state using public component state/commands.

## Current duplication contract

Given distinct physical Sources A and B and Resource A/p:

- if B/p is absent: COPY to B/p;
- if B/p exists: CONFLICT and mutate neither side;
- COPY preserves the relative path and content at copy time;
- source and target Resources are independent after COPY;
- no overwrite, auto-rename, merge, synchronization, or semantic Repository inference.

## Explicitly deferred

The general correspondence between physical Resources and logical Environment objects, including bidirectional navigation (`Locate in Sources`, `Show in Environment`), is intentionally deferred until that correspondence model is formally designed.

## Evidence classification

- Existing BPMNSM physical folder inventory and File System Access helper: SRC.
- Existing duplication into RepositoryDocumentStore: SRC.
- Requirement that Sources show real file/folder structure: BPMNSM contract from current design decision.
- Exact W2UI tab/tree composition and targeted refresh commands: must be checked against DOC/EX/SRC before production UI implementation.
