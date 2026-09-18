# Process Interoperability

## From reference models to operational reality

**A vision for governable, traceable, multi-view process ecosystems ---
and for BPMNSM as an exploratory implementation of that vision.**

> Enterprises do not suffer from a lack of process models. They suffer
> from fragmentation between the models that prescribe, explain, govern,
> implement, automate, and monitor how work is actually done.

------------------------------------------------------------------------

## Executive proposition

Large industrial organizations operate through a dense ecosystem of
process references:

-   external standards and regulations;
-   corporate Business Management Systems (BMS);
-   capability and Centre of Competence (CoC) frameworks;
-   business-unit and business-line policies;
-   programme and customer requirements;
-   private operational processes;
-   inter-enterprise collaborations;
-   application workflows and integration flows;
-   execution evidence, monitoring, and improvement loops.

These representations are rarely aligned end to end.

A requirement originating in an external standard may be interpreted
into a corporate rule, redistributed across several BMS processes,
tailored by a business unit, enacted in a programme, and finally
implemented partly by people and partly by applications. At each
transition, provenance, formal semantics, rationale, applicability, and
consistency can be weakened or lost.

**The opportunity is not to create one universal model. It is to make
heterogeneous process representations interoperable while preserving
their native viewpoints and enabling controlled semantic transposition
between them.**

BPMN is a particularly valuable pivot for the behavioral dimension
because it can serve business communication while retaining precise
process semantics, and because it explicitly distinguishes private,
public, executable, and collaborative process concerns. BPMNSM explores
how BPMN can become part of a broader governed process-reference
ecosystem without turning BPMN into an enterprise-architecture
metamodel.

------------------------------------------------------------------------

# 1. The enterprise process problem

## From standards to practice, meaning is repeatedly transformed

A typical industrial chain looks like this:

``` text
External standard / regulation
            ↓
Corporate interpretation
            ↓
Policy / BMS requirement
            ↓
Generic process
            ↓
Business-unit or programme tailoring
            ↓
Operational enactment
            ↓
Human + application execution
            ↓
Evidence / monitoring / improvement
```

Each arrow is a semantic transformation.

Yet these transformations are commonly managed through documents, local
conventions, manually maintained traceability, and tool-specific
repositories. The result is familiar:

-   the same obligation is interpreted differently in different
    organizations;
-   process owners lose direct access to the source rationale;
-   formal structures in external standards are flattened into prose;
-   generic models and operational implementations drift apart;
-   collaborations between companies are reinvented independently by
    each party;
-   workflow automation becomes disconnected from process governance;
-   enterprise architecture describes capabilities and applications
    while operational process repositories evolve separately.

The problem is therefore not only *process modeling*.

It is **process meaning engineering across viewpoints, organizations,
lifecycle stages, and implementation technologies**.

------------------------------------------------------------------------

# 2. One process ecosystem, many legitimate models

There is no single "right" process model. A useful process repository
must support models created for different purposes.

## 2.1 By target use

  -----------------------------------------------------------------------
  Target use                          Typical question
  ----------------------------------- -----------------------------------
  Communication                       What happens, and who is involved?

  Governance                          What must be done, owned,
                                      controlled, or demonstrated?

  Architecture                        How does behavior realize
                                      capabilities and interact with
                                      organizations, information and
                                      applications?

  Analysis                            Where are dependencies, handovers,
                                      risks, bottlenecks or
                                      inconsistencies?

  Operationalization                  How is a generic process enacted in
                                      a concrete environment?

  Automation                          What behavior can be executed by
                                      workflow, integration or
                                      application engines?

  Inter-enterprise coordination       What interaction contract allows
                                      independent organizations to work
                                      together?

  Monitoring & improvement            What actually happened, and how
                                      does execution compare with intent?
  -----------------------------------------------------------------------

## 2.2 By lifecycle stage

``` text
REFERENCE
   ↓
GENERIC
   ↓
TAILORED
   ↓
ENACTED
   ↓
EXECUTABLE / DEPLOYED
   ↓
RUNNING
   ↓
OBSERVED / IMPROVED
```

A model may move through these stages without becoming the same
artifact.

The key requirement is to preserve the semantic relationships between
stages.

## 2.3 By genericity

``` text
Industry / regulatory reference
        ↓
Enterprise reference
        ↓
Capability / CoC practice
        ↓
Business-unit specialization
        ↓
Programme tailoring
        ↓
Operational configuration
        ↓
Execution instance
```

Genericity is not simply "more or less detail." It changes
applicability, ownership, constraints, and the degree to which local
choices are allowed.

## 2.4 By organizational exposure

BPMN already provides important foundations for separating interaction
from implementation:

-   **private non-executable processes** for internal behavior;
-   **private executable processes** for behavior intended for
    execution;
-   **public processes** exposing externally relevant interactions;
-   **collaborations** connecting participants through message
    exchanges.

This matters strategically for supply chains.

Instead of two organizations independently inventing tightly coupled
end-to-end processes, they can converge on a shared interaction contract
while retaining independent private implementations.

``` text
             SHARED COLLABORATION CONTRACT
                /                    \
               /                      \
      PUBLIC INTERFACE A        PUBLIC INTERFACE B
              |                        |
      PRIVATE PROCESS A        PRIVATE PROCESS B
              |                        |
      LOCAL APPLICATIONS       LOCAL APPLICATIONS
```

The shared contract stabilizes interoperability; private implementations
remain evolvable.

## 2.5 By intent: descriptive to prescriptive

A process model may describe observed work, prescribe required work,
define an allowed interaction, or specify executable behavior.

``` text
DESCRIPTIVE  ←──────────────→  PRESCRIPTIVE
what happens                  what shall happen
```

This dimension should be explicit. A descriptive discovery model should
not silently acquire the authority of a governed procedure.

## 2.6 By automation level

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

Automation can also be distributed.

A single business process may be realized across ERP, PLM, workflow
engines, ESBs, APIs, messaging platforms, human tasks, and partner
systems. The business process should remain understandable independently
of any one execution technology.

------------------------------------------------------------------------

# 3. The missing layer: enactment

Enterprises often jump directly from a generic process to
"implementation."

That hides a critical transformation.

**Enactment is the act of making a process operational in a concrete
work environment.**

``` text
Generic process
      ↓
Tailoring
      ↓
Enactment
      ├── organization & responsibilities
      ├── roles & competencies
      ├── information & data
      ├── practices & controls
      ├── applications & services
      ├── interfaces & messages
      └── local constraints
      ↓
Operational process
```

Example:

``` text
Generic activity:
    Review Change Request

Enacted for Programme X:
    accountable role → Configuration Manager
    object           → PLM Change Request
    review board     → Programme CCB
    approval         → workflow task
    supplier exchange→ governed message/API
    evidence         → decision record + audit trail
```

This gives process engineering two distinct runtimes:

1.  **Enactment-time** --- the generic process is made operational in a
    particular enterprise context.
2.  **Execution-time** --- instances of that operational process are
    performed.

Keeping these runtimes separate clarifies governance, deployment,
conformance and change impact.

------------------------------------------------------------------------

# 4. Governance must connect process and enterprise architecture

Process governance cannot be reduced to storing diagrams.

A process exists in an enterprise context:

``` text
Strategy
   ↓
Capabilities
   ↓
Organizations / CoCs
   ↓
Processes & Collaborations
   ↓
Information + Applications + Technology
   ↓
Operational enactments
```

Enterprise Architecture provides the context needed to answer questions
such as:

-   Which capabilities does this process realize?
-   Which CoC governs or maintains it?
-   Which business units and programmes apply it?
-   Which applications support or automate it?
-   Which information objects does it manipulate?
-   Which roadmap changes will affect its enactment?
-   Which standards justify its controls?
-   Which collaborations cross organizational boundaries?

**ArchiMate is therefore complementary to BPMN rather than a replacement
for it.**

BPMN provides a rich behavioral process viewpoint. ArchiMate provides a
language for relating business, application, technology, strategy and
implementation/migration concerns at enterprise-architecture level.

The objective is semantic alignment and transposition:

``` text
BPMN viewpoint
      ↕
semantic mediation
      ↕
ArchiMate viewpoint
      ↕
enterprise governance / roadmaps
```

A future BPMNSM--ArchiCG bridge can explore this relationship without
forcing either notation to abandon its native semantics.

------------------------------------------------------------------------

# 5. Multiple perspectives, one semantic landscape

A process should not have one permanent position in one permanent tree.

The same process may legitimately be viewed:

-   by Centre of Competence;
-   by capability;
-   by business unit;
-   by business line;
-   by programme;
-   by customer;
-   by process domain;
-   by external standard;
-   by lifecycle stage;
-   by automation level;
-   by collaboration;
-   by application landscape.

Therefore:

> **The position of a process in a navigation tree is not an intrinsic
> property of the process. It is the result of a projection built from
> classifications, semantic relationships, and the active viewpoint.**

Conceptually:

``` text
Semantic landscape
    ├── BPMN objects
    ├── provenance
    ├── classifications
    ├── typed relationships
    └── external representations
             ↓
       Projection profile
             ↓
      Stakeholder viewpoint
```

Examples:

``` text
VIEW: CoC
Systems Engineering
└── Verification
    └── Technical Review Process
```

``` text
VIEW: Capability
Verification & Validation
└── Space Systems
    └── Technical Review Process
```

``` text
VIEW: Programme
Programme X
└── Applicable ECSS controls
    └── Technical Review Process
```

These are not copies. They are contextual projections of related
semantic objects.

------------------------------------------------------------------------

# 6. Standards should remain first-class sources of meaning

A recurring enterprise failure mode is the progressive flattening of
standards.

``` text
formal / structured standard
            ↓
         prose
            ↓
  derived requirement
            ↓
      process text
            ↓
        practice
```

After several transformations, teams may know *what* they are expected
to do while losing access to:

-   the originating rule;
-   the formal structure of the source;
-   its applicability conditions;
-   the interpretation decision;
-   the tailoring rationale;
-   the relationship with other requirements;
-   evidence that the operational practice still conforms.

A process-interoperability framework should instead preserve the chain:

``` text
SOURCE MODEL / STANDARD
          ↓ interpretedAs
ENTERPRISE OBLIGATION
          ↓ implementedBy
BPMN PROCESS ELEMENT
          ↓ enactedAs
OPERATIONAL PRACTICE
          ↓ realizedBy
HUMAN / APPLICATION BEHAVIOR
          ↓ evidencedBy
EXECUTION EVIDENCE
```

And it should be navigable in both directions.

When an external standard already contains formal or structured models,
those models should remain authoritative representations in their own
"semantic ground." Transposition should create related representations,
not silently destroy the source formalism.

------------------------------------------------------------------------

# 7. Semantic mediation, not universal normalization

The central idea is deliberately different from building one giant
enterprise metamodel.

``` text
Representation A
      ↕
semantic mediation
      ↕
Representation B
```

Each representation remains native to its purpose.

The mediation layer makes explicit:

-   identity;
-   provenance;
-   classification;
-   correspondence;
-   specialization;
-   derivation;
-   tailoring;
-   conformance;
-   governance;
-   realization;
-   enactment;
-   deployment;
-   execution.

A useful vocabulary may include relationships such as:

``` text
governs
maintains
owns
uses
applies
conformsTo
derivedFrom
tailors
realizes
participatesIn
implements
enacts
deploys
executes
monitors
```

The goal is not lossless equivalence where equivalence does not exist.

The goal is **controlled, inspectable and reversible transposition**,
with loss and uncertainty made explicit.

------------------------------------------------------------------------

# 8. BPMN as a behavioral interoperability pivot

BPMN is attractive because it sits at an unusual boundary.

It is understandable by business stakeholders, yet precise enough to
represent sophisticated process semantics and to support executable
process models. The OMG specification explicitly covers private
non-executable, private executable and public processes, and BPMN
collaborations support interactions between participants.

This makes BPMN useful across a continuum:

``` text
DISCUSS
   → DESCRIBE
      → GOVERN
         → COLLABORATE
            → ENACT
               → AUTOMATE
                  → MONITOR
```

But BPMN alone does not provide the complete lifecycle, governance,
provenance, enterprise architecture, or semantic mediation framework
described here.

That gap is the space BPMNSM explores.

------------------------------------------------------------------------

# 9. BPMNSM: an exploratory interoperability workbench

**BPMNSM is not positioned as another process repository.**

It is an exploratory workbench for testing how a governed process
ecosystem could work when BPMN remains the behavioral pivot but is
enriched by explicit semantics, provenance, classifications, viewpoints
and transposition mechanisms.

Its design principles are intentionally pragmatic:

### BPMN remains BPMN

If BPMN can express something, BPMNSM should use native BPMN rather than
inventing a replacement metamodel.

### Extensions enrich; they do not confiscate

Additional semantics belong in controlled extensions and schemas.

### Unknown does not mean invalid

External information should be preserved whenever possible, even when
BPMNSM cannot yet interpret it.

### Views are projections

A CoC-centric tree, capability-centric tree and programme-centric tree
can be different projections of the same semantic landscape.

### Repository is not ontology

Repository structure concerns persistence, provenance and configuration.
It must not dictate the only semantic organization of processes.

### Transposition is explicit

Moving from BPMN to an EA viewpoint, or from a generic process to an
enacted process, is a semantic operation --- not a copy/paste
convention.

------------------------------------------------------------------------

# 10. The first demonstrator: CoC-centric rationalization

The immediate BPMNSM use case is deliberately focused.

Centres of Competence in the space domain need to rationalize
heterogeneous process references while retaining visibility over the
processes and collaborations they govern.

The first process-browser projection is therefore CoC-centric:

``` text
Environment
├── Centres of Competence
│   ├── Systems Engineering
│   │   ├── Collaborations
│   │   └── Processes
│   ├── Configuration Management
│   │   ├── Collaborations
│   │   └── Processes
│   └── Product Assurance
│       └── ...
├── Collaborations
└── Processes
```

This is a **viewpoint decision**, not a claim that CoCs are the
universal ontological parent of processes.

The same semantic landscape should later support other projections.

------------------------------------------------------------------------

# 11. From CoC view to group capability governance

Consider a diversified industrial group.

A group-level Systems Engineering policy may need to be interpreted
across commercial aviation, defence, space, business lines and
programmes.

A capability-centric projection could reveal:

``` text
Systems Engineering
├── Group policy
├── Commercial Aircraft
│   ├── Business Line A
│   └── Programmes
├── Defence
│   └── Programmes
└── Space
    ├── Business Line B
    └── Programmes
```

Now add:

-   heterogeneous BMS repositories;
-   external standards;
-   process owners;
-   CoCs;
-   application landscapes;
-   programme tailoring;
-   evidence of effective application.

The enterprise can move from "we have a policy" to questions such as:

-   Where is it implemented?
-   Where has it been tailored?
-   Which source requirements justify each process control?
-   Which business units diverge, and why?
-   Which applications realize the operational practice?
-   What changes if the external standard evolves?

That is where process interoperability becomes an enterprise governance
capability.

------------------------------------------------------------------------

# 12. Business value

## Reduce semantic drift

Preserve traceability from external source to enterprise interpretation,
process design, enactment and execution.

## Rationalize without flattening

Compare heterogeneous process repositories without forcing every
contributor into a single modeling worldview.

## Reuse what should be shared

Separate shared collaboration contracts from private implementations,
reducing unnecessary inter-enterprise coupling.

## Make standards actionable

Connect obligations to the exact process elements, controls, roles, data
and operational mechanisms that implement them.

## Accelerate change impact analysis

Trace a change in regulation, policy, capability, application or
programme context to affected processes and enactments.

## Bridge governance and execution

Connect enterprise architecture and process governance to the systems
and workflows that actually perform the work.

## Improve automation quality

Derive executable or integration-oriented models from governed process
intent instead of treating automation as a disconnected technical
redesign.

## Preserve supplier autonomy

Standardize interaction where interoperability creates value while
allowing organizations to retain independent private processes and
systems.

## Turn repositories into navigable knowledge

Replace static process catalogs with multi-perspective,
stakeholder-oriented projections.

------------------------------------------------------------------------

# 13. Stakeholder value

### Executive & transformation leaders

See how standards, capabilities, policies and transformation roadmaps
propagate into operational reality.

### Enterprise architects

Connect behavioral detail to capabilities, organizations, applications,
information and transformation states.

### Process owners & CoCs

Rationalize heterogeneous process references, govern variants, preserve
provenance, and identify gaps or duplication.

### Programme & operational teams

Understand what applies locally, why it applies, and how generic policy
has been enacted.

### Automation & integration teams

Work from explicit behavioral contracts and governed process semantics
rather than reverse-engineering intent from documents.

### Partners & suppliers

Collaborate through stable public interaction contracts while protecting
private implementation choices.

### Assurance & compliance

Navigate from operational evidence back to process controls, derived
requirements and authoritative standards.

------------------------------------------------------------------------

# 14. A target capability map

``` text
                         PROCESS INTEROPERABILITY
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
   INGEST & PRESERVE       MEDIATE & RELATE       PROJECT & NAVIGATE
          │                       │                       │
 BPMN / schemas / EA      identity / provenance     CoC / capability
 external references      typed relationships       programme / standard
 heterogeneous BMS        classifications           lifecycle / automation
          │                       │                       │
          └───────────────────────┼───────────────────────┘
                                  │
                         TRANSPOSE & ENACT
                                  │
                    generic → tailored → enacted
                    BPMN ↔ EA / ArchiMate
                    private ↔ public contract
                    process → executable realization
                                  │
                                  ↓
                         OBSERVE & IMPROVE
```

------------------------------------------------------------------------

# 15. What BPMNSM should demonstrate

BPMNSM can remain small enough to be exploratory while demonstrating
high-value mechanisms:

1.  Import heterogeneous BPMN without destructive normalization.
2.  Preserve identity, provenance and unknown information.
3.  Assemble fragmented process references.
4.  Resolve references progressively as additional models arrive.
5.  Classify the same process through multiple schemes.
6.  Project one semantic landscape through different navigation
    viewpoints.
7.  Use CoC as the first structuring viewpoint.
8.  Preserve and expose public/private/collaboration distinctions.
9.  Link process semantics to external schemas and standards.
10. Explore BPMN ↔ ArchiMate/ArchiCG transposition.
11. Represent generic → tailored → enacted → executable relationships.
12. Make transformation provenance and semantic loss inspectable.
13. Connect process governance with application realization.
14. Demonstrate round-trip interoperability rather than one-way
    conversion.

The objective is not to claim that BPMNSM already solves the complete
enterprise problem.

Its value as an exploratory platform is to **make the architecture
testable**.

------------------------------------------------------------------------

# 16. A possible future interaction model

The process repository becomes a semantic navigation environment.

A user could choose:

``` text
PRIMARY VIEW       CoC
SECONDARY          Process Domain
FILTER             Programme = X
FILTER             Standard = ECSS
SHOW               Collaborations + Processes
```

Then switch to:

``` text
PRIMARY VIEW       Capability
SECONDARY          Business Unit
FILTER             Lifecycle = Enacted
COLOR BY           Automation Level
SHOW               Processes + Applications
```

Or:

``` text
PRIMARY VIEW       External Standard
SECONDARY          Requirement Family
FILTER             Applicability = Programme X
SHOW               Derived Controls + BPMN Activities
```

The underlying semantic objects do not move.

**The perspective changes.**

------------------------------------------------------------------------

# 17. Strategic thesis

The long-term proposition can be stated simply:

> **Enterprise process interoperability is the ability to preserve,
> relate, transpose and operationalize process meaning across standards,
> repositories, organizations, viewpoints and execution environments
> without collapsing their legitimate differences.**

BPMN can provide a powerful behavioral pivot.

Enterprise Architecture and ArchiMate can provide governance and
architectural context.

Semantic mediation can connect the viewpoints.

BPMNSM can provide the experimental workbench in which these mechanisms
become concrete, inspectable and demonstrable.

------------------------------------------------------------------------

# 18. Why now?

Digital transformation has increased the number of process
representations rather than eliminating them.

Enterprises simultaneously face:

-   stronger supply-chain integration;
-   model-based engineering;
-   distributed application ecosystems;
-   increasing regulatory traceability;
-   automation and orchestration;
-   AI-assisted engineering;
-   continuous transformation of organizations and platforms.

The cost of semantic fragmentation therefore rises precisely when
organizations need faster change.

The strategic move is not another isolated repository.

It is a **process interoperability layer** capable of turning
heterogeneous models into a governed, navigable and transposable
semantic landscape.

------------------------------------------------------------------------

# 19. Reference anchors

This vision is a BPMNSM synthesis, not a claim that the standards below
prescribe this architecture.

-   **OMG BPMN 2.0.2** --- BPMN provides a standard graphical notation
    intended to bridge business and technical audiences; the
    specification distinguishes private non-executable, private
    executable, and public processes and defines collaborations between
    participants.\
    https://www.omg.org/spec/BPMN/2.0.2/PDF/

-   **OMG BPMN overview** --- BPMN is intended for stakeholders who
    design, manage, implement and monitor business processes while
    remaining independent of a particular implementation environment.\
    https://www.omg.org/bpmn/

-   **The Open Group ArchiMate** --- ArchiMate is an open and
    independent Enterprise Architecture modeling language for describing
    and analyzing relationships across business, application and
    technology domains.\
    https://www.opengroup.org/certifications/archimate

-   **Miosis** --- visual/editorial inspiration for the interactive
    version: a narrative microsite organized around a strong
    proposition, principles, mechanisms, practice and value. BPMNSM's
    visual treatment is intentionally lighter and more
    enterprise-oriented rather than a copy of its design.\
    https://www.miosis.io/

------------------------------------------------------------------------

# 20. One-line positioning

**BPMNSM explores how BPMN can evolve from isolated process diagrams
into a governed interoperability fabric connecting standards, enterprise
architecture, operational enactment and distributed execution ---
without sacrificing the native meaning of each viewpoint.**
