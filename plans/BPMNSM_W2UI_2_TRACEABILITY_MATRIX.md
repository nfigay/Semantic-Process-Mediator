# BPMNSM — W2UI 2 Traceability Matrix

This matrix links BPMNSM interaction needs to W2UI capabilities without turning candidate UI choices into business architecture.

| BPMNSM need | Interaction pattern | Candidate W2UI capability | Current status | Required evidence |
|---|---|---|---|---|
| Navigate Environment / Sources / Repositories | Hierarchical navigation | Sidebar | Existing product use | DOC + integration + Chrome |
| Search Workspace Tree | Hierarchical search/filter | Sidebar projection + BPMNSM structural filter | Implemented/demonstrated in project corpus | Existing BPMNSM evidence |
| Resource contextual actions | Selection → contextual commands | Sidebar menu/context-menu | Context menu GREEN; duplication execution still unresolved | DOC/SRC/EXP + command proof |
| Duplicate Resource to another Source | Target choice + command + feedback | Context action + native transient choice/feedback candidate | Application semantics partly GREEN; product execution RED/unlocalized | Official pattern study + integration + Chrome |
| Business Objects workbench | Master/detail + rich collection | Grid + Layout + detail/Form | Architectural target already present | DOC/EX before implementation |
| Business Model property editing | Structured edit | Form/Fields | Candidate | DOC/EX + validation proof |
| Workspace-level commands | Discoverable commands | Toolbar | Existing product use | Preserve native Toolbar patterns |
| Alternative object views | Alternative views | Tabs | Candidate | DOC/EX before adoption |
| Operation feedback / conflict | Context-local feedback | message/confirm/popup/overlay | Candidate | DOC/EX + UX proof |
| Multi-object operations | Multi-selection + bulk command | Grid selection + Toolbar/menu | Candidate | DOC/EX + semantic contract |
| Multi-pane workbench | Workspace composition | Layout + child widgets | Existing W2UI foundation | DOC + product composition proof |

## Reading rule

“Candidate” means **BPMNSM-HYP**, not an implementation decision. A candidate becomes a design decision only after the relevant W2UI documentation/examples and BPMNSM semantic constraints have been reviewed.

## Verifiable interaction requirements

The following requirements are transverse UI requirements. They do not alter business semantics.

| ID | Requirement | W2UI evidence expected | BPMNSM proof expected |
|---|---|---|---|
| UI-W2-01 | Significant interactions are designed from a documented widget/pattern before low-level DOM mechanisms. | DOC, EX where available | design record in tranche |
| UI-W2-02 | Widget-owned state is not duplicated into parallel DOM state without demonstrated need. | DOC | integration test + product proof |
| UI-W2-03 | Contextual commands have one explicit composition/ownership point per widget state surface. | DOC/SRC if needed | integration test |
| UI-W2-04 | Command applicability is reflected through native widget state when available (enable/disable/show/hide/check/select). | DOC | product proof |
| UI-W2-05 | Business commands remain independent from the gesture/surface exposing them. | BPMNSM architecture | same command callable through chosen surface |
| UI-W2-06 | Event design identifies before/default/after behavior and does not cancel native default accidentally. | DOC | focused integration test |
| UI-W2-07 | Collection workbenches evaluate Grid search/sort/selection/state/edit capabilities before custom equivalents. | DOC/EX | UX/product proof |
| UI-W2-08 | Structured editors evaluate Form/Fields validation/actions before custom form state machinery. | DOC/EX | validation + command proof |
| UI-W2-09 | Workspace composition evaluates Layout + assigned Toolbar/Tabs before custom pane composition. | DOC/EX | responsive product proof |
| UI-W2-10 | Tabs are adopted only with explicit BPMNSM lifecycle semantics for open/activate/close/reorder. | DOC + BPMNSM-HYP promoted by decision | lifecycle tests |
| UI-W2-11 | Transient interactions choose menu/overlay/message/popup according to interaction complexity, after native capability review. | DOC/EX | product proof |
| UI-W2-12 | Automated GREEN does not close a UI tranche without the required Vite/Chrome product proof. | protocol | recorded product evidence |

## Decision-to-proof chain

```text
requirement ID
    ↓
BPMNSM semantic constraint
    ↓
W2UI DOC / EX
    ↓
BPMNSM-HYP
    ↓ explicit design decision
implementation
    ↓
unit/integration proof
    ↓
Vite/Chrome proof
```

A traceability row is not an authorization to implement the candidate component. It makes the evidence needed for such a decision explicit.

## Proven workspace-navigation requirements — 2026-09-23

| ID | Requirement | W2UI / architecture decision | Current proof |
|---|---|---|---|
| UI-W2-13 | `Environment`, `Diagrams` and `Sources` are one top-level workspace navigation, not nested duplicate tab levels. | one top-level W2UI Tabs composition point | targeted tests + Chrome |
| UI-W2-14 | The active top-level tab is not repeated as a redundant root node in its associated tree. | tab supplies context; Sidebar supplies domain children | targeted tests + Chrome |
| UI-W2-15 | `Sources` is a physical Source/Resource tree and must not trigger diagram loading. | Sidebar physical projection; BPMNSM command boundary separated from diagram selection | targeted tests; final Resource-detail product gate remains open |
| UI-W2-16 | `Diagrams` exposes repository-wide recognized representations grouped by BPMN Process, BPMN Collaboration and ArchiMate. | Sidebar projection consumes repository/projected representation state, not only current modeler definitions | 20/20 targeted tests + Chrome multi-document proof |
| UI-W2-17 | A BPMN diagram leaf preserves owning `RepositoryDocument` identity and diagram identity; activation loads owner then opens the requested diagram. | BPMNSM state/command contract; W2UI only exposes selection | targeted tests + Chrome multi-document proof |
| UI-W2-18 | Diagram selection reuses the existing representation renderer and Diagram properties panel; no extra editor surface is introduced by this tranche. | existing central representation + properties panel | targeted tests + Chrome BPMN/ArchiMate proof |
| UI-W2-19 | Visibility of the optional `Sources` top-level tab uses native W2UI tab/menu-check state rather than parallel DOM state. | public W2UI show/hide/check mechanisms | automated coverage exists; final interactive toggle proof remains OPEN |

`UI-W2-16` through `UI-W2-18` are GREEN in the 2026-09-23 product proof. `UI-W2-19` must not be promoted to product-GREEN until the menu checkmark and hide/show behavior are observed together in Chrome.
