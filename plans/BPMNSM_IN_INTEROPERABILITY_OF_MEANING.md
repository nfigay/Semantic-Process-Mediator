# BPMNSM

## BPMN Semantic Mediator --- From Process Diagrams to Interoperable Process Knowledge

**BPMNSM is the BPMN and process-interoperability laboratory within the
broader *Interoperability of Meaning* vision.**

It explores a practical proposition:

> **BPMN can remain the behavioral pivot for process exchange while
> semantic extensions, repository projections, provenance and controlled
> mediation connect process models to standards, enterprise
> architecture, domain vocabularies and operational enactment.**

BPMNSM is deliberately not a proprietary process metamodel replacing
BPMN.

Its purpose is to test how far a standards-based BPMN backbone can
support heterogeneous process repositories, semantic enrichment,
multi-view navigation and controlled transposition while preserving
interoperability with the BPMN ecosystem.

------------------------------------------------------------------------

# 1. Why BPMNSM exists

Enterprises rarely have one process repository.

They inherit and produce process descriptions across:

-   corporate Business Management Systems;
-   Centres of Competence;
-   business units;
-   programmes;
-   customers and suppliers;
-   external standards;
-   Enterprise Architecture repositories;
-   workflow and application platforms;
-   imported models from tools such as Enterprise Architect or ARIS.

The difficulty is not simply to display all these BPMN diagrams in one
editor.

The real problem is to preserve and understand the relationships between
them.

``` text
External reference
       ↓
enterprise interpretation
       ↓
generic process
       ↓
local tailoring
       ↓
operational enactment
       ↓
automation / execution
```

At each transition, semantics, provenance and identity can be lost.

BPMNSM explores how to keep those transitions explicit.

------------------------------------------------------------------------

# 2. BPMN first

The foundational architectural choice is intentionally conservative:

> **If BPMN already provides a reasonable representation, use BPMN.**

SemArch/BPMNSM extensions enrich BPMN where necessary; they do not
confiscate BPMN semantics.

This produces a hierarchy of responsibility:

``` text
BPMN 2.0
   │
   ├── native process semantics
   ├── collaborations
   ├── participants
   ├── message flows
   ├── data
   ├── events
   └── execution-related semantics
          │
          ↓
SemArch extensions
   │
   ├── semantic typing
   ├── repository metadata
   ├── CoC metadata
   └── additional governed semantics
          │
          ↓
external schemas / vocabularies
   ├── XSD
   ├── RDF / OWL
   ├── UML-derived vocabularies
   └── domain-specific schemas
```

The objective is maximal interoperability with the standard rather than
convenience through a proprietary canonical model.

------------------------------------------------------------------------

# 3. Preserve before interpreting

A semantic mediator must tolerate partial knowledge.

BPMNSM therefore follows an important rule:

``` text
UNKNOWN ≠ INVALID
```

and, for repository references:

``` text
UNRESOLVED ≠ INVALID
```

An imported BPMN element or reference may be perfectly legitimate even
when the current BPMNSM configuration does not yet understand its
vocabulary or cannot yet find its target.

The mediator should preserve that information whenever possible.

This is especially important for fragmented repositories.

``` text
import Process A
      ↓
reference to Process B is unresolved
      ↓
import another repository fragment
      ↓
Process B appears
      ↓
reference resolves
```

The model gains context without pretending that missing context was an
error.

------------------------------------------------------------------------

# 4. Round-trip is the evidence

Visual rendering alone is not proof of interoperability.

BPMNSM uses a stricter validation logic:

``` text
DEFINE
  ↓
MODEL
  ↓
EDIT
  ↓
SERIALIZE
  ↓
REIMPORT
  ↓
VERIFY
  ↓
ROUND-TRIP
```

For every semantic information item, four questions matter:

1.  Where is it defined?
2.  Where is it carried?
3.  How is it serialized?
4.  How is its preservation verified?

This discipline makes interoperability testable rather than declarative.

------------------------------------------------------------------------

# 5. Semantic enrichment without replacing BPMN

One demonstrated BPMNSM mechanism is schema-driven semantic enrichment.

Conceptually:

``` text
DOMAIN SCHEMA
XSD / RDF / OWL / UML / ...
       │
       ↓
schema adapter
       │
       ↓
normalized semantic descriptors
       │
       ↓
Profile Runtime
       │
       ↓
BPMN semantic object
       │
       ↓
properties UI
       │
       ↓
BPMN extension serialization
```

A BPMN object can therefore remain a native BPMN object while carrying
additional semantic typing and properties defined outside BPMN.

The current datatype architecture demonstrates this pattern using
canonical datatype references, runtime datatype resolution and widget
selection.

Unknown but valid types remain semantically unknown rather than being
silently converted into strings.

------------------------------------------------------------------------

# 6. Process repositories are more than folders of diagrams

BPMNSM distinguishes several concepts that conventional repository
interfaces often conflate:

``` text
Repository object identity
        ≠
BPMN model element identity
        ≠
Business identity
        ≠
UI occurrence identity
```

A BPMN Process can exist once semantically but appear in several
collaboration contexts.

A BPMN document can contain several semantic elements.

A repository can aggregate fragments coming from different sources.

A UI tree can show one object in different contexts without duplicating
the semantic object.

This distinction is fundamental for repository interoperability.

------------------------------------------------------------------------

# 7. Repository as BPMN, not as a hidden proprietary model

The current repository direction preserves BPMN as the canonical
exchange language.

A BPMNSM repository is represented as BPMN `Definitions` enriched with
minimal SemArch repository metadata.

Conceptually:

``` text
bpmn:Definitions
│
├── semarch:RepositoryContext
├── semarch:CoC
├── semarch:Membership
│
├── bpmn:Process
├── bpmn:Collaboration
└── ...
```

The runtime `RepositoryModel` is a projection used by the application.

It is not the canonical persistence format.

This matters because:

``` text
runtime convenience
      ≠
interchange authority
```

The exchange artifact remains standards-oriented.

------------------------------------------------------------------------

# 8. Import, open and assemble are different operations

BPMNSM separates three intentions.

## Import BPMN into Environment

Accept a valid BPMN document as a source representation without
inventing repository or CoC semantics.

## Open Repository

Recognize an explicit BPMNSM repository through its `RepositoryContext`.

## Assemble into Repository

Perform an explicit semantic operation that incorporates selected
material into a governed repository.

Conceptually:

``` text
external BPMN
      ↓
Environment
source / temporary representation
      ↓
analysis · selection · mediation
      ↓
Assembly
      ↓
BPMNSM Repository
canonical enriched BPMN
```

Import is not silent transformation.

------------------------------------------------------------------------

# 9. Fragmented repositories and progressive resolution

A major target use case is aggregation of process repositories exported
from industrial modeling platforms.

Source identity must therefore be explicit.

``` text
SourceIdentity
{
  sourceSystem
  sourceRepository
  sourceObjectId
}
```

The meaningful key is the source identity tuple, not a guessed match
based on process name or BPMN element type.

References can then have explicit states:

``` text
UNRESOLVED
RESOLVED
INVALID
```

This supports incremental aggregation.

A process imported today can become connected to a collaboration or
repository context imported tomorrow.

------------------------------------------------------------------------

# 10. The Environment is a projection

BPMNSM's Environment Browser is not the ontology of the repository.

It is a projection.

The current demonstrated process-oriented projection exposes:

``` text
Environment
├── Repositories
├── CoCs
├── Collaborations
└── Processes
```

Placement is contextual.

A Process may appear under a Collaboration when reached through:

``` text
Collaboration
    ↓
Participant
    ↓
processRef
    ↓
Process
```

The same semantic Process may legitimately occur under several
Collaborations.

The projection is derived runtime state and can be rebuilt from the
semantic model.

------------------------------------------------------------------------

# 11. From one tree to multiple process viewpoints

The current CoC-oriented work leads to a more general architectural
principle:

> **The position of a process in a navigation tree is not an intrinsic
> property of the process. It is the result of a projection built from
> classifications, semantic relationships and the active viewpoint.**

A process may simultaneously be classified by:

-   Centre of Competence;
-   capability;
-   business unit;
-   programme;
-   process domain;
-   external standard;
-   lifecycle stage;
-   genericity;
-   automation level;
-   applicability;
-   collaboration context.

The first practical BPMNSM viewpoint remains CoC-centric because the
immediate industrial problem is rationalization of space-domain process
repositories by Centres of Competence.

Future projections should not require changing process identity.

------------------------------------------------------------------------

# 12. BPMN models have different purposes

BPMNSM should eventually help distinguish process models by their
intended role.

## Target use

``` text
communication
governance
analysis
collaboration
enactment
automation
monitoring
```

## Lifecycle

``` text
REFERENCE
   ↓
GENERIC
   ↓
TAILORED
   ↓
ENACTED
   ↓
EXECUTABLE
   ↓
RUNNING
   ↓
OBSERVED
```

## Exposure

``` text
PRIVATE
PUBLIC
COLLABORATIVE
INTER-ENTERPRISE
```

## Intent

``` text
DESCRIPTIVE ←────────→ PRESCRIPTIVE
```

## Automation

``` text
MANUAL
  ↓
ASSISTED
  ↓
SEMI-AUTOMATED
  ↓
ORCHESTRATED
  ↓
FULLY AUTOMATED
```

These dimensions cross one another.

They should not be collapsed into one rigid hierarchy.

------------------------------------------------------------------------

# 13. Public collaboration and private autonomy

BPMN is particularly valuable for networked enterprises because it can
distinguish private process behavior from public interactions and
collaborations.

This enables a powerful interoperability pattern:

``` text
              SHARED COLLABORATION
                    CONTRACT
                /             \
               /               \
      PUBLIC INTERFACE A   PUBLIC INTERFACE B
              │                   │
      PRIVATE PROCESS A   PRIVATE PROCESS B
              │                   │
       LOCAL SYSTEMS       LOCAL SYSTEMS
```

Organizations can stabilize the interaction contract while preserving
autonomy over their private implementation.

This is a concrete contribution of BPMN to end-to-end interoperability
in networked enterprises.

------------------------------------------------------------------------

# 14. The missing transition: enactment

A generic process does not become operational merely because it is
published.

It must be enacted.

``` text
Generic Process
       ↓
Tailoring
       ↓
Enactment
       ├── organization
       ├── roles
       ├── information
       ├── applications
       ├── controls
       ├── interfaces
       └── local constraints
       ↓
Operational Process
```

This introduces two distinct runtimes:

**Enactment-time** --- process intent is bound to a concrete operational
environment.

**Execution-time** --- instances of the enacted process are performed.

This is where BPMNSM naturally meets Enterprise Architecture and
automation.

------------------------------------------------------------------------

# 15. BPMNSM ↔ ArchiCG

BPMNSM and ArchiCG deliberately explore complementary semantic grounds.

``` text
                 SEMANTIC CARTOGRAPHY
                         │
             ┌───────────┴───────────┐
             │                       │
          ArchiCG                  BPMNSM
             │                       │
         ArchiMate                  BPMN
             │                       │
 capability / organization      process / activity
 application / technology       event / gateway
 strategy / transformation      collaboration / message
             │                       │
             └───────────┬───────────┘
                         │
                semantic mediation
                         │
                  transposition
```

An architectural representation can identify that a process realizes a
capability and is supported by application services.

BPMNSM can expose the detailed behavioral realization.

The target is not naive one-to-one conversion.

It is controlled navigation between representations while preserving
identity, provenance and known semantic differences.

------------------------------------------------------------------------

# 16. BPMNSM and external standards

Process governance often begins outside the process repository.

``` text
External Standard
       ↓ interpretedAs
Enterprise Obligation
       ↓ implementedBy
BPMN Process Element
       ↓ enactedAs
Operational Practice
       ↓ evidencedBy
Execution Evidence
```

BPMNSM can become the process-side instrument for maintaining this
traceability.

Where a standard contains structured or formal models, those source
representations should remain first-class artifacts.

They should not be flattened irreversibly into BPMN.

BPMN is the behavioral viewpoint, not the universal semantic ground.

------------------------------------------------------------------------

# 17. BPMNSM and Continuous Operational Interoperability

BPMNSM contributes primarily to the behavioral continuity of networked
enterprises.

``` text
PREPARE
standards · process governance
       ↓
DESIGN
generic processes · collaboration contracts
       ↓
MEDIATE
repositories · semantics · viewpoints
       ↓
ENACT
roles · applications · information
       ↓
OPERATE
private processes · public interactions
       ↓
OBSERVE
execution evidence · divergence
       ↓
ADAPT
process and collaboration evolution
```

The process repository becomes part of a continuous interoperability
loop rather than a static documentation endpoint.

------------------------------------------------------------------------

# 18. Current demonstrated foundations

The BPMNSM project has already demonstrated several foundations relevant
to this vision.

## Standards-based semantic properties

-   semantic typing through BPMN extensions;
-   external schema binding;
-   XSD datatype resolution;
-   runtime property descriptors;
-   datatype-aware widgets;
-   preservation of unknown valid datatypes;
-   BPMN-model mutations through the bpmn-js command stack.

## Repository semantics

-   runtime `RepositoryModel`;
-   session `RepositoryDocumentStore`;
-   BPMN component registration;
-   repository metadata serialized through SemArch extensions;
-   CoC and Membership projection;
-   unresolved-to-resolved membership behavior;
-   idempotent repository metadata projection.

## Environment projection

-   Repositories / CoCs / Collaborations / Processes;
-   contextual Collaboration → Participant → Process navigation;
-   unresolved references;
-   black-box participants;
-   the same Process occurring in several Collaboration contexts;
-   derived projection without mutating the repository model.

## Application state

-   neutral cold start;
-   no implicit CoC;
-   no implicit business BPMN model;
-   explicit `NO MODEL` toolbar state;
-   Welcome view in the central W2UI workspace.

The last explicitly demonstrated regression baseline in the project
context is **24 test files / 95 tests passing**.

------------------------------------------------------------------------

# 19. What BPMNSM is not

The boundaries matter as much as the features.

BPMNSM is not intended to be:

-   a proprietary replacement for BPMN;
-   a universal enterprise metamodel;
-   an ArchiMate replacement;
-   an ontology editor;
-   a workflow engine;
-   a new source of truth that confiscates existing repositories;
-   a tree whose UI hierarchy defines enterprise semantics.

Instead:

> **BPMNSM is a semantic mediation and process-interoperability
> workbench built around BPMN.**

------------------------------------------------------------------------

# 20. Research trajectory

The current foundations enable several deeper experiments:

``` text
BPMN preservation
       ↓
semantic enrichment
       ↓
fragmented repository aggregation
       ↓
multi-perspective projection
       ↓
standards traceability
       ↓
generic → tailored → enacted
       ↓
public/private collaboration contracts
       ↓
BPMN ↔ Enterprise Architecture mediation
       ↓
automation / execution bindings
       ↓
continuous process interoperability
```

Important research questions include:

-   How should multiple classification schemes coexist?
-   How should governance relationships differ from UI containment?
-   How should process variants and tailoring be represented?
-   How can a formal standard remain traceable through derived BPMN
    practices?
-   How should BPMN and ArchiMate representations be transposed without
    false equivalence?
-   How should source identity survive aggregation and round-trip?
-   How can external platform semantics be preserved when BPMN is only
    part of the source model?
-   How should AI assist semantic mapping without becoming semantic
    authority?
-   How can divergence between governed process intent and operational
    execution be detected?

------------------------------------------------------------------------

# 21. Enterprise value

## Rationalize fragmented process repositories

Bring heterogeneous process sources into a navigable environment without
immediately destroying their provenance.

## Preserve standards-based interoperability

Keep BPMN as the exchange backbone rather than hiding process semantics
in a proprietary repository model.

## Improve process governance

Connect CoCs, classifications and external obligations to the processes
they govern.

## Support supplier autonomy

Use public interactions and collaborations to stabilize cross-enterprise
contracts while private implementations remain autonomous.

## Make process variants intelligible

Distinguish reference, generic, tailored, enacted and executable
representations.

## Connect process and Enterprise Architecture

Relate detailed behavior to capabilities, organizations, information and
applications.

## Prepare safer automation

Connect executable behavior to governed process intent and enactment
context.

## Reduce semantic drift

Preserve identity, provenance and explicit mediation across repository
and lifecycle transformations.

------------------------------------------------------------------------

# 22. Position inside Interoperability of Meaning

``` text
INTEROPERABILITY OF MEANING
          │
          ├── Standards Governance
          │
          ├── Semantic Cartography
          │       └── Polyglot Hypermodels
          │
          ├── Modeling Grounds
          │       ├── ArchiMate → ArchiCG
          │       ├── BPMN      → BPMNSM
          │       ├── OWL
          │       ├── UML
          │       └── SysML
          │
          ├── Responsible AI
          │
          ├── Human Capability
          │
          └── Continuous Operational Interoperability
```

BPMNSM is the **BPMN/process laboratory** of this wider landscape.

It provides a bounded environment in which interoperability principles
can be implemented, tested and challenged against real process
semantics.

------------------------------------------------------------------------

# One-line positioning

> **BPMNSM explores how BPMN can evolve from isolated process diagrams
> into an interoperable process knowledge fabric connecting
> repositories, standards, governance, collaboration, enactment and
> execution --- while remaining BPMN.**
