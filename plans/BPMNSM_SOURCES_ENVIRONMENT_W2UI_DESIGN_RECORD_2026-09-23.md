# BPMNSM — Sources / Environment W2UI design record — 2026-09-23

## Decision scope

This record covers only Browser navigation structure. It does not define Resource↔Environment correspondence/provenance.

## BPMNSM intent

Two independent organizations must remain visible without pretending they share the same hierarchy:

- **Sources** answers where physical Resources are located. Its tree mirrors Source-relative folder/file paths.
- **Environment** answers what BPMNSM has logically materialized/projected. It contains no Source nodes.

The physical file hierarchy is not the logical Environment hierarchy.

## W2UI evidence

- **DOC**: `w2sidebar` supports arbitrary hierarchical nesting and selection/events; it remains the tree macro-component.
- **DOC**: `w2layout` panels can own native tabs and `assignTabs()` can attach `w2tabs` to a panel.
- **BPMNSM-HYP promoted by this decision**: the Browser has two stable alternative views, therefore two fixed tabs are semantically justified.
- **BPMNSM-HYP**: tabs are not document lifecycle objects here. They are fixed, non-closeable, non-reorderable view selectors.

Official references are already catalogued by `BPMNSM_W2UI_2_FUNCTIONAL_MAP.md`.

## Applicable requirements

- UI-W2-01 — widget/pattern before DOM mechanisms.
- UI-W2-02 — no parallel DOM state.
- UI-W2-03 — one explicit ownership point for Sidebar contextual state.
- UI-W2-05 — business commands remain gesture-independent.
- UI-W2-06 — native event/default lifecycle must not be accidentally cancelled.
- UI-W2-09 — workspace composition evaluates native Layout/Tabs composition.
- UI-W2-10 — tabs require explicit lifecycle semantics; here: fixed `activate` only.
- UI-W2-12 — automated GREEN still requires Vite/Chrome proof.

## Target structure

```text
Browser
├── [Sources]          (initial active tab)
│   ├── workspace
│   │   ├── folder/
│   │   │   └── resource.bpmn
│   │   └── README.md
│   └── Test
│       └── ...
│
└── [Environment]
    └── Environment
        ├── Repositories
        ├── CoCs
        ├── Collaborations
        ├── Processes
        └── ArchiMate
```

`Sources` is a UI projection, not a new canonical entity/store.

## Minimal data contract for this tranche

A Source projection may expose:

```text
{
  id,
  name,
  mode,
  resources: [
    { path }
  ]
}
```

`path` is Source-relative and is sufficient to build the physical folder/file tree for this tranche.

No `provenance[]`, Resource→LogicalObject relation, reverse index, or generic correspondence model is introduced.

## State/lifecycle

- initial active view: `sources`;
- tabs: fixed `sources`, `environment`;
- activation switches the Sidebar projection through W2UI-owned state/events;
- no open/close/reorder semantics;
- selection/expansion preservation is view-local where meaningful;
- duplication refresh targets the Sources projection of the affected Source when implemented;
- Environment refresh remains independent and follows materialization/projection effects.

## RED probe

`repository-browser-sources-environment-tabs.test.js` establishes the desired boundary before production changes:

1. `Sources` is first and initially active;
2. Source nodes contain folder/file nodes reconstructed from `resources[].path`;
3. `Environment` contains logical roots only;
4. no `environment:sources`, `source:*`, or `source-projection:*` node exists in Environment;
5. the logical Process projection remains available after activating Environment.

Expected initial result: RED against the current single-Sidebar mixed projection.

## Deferred

- formal Resource↔Environment correspondence;
- Locate in Sources / Show in Environment;
- multiple provenance/correspondence UX;
- persistence of per-view expansion across sessions.
