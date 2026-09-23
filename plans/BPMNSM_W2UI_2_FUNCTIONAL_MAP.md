# BPMNSM — W2UI 2 Functional Map

## 1. Authority, purpose and status

This document is the BPMNSM technical reference for designing interactions implemented with W2UI 2.

It does **not** define BPMNSM business semantics. Business concepts, canonical identities, repository/source semantics and publication semantics remain governed by the corresponding BPMNSM target documents.

Its purpose is to prevent two recurring failure modes:

1. treating W2UI as a low-level DOM rendering library and rebuilding interactions that its widgets already provide;
2. inferring W2UI behavior from memory or isolated source-code call chains instead of first understanding the public widget contract and official usage patterns.

BPMNSM uses `w2ui` with the npm dependency declared as `^2.0.0`. Any implementation-sensitive conclusion must therefore be checked against the exact installed version when it matters.

### Evidence labels

Every W2UI conclusion used for design must be classifiable as one of:

- **DOC** — established by W2UI 2 official documentation;
- **EX** — established by an official W2UI example/demo;
- **SRC** — verified in the exact installed W2UI source used by BPMNSM;
- **EXP** — demonstrated by a reproducible experiment in the BPMNSM environment;
- **BPMNSM-HYP** — a BPMNSM design hypothesis, not a W2UI fact.

A hypothesis must never silently become a W2UI contract.

## 2. Design principle: work at widget-logic level

The preferred design chain is:

```text
BPMNSM interaction need
        ↓
interaction pattern
        ↓
native W2UI macro-component(s)
        ↓
native composition + widget state
        ↓
public W2UI commands/events
        ↓
BPMNSM application command
        ↓
targeted widget update / refresh
        ↓
product proof
```

The default is **not**:

```text
interaction need
        ↓
DOM listener
        ↓
manual element mutation
```

Low-level DOM behavior is justified only when the relevant W2UI capability has been investigated and is insufficient.

## 3. Functional map of the macro-components

### 3.1 `w2layout` — interactive workspace composition

**DOC**

W2UI 2 documents `w2layout` as a resizable multi-panel workspace with up to six named panels. Panels can be shown, hidden, toggled, resized, locked, messaged and updated dynamically. W2UI also provides native assignment of `w2tabs` and `w2toolbar` to layout panels.

Relevant official documentation:

- https://w2ui.com/web/docs/2.0/
- https://w2ui.com/web/docs/2.0/layout/methods
- https://w2ui.com/web/docs/2.0/w2layout.assignTabs
- https://w2ui.com/web/docs/2.0/w2layout.assignToolbar
- https://w2ui.com/web/docs/2.0/w2layout.panels

**Interaction patterns**

- application workspace / workbench;
- resizable navigation + main content + inspector/detail;
- contextual toolbar or tabs attached to a panel;
- temporary panel message/lock during an operation.

**BPMNSM-HYP**

Before creating custom split panes, ad-hoc inspector regions or panel-specific toolbar containers, BPMNSM should evaluate whether the interaction is already expressible as a `w2layout` panel composition.

### 3.2 `w2sidebar` — hierarchical navigation and contextual tree interaction

**DOC**

W2UI 2 documents Sidebar as a hierarchical control with arbitrary nesting and on-demand node rendering. Its public model includes nodes, selection and widget events; W2UI also exposes menu/context-menu behavior as part of the widget rather than requiring a parallel DOM menu mechanism.

Relevant official documentation:

- https://w2ui.com/web/docs/2.0/sidebar

**EXP/SRC already established during BPMNSM context-menu investigation**

The BPMNSM product demonstrated that the rendered Sidebar node carried W2UI context-menu dispatch metadata and that the native W2UI context-menu path worked in a minimal W2UI application and later in the product. The investigation also demonstrated a BPMNSM composition defect: independent features mutated the same Sidebar menu state.

**Interaction patterns**

- Environment / Source / Repository hierarchical navigation;
- selection-driven projection;
- context-sensitive actions;
- expandable semantic/technical categories.

**BPMNSM rule**

Features may contribute contextual actions, but ownership of mutable W2UI menu state must be explicit. Competing feature handlers must not independently replace the same menu state.

### 3.3 `w2grid` — rich collection workbench

**DOC**

W2UI 2 Grid exposes records and columns together with selection, local/remote search, sorting, inline editing, toolbar integration, context menus, row/column operations, state save/restore, targeted row/cell refresh and clipboard-oriented operations.

Relevant official documentation:

- https://w2ui.com/web/docs/2.0/grid/properties
- https://w2ui.com/web/docs/2.0/grid/methods
- https://w2ui.com/web/docs/2.0/w2grid.menu
- https://w2ui.com/web/docs/2.0/w2grid.onContextMenu

**Interaction patterns**

- searchable/filterable semantic collections;
- multi-selection and bulk actions;
- inspect/edit tabular properties;
- master list driving detail;
- column configuration;
- contextual row actions;
- targeted updates without rebuilding the whole surface.

**Existing BPMNSM architectural alignment**

`PROJECT_CONTEXT_BPMNSM_2026-09-21.md` already identifies `w2grid` as the target for rich tables and explicitly envisages a Business Objects master/detail perspective with W2UI search/filter/sort/column capabilities. This Functional Map generalizes that existing direction.

### 3.4 `w2toolbar` — command surface and stateful command groups

**DOC direction to preserve**

Toolbar is a command-oriented widget. BPMNSM already uses a W2UI toolbar and has product evidence around Workspace and Technical commands.

**Interaction patterns to study from official examples before extending**

- primary commands;
- mutually exclusive command modes;
- checked/toggled states;
- dropdown command families;
- context-dependent enabling/disabling;
- command grouping and separation.

**BPMNSM-HYP**

When a command is important, discoverable and applies to the current workspace/selection, Toolbar may be a better exposure than a context menu alone. Context menu and Toolbar can expose the same application command without duplicating business logic.

### 3.5 `w2tabs` — alternative views and persistent working contexts

**DOC**

W2UI supports tabs as a first-class widget and `w2layout` can assign tabs directly to a panel.

Relevant official documentation:

- https://w2ui.com/web/docs/2.0/w2layout.assignTabs

**Interaction patterns**

- alternate views of one selected object;
- multiple open working contexts;
- detail sub-perspectives;
- editor/viewer switching where semantically justified.

**BPMNSM-HYP**

Tabs should represent stable view/context alternatives, not merely replace ordinary commands.

### 3.6 `w2form` / W2UI fields — structured inspection and editing

**DOC**

W2UI 2 documents an expressive field model including required/hidden/disabled state, typed field options, generated field HTML metadata, pages/columns and collapsible groups.

Relevant official documentation:

- https://w2ui.com/web/docs/2.0/w2form.fields

**Interaction patterns**

- semantic property inspector;
- structured edit surface;
- grouped properties;
- dependent or constrained values;
- validation before application commands.

**BPMNSM-HYP**

Before implementing property editors as manually synchronized inputs, evaluate `w2form` and W2UI fields as the interaction model.

### 3.7 Popup, message, confirmation and overlays — transient interaction

**DOC**

W2UI provides popup/message/confirm and overlay/menu facilities. Layout and Grid also expose contextual message/confirm operations.

Relevant official documentation:

- https://w2ui.com/web/docs/2.0/popup/overlays
- https://w2ui.com/web/docs/2.0/w2grid.message
- https://w2ui.com/web/docs/2.0/layout/methods

**Interaction patterns**

- explicit target choice;
- confirmation for destructive operations;
- transient detail or configuration;
- operation feedback;
- context-local blocking/message rather than whole-application interruption.

**BPMNSM-HYP**

The Resource-duplication target selector and conflict feedback should be evaluated against these native patterns before introducing custom chooser DOM.

## 4. Common widget/event contract

**DOC**

W2UI exposes common widget lifecycle/event methods including `on`, `off`, `trigger`, `render`, `refresh`, `resize`, `destroy` and `unmount`. Widget events can be attached declaratively at construction or through runtime listeners. W2UI documentation for events such as Grid `onContextMenu` states that handlers execute before the default action and may cancel that action; completion hooks exist for post-processing.

Relevant documentation:

- https://w2ui.com/web/docs/2.0/layout/methods
- https://w2ui.com/web/docs/2.0/w2grid.onContextMenu
- https://w2ui.com/web/docs/2.0/utils

### BPMNSM event-analysis rule

Do not attempt to reconstruct a full event chain solely from static source call chains.

For an interaction:

1. identify the public widget event contract in documentation;
2. inspect an official example when available;
3. identify BPMNSM handlers/contributions using that contract;
4. inspect exact W2UI source only for unresolved semantics;
5. use a minimal experiment only for remaining ambiguity;
6. verify the integrated product path.

## 5. Interaction-pattern catalogue

### P1 — Hierarchical navigation

Candidate macro-component: `w2sidebar`.

Use for trees whose hierarchy itself carries navigation meaning.

BPMNSM examples: Environment, Sources, Repositories, semantic projection categories.

### P2 — Selection → contextual commands

Candidate components: Sidebar/Grid + Toolbar/Menu/Popup.

Separate:
- selected object/state;
- applicable commands;
- W2UI surface exposing commands;
- BPMNSM application command.

Do not bind business semantics to the physical gesture (secondary click, toolbar click, etc.).

### P3 — Master → detail

Candidate components: Grid/Sidebar + Layout panel + Form/Grid/detail view.

Existing BPMNSM target: Business Objects perspective.

### P4 — Multi-selection → bulk operation

Candidate: Grid selection + Toolbar/context menu + application command.

Investigate native selection and toolbar state before custom selection bookkeeping.

### P5 — Search/filter/explore

Candidate: Grid native search/filter capabilities for collections; Sidebar-specific projection/filtering for hierarchical navigation.

Do not assume that a Grid search pattern and hierarchical tree filtering are semantically interchangeable.

### P6 — Inspect/edit structured object

Candidate: Form/Fields, possibly in Layout detail panel or Popup.

### P7 — Alternative views / working contexts

Candidate: Tabs, especially when assigned to Layout panels.

### P8 — Transient choice / confirmation / feedback

Candidate: Popup, message, confirm, overlay/menu.

### P9 — Dynamic workspace

Candidate: Layout + assigned Toolbar/Tabs + renderable child widgets.

### P10 — Targeted refresh

Prefer widget-level `set`, row/cell refresh, panel update or equivalent public methods when documented, instead of reconstructing DOM.

## 6. Decision checklist before implementing a BPMNSM interaction

Before code changes:

1. What is the BPMNSM interaction intent?
2. Which object(s) carry the state?
3. Is the interaction hierarchical, collection-oriented, detail/edit, command-oriented, transient, or workspace composition?
4. Which W2UI macro-component owns that interaction class?
5. Does official documentation expose the required behavior?
6. Is there an official example showing the composition?
7. What state does W2UI already maintain?
8. Which public event is the semantic boundary?
9. Which public update method should reflect the result?
10. What remains BPMNSM-specific?
11. Which statements are DOC / EX / SRC / EXP / BPMNSM-HYP?
12. What integrated browser proof is required?

No production patch should precede this analysis for a significant new W2UI interaction.

## 7. Testing and proof hierarchy

```text
documented widget contract
        ↓
official example/pattern
        ↓
targeted unit test
        ↓
BPMNSM integration test
        ↓
Vite/Chrome product proof
```

A lower layer does not substitute for a higher layer.

When automated tests are GREEN but product behavior is RED, stop modifying production code and identify the first divergence between test and product: widget instance, handlers, wiring, state, event order, rendered structure or browser behavior.

## 8. Context-menu lesson capitalized

The Resource-duplication context-menu investigation established:

- the browser/trackpad was capable of producing the expected context-menu interaction;
- W2UI's native mechanism worked in isolation;
- BPMNSM had multiple features interacting with the same mutable Sidebar menu state;
- local tests could be GREEN while real application composition/wiring remained wrong;
- a DOM capture workaround was not an acceptable substitute for understanding the W2UI widget contract;
- the final architecture moved toward a single W2UI menu composition point.

Therefore:

> A W2UI interaction problem must first be framed as a widget-state/composition/event-contract problem, not as a DOM-event problem.

## 9. Traceability to BPMNSM architecture

This document complements, and does not replace:

- `BPMNSM_BUSINESS_MODEL_EXPERIMENTAL_TARGET.md` — business semantic target;
- `BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md` — configuration/workspace/publication target;
- `BPMNSM_WORKPLAN.md` — operational sequencing;
- `BPMNSM_EVIDENCE_DRIVEN_EXPERIMENTAL_DEVELOPMENT_PROTOCOL.md` — proof method;
- `PROJECT_CONTEXT_BPMNSM_2026-09-21.md` — accumulated project context;
- `HANDOVER_BPMNSM_2026-09-22.md` — short operational continuation point.

## 10. Open research backlog

The following areas require systematic official-example study before becoming BPMNSM design rules:

- Toolbar item families and stateful command patterns;
- Tabs lifecycle, close/reorder patterns and dynamic content;
- Form actions, validation, pages/tabs and dependent fields;
- Popup composition with Layout/Grid/Form;
- Sidebar keyboard, drag/drop, badges/counts and dynamic menus;
- Grid advanced search, column chooser, selection modes, inline editing and state persistence;
- accessibility/keyboard behavior available in W2UI 2;
- exact version differences between currently published examples and installed `w2ui@2.0.x`.

Each result must be added with provenance labels.

## 11. Deep capability catalogue — design-level use

This section promotes the map from orientation material to a practical design aid.

### 11.1 Toolbar as a stateful command model

**DOC**

W2UI 2 documents thirteen toolbar item types: `button`, `check`, `radio`, `menu`, `menu-check`, `menu-radio`, `drop`, `html`, `color`, `text-color`, `break`, `spacer`, and `new-line`.

Toolbar items can carry `hidden`, `disabled`, `checked`, `group`, `items`, `selected`, `overlay`, per-item `onClick` and per-item `onRefresh` state/behavior. Runtime methods include `add`, `insert`, `remove`, `show`, `hide`, `enable`, `disable`, `check`, `uncheck`, `set` and `refresh`.

Official references:
- https://w2ui.com/web/docs/2.0/w2toolbar.item_template
- https://w2ui.com/web/docs/2.0/toolbar/methods
- https://w2ui.com/web/docs/2.0/w2toolbar.set

**Design consequences**

Toolbar can model:
- an ordinary command (`button`);
- a persistent boolean mode (`check`);
- an exclusive mode family (`radio` + `group`);
- a command family (`menu`);
- a multi-valued visible state (`menu-check`);
- an exclusive choice embedded in a command surface (`menu-radio`);
- a transient rich chooser (`drop`);
- contextual availability (`enable/disable`, `show/hide`).

**BPMNSM-HYP**

The UI architecture should distinguish application command semantics from their exposure. One BPMNSM command may be exposed through Toolbar, context menu, keyboard or popup without duplicating the application command itself.

### 11.2 Tabs as dynamic working-context state

**DOC**

W2UI 2 Tabs can be static or created/removed at runtime; tabs may be closable. Methods include add/insert/remove, enable/disable, show/hide, click/close and drag-based reordering.

Official references:
- https://w2ui.com/web/docs/2.0/tabs
- https://w2ui.com/web/docs/2.0/tabs/methods

**Design consequences**

Tabs are appropriate when the UI needs to preserve multiple peer working contexts or stable alternative views. They are not merely decorative headings.

**BPMNSM-HYP**

Potential uses include multiple open semantic resources or stable perspectives of one selected object. Adoption requires explicit lifecycle semantics: what opening, activation, closing and reordering mean to BPMNSM.

### 11.3 Form as structured edit transaction

**DOC**

Form actions are named operations tied to form buttons and can also be executed programmatically through the form action mechanism. Forms can own a W2Tabs instance; multi-page forms map pages to tabs.

Official references:
- https://w2ui.com/web/docs/2.0/w2form.actions
- https://w2ui.com/web/docs/2.0/w2form.tabs
- https://w2ui.com/web/docs/2.0/w2form.fields

**Design consequences**

A Form can own both structured value state and its edit actions. BPMNSM should not automatically mirror every field into separate ad-hoc state.

**BPMNSM-HYP**

Property editing should distinguish:
- provisional UI record;
- validation;
- explicit application command;
- canonical model mutation.
W2Form may own the first two without becoming the canonical BPMNSM model.

### 11.4 Grid as a collection workbench, not a table renderer

**DOC**

Grid methods include search and advanced-search overlay control, select/select-all/unselect, selection save/restore, local/remote sorting, inline-save behavior, state save/restore, column visibility, targeted record/cell update and toolbar enable/disable based on selection.

Grid events include search, select, sort, state save/restore, submit and toolbar events.

Official references:
- https://w2ui.com/web/docs/2.0/grid
- https://w2ui.com/web/docs/2.0/grid/methods
- https://w2ui.com/web/docs/2.0/grid/events
- https://w2ui.com/web/docs/2.0/w2grid.search
- https://w2ui.com/web/docs/2.0/w2grid.save

**Design consequences**

For collection-heavy BPMNSM perspectives, first evaluate Grid's own state machine:
- records;
- selection;
- searches;
- sorting;
- column state;
- edit changes;
- toolbar state;
- saved user view state.

Only BPMNSM-specific semantic state should live outside it.

### 11.5 Sidebar as a navigable semantic tree

**DOC**

Sidebar exposes textual search, selection, expansion/collapse, sorting, targeted `update`, badges/counts and keyboard navigation. With keyboard enabled, arrow keys navigate and expand/collapse the tree; when multiple sidebars exist, the last sidebar in which the user selected a record owns keyboard activity.

Official references:
- https://w2ui.com/web/docs/2.0/sidebar/methods
- https://w2ui.com/web/docs/2.0/w2sidebar.keyboard
- https://w2ui.com/web/docs/2.0/w2sidebar.badge
- https://w2ui.com/web/docs/2.0/w2sidebar.setCount

**BPMNSM-HYP**

Counts/badges may eventually communicate meaningful projection information, conflicts or pending states, but only if the displayed count/status has an explicit BPMNSM semantic definition.

### 11.6 Layout as composition and contextual feedback boundary

**DOC**

Layout panels can receive Tabs and Toolbar natively. Layout also exposes panel-local lock, message and confirm operations.

Official references:
- https://w2ui.com/web/docs/2.0/layout/methods
- https://w2ui.com/web/docs/2.0/w2layout.message

**Design consequence**

Feedback can be scoped to the work area affected by an operation rather than always interrupting the entire application.

### 11.7 Popup / message / overlay as different transient interaction scales

**DOC**

W2Popup can display a message within the current popup. W2UI overlay facilities can position transient content relative to an element or original event and can be configured for context-menu positioning.

Official references:
- https://w2ui.com/web/docs/2.0/w2popup.message
- https://w2ui.com/web/docs/2.0/popup/overlays

**BPMNSM-HYP**

Use the smallest interaction scale that preserves clarity:
- menu for a compact command set;
- drop/overlay for a lightweight contextual chooser;
- panel message for context-local feedback;
- popup/form for a transactional interaction needing structured input.

This is a design heuristic, not a W2UI rule.

## 12. Official examples: use with version discipline

**EX**

The official demo catalogue demonstrates interaction families including Sidebar & Grid, Grid & Edit, Master → Detail, Two Grids, Layout & Dynamic Tabs, Popup & Grid, Popup & Layout, dependent fields, panel tabs/toolbars, Grid search/editing/reordering, Toolbar state variations, Form Tabs, Form Toolbar and Form in a Popup.

However, the currently indexed demo catalogue identifies itself as **W2UI 1.5 Demos**.

Official demo catalogue:
- https://w2ui.com/demos/

### Version rule

A 1.5 demo is useful as evidence of an interaction pattern, but it is **not** sufficient evidence of a W2UI 2 API contract.

For BPMNSM:
1. use the demo to identify a candidate interaction pattern;
2. verify the relevant API/state/events in W2UI 2 documentation;
3. if necessary verify the installed source;
4. only then adopt the pattern.

## 13. Event lifecycle as a first-class design dimension

**DOC**

W2UI states that all controls share the same event flow. `onXxx` properties provide construction-time handlers; `.on()`/`.off()` support runtime listeners and multiple listeners. Handlers run before widget default processing. `event.preventDefault()` can cancel that default action. `event.done(...)` and, since 2.0, `await event.complete` support work after widget defaults.

Official reference:
- https://w2ui.com/web/docs/2.0/utils/events

### BPMNSM consequence

For every significant interaction, its design note should identify:
- triggering widget event;
- pre-default responsibilities;
- whether cancellation is legitimate;
- W2UI default action relied upon;
- post-default responsibilities;
- application command boundary;
- widget refresh/update boundary.

This prevents accidental cancellation of native behavior and reduces hidden coupling between features.

## 14. Ergonomic design matrix

| User intent | First W2UI family to investigate | Native state to exploit | Typical BPMNSM-specific layer |
|---|---|---|---|
| Navigate a hierarchy | Sidebar | selection, expanded nodes, visibility, keyboard focus | semantic projection / active Source |
| Work with a collection | Grid | records, selection, search, sort, columns, edit changes | semantic collection + commands |
| Trigger discoverable commands | Toolbar | enabled/disabled, hidden, checked, radio/menu selection | command applicability/execution |
| Keep peer work contexts | Tabs | active/open/order/closable state | lifecycle of BPMNSM views/resources |
| Edit structured properties | Form/Fields | record, field state, validation, pages | canonical mutation command |
| Compose a workbench | Layout | panels, size/visibility, assigned widgets | workspace perspective |
| Make a compact contextual choice | Menu/Drop/Overlay | open/selection/transient state | target/action semantics |
| Run a structured transient transaction | Popup + Form/Layout | transient view/form state | validation + application command |
| Show local operation feedback | Layout/Grid/Popup message | local message/lock state | result/conflict semantics |

The matrix selects a **first investigation target**, not an automatic implementation.

## 15. Reusable design record for future BPMNSM UI tranches

Every significant W2UI tranche should record:

```text
BPMNSM INTENT
What must the user accomplish?

INTERACTION PATTERN
Hierarchy / collection / master-detail / command / edit /
transient choice / workspace / multi-context / feedback ...

W2UI CANDIDATES
Which macro-components could own the interaction?

DOC
What W2UI 2 officially guarantees.

EX
Which official examples demonstrate the pattern.
Version of each example.

SRC
Only exact installed-source facts needed to resolve ambiguity.

EXP
Only reproducible experiments needed to resolve runtime ambiguity.

BPMNSM-HYP
Project-specific proposed mapping.

STATE OWNERSHIP
Which state belongs to W2UI and which belongs to BPMNSM.

EVENT CONTRACT
Before/default/after behavior and command boundary.

UPDATE CONTRACT
Which public widget operation reflects the result.

PROOF
Unit → integration → Vite/Chrome.
```

This record is the preferred bridge between architecture and implementation.

## Capitalized pattern — top-level workspace tabs and repository-wide Diagrams — 2026-09-23

**BPMNSM intent.** Separate three workspace concerns without semantic collapse: logical Environment, diagram representations, physical Sources.

**Interaction pattern.** One top-level workspace navigation + independent tree projections + master/detail selection.

**W2UI composition.** One top-level `w2tabs` owns `Environment | Diagrams | Sources`; W2UI Sidebars own the trees. Do not create a second nested tab level for the same concepts and do not duplicate the selected tab as a redundant tree root. Use public tab/sidebar state and commands rather than parallel DOM state.

**BPMNSM state ownership.** W2UI owns tab/sidebar interaction state. BPMNSM owns Source/Resource inventory, logical Environment projection, RepositoryDocument identity, diagram projection and representation loading.

**Diagrams projection contract.** `Diagrams` is repository-wide, grouped as `BPMN Processes / BPMN Collaborations / ArchiMate`. BPMN leaves carry the owning `RepositoryDocument` identity plus diagram identity. Selection loads the owning document before opening the requested BPMNDiagram and showing its existing Diagram properties. ArchiMate uses its existing representation path.

**Proof.** 2026-09-23: 20/20 targeted tests GREEN; full Viewer/Editor/Pages build GREEN; Chrome proof GREEN across multiple BPMN documents and ArchiMate.

**Open adjacent frontier.** `Sources` remains physical. Its minimal Resource detail and the interactive `Show Sources tab` menu-check still require final product proof. No generic Resource ↔ logical-object correspondence is established by this UI pattern.
