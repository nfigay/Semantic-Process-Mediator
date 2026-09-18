# Interoperability of Meaning

## From standards and models to continuous operational interoperability

**A vision for networked enterprises that must collaborate end to end,
continuously, across organizations, disciplines, standards, models,
technologies and changing contexts --- without pretending that their
meanings can be reduced to one universal representation.**

------------------------------------------------------------------------

## Executive proposition

Modern enterprises do not operate inside one information system, one
organization, one standard, one ontology, one process repository or one
model.

They operate in **networks of autonomous organizations and evolving
digital ecosystems**.

Products, services and decisions cross customers, suppliers, partners,
regulators, programmes, business units, engineering disciplines,
enterprise applications and operational platforms. Each actor uses
representations adapted to its own purpose: standards, requirements,
ontologies, enterprise architectures, system models, process models,
application models, data models and executable workflows.

The strategic problem is therefore not simply integration.

It is the ability to **prepare, build, operate and continuously maintain
interoperability while the network itself keeps changing**.

This vision brings together several complementary explorations:

-   interoperability of technical enterprise applications;
-   end-to-end interoperability in networked enterprises;
-   Continuous Operational Interoperability;
-   standards strategy and governance;
-   semantic cartography and polyglot hypermodels;
-   BPMN process interoperability through BPMNSM;
-   Enterprise Architecture and ArchiMate exploration through ArchiCG;
-   OWL, UML and SysML as additional semantic grounds;
-   responsible exploration of AI and its semantic fallacies;
-   *Inhabiting Babel: A Manifesto for Responsible Meaning Engineering*;
-   the human and organizational principles expressed through the Open
    People Factory manifesto.

They are not separate topics accidentally placed next to one another.

They investigate a common question:

> **How can autonomous people, organizations and digital systems
> collaborate effectively across different representations of the world
> while retaining control of their own meanings, responsibilities and
> evolution?**

------------------------------------------------------------------------

# 1. Interoperability is an enterprise capability, not an interface

Traditional interoperability projects are often framed as connections:

``` text
System A  ←→  System B
```

But industrial collaboration is closer to:

``` text
Organization A
   ├── people
   ├── processes
   ├── standards
   ├── models
   └── applications
          ↕
     collaboration
          ↕
Organization B
   ├── different governance
   ├── different semantics
   ├── different lifecycle
   ├── different applications
   └── different constraints
```

The network changes continuously.

Partners join and leave. Standards evolve. Programmes tailor policies.
Applications are upgraded. Organizations are reorganized. AI introduces
new mediators and new sources of uncertainty.

Interoperability cannot therefore be a state certified once and then
forgotten.

> **Interoperability must be prepared through governance, built through
> architecture, realized in operations, observed in use, and maintained
> through continuous change.**

This is the core idea of **Continuous Operational Interoperability**.

------------------------------------------------------------------------

# 2. End-to-end interoperability in networked enterprises

The meaningful unit is not an application pair. It is an end-to-end
collaborative outcome.

``` text
External standards & regulation
             ↓
Enterprise strategies & policies
             ↓
Capabilities & responsibilities
             ↓
Processes & collaboration contracts
             ↓
Information & system models
             ↓
Applications & digital services
             ↓
Cross-enterprise operations
             ↓
Evidence, feedback & evolution
```

A failure anywhere in this chain can break interoperability even when
every technical interface is functioning.

End-to-end interoperability therefore combines:

-   **organizational interoperability** --- actors, responsibilities,
    governance and autonomy;
-   **process interoperability** --- compatible behavior and
    collaboration contracts;
-   **information interoperability** --- usable information across
    boundaries;
-   **semantic interoperability** --- explicit interpretation,
    correspondence and context;
-   **technical interoperability** --- protocols, services, platforms
    and infrastructure;
-   **operational interoperability** --- the collaboration actually
    works in practice;
-   **evolutionary interoperability** --- it continues to work as all of
    the above change.

This makes interoperability an architectural and governance concern
before it becomes an integration concern.

------------------------------------------------------------------------

# 3. Continuous Operational Interoperability

Continuous Operational Interoperability can be understood as a lifecycle
capability:

``` text
PREPARE
governance · strategy · standards
        ↓
BUILD
enterprise architecture · models · mediation
        ↓
ENACT
roles · applications · data · controls
        ↓
OPERATE
collaboration · exchange · execution
        ↓
OBSERVE
evidence · divergence · performance
        ↓
ADAPT
change · realignment · evolution
        ↺
```

The important word is **continuous**.

The objective is not perfect permanent alignment. That would be
unrealistic in a network of evolving autonomous actors.

The objective is to make divergence **visible, governable and repairable
at an acceptable cost**.

------------------------------------------------------------------------

# 4. One reality, multiple semantic grounds

Different communities model different aspects of reality for different
purposes.

``` text
Business governance      → Enterprise Architecture
Processes                → BPMN
Systems engineering      → SysML
Software / structure     → UML
Formal semantics         → OWL / ontologies
Standards                → normative documents + formal models
Execution                → workflow / applications / APIs
```

These representations overlap, but they are not interchangeable.

A BPMN Process is not an ArchiMate Business Process merely because both
use the word "process". An OWL class is not a SysML block. A capability
model is not a process architecture. An executable workflow is not
automatically the authoritative enterprise procedure.

The proposed principle is:

> **Do not replace the semantic ground of a representation merely to
> make it interoperable. Preserve it, characterize it, and mediate
> between viewpoints.**

------------------------------------------------------------------------

# 5. Semantic cartography instead of forced unification

Many interoperability approaches implicitly seek a privileged center:

``` text
many models
    ↓
canonical model
    ↓
one semantic space
```

That can be useful locally, but it becomes dangerous when the canonical
representation is mistaken for neutral or universal meaning.

Semantic cartography starts from another premise:

``` text
Representation A       Representation B
      │                       │
      │     correspondence    │
      ├───────────────────────┤
      │                       │
      ↓                       ↓
 semantic ground A       semantic ground B
```

The objective is to make explicit:

-   where representations overlap;
-   where they differ;
-   what assumptions they make;
-   who owns those assumptions;
-   what transformations are possible;
-   what information is lost;
-   which mappings are contextual;
-   which mappings remain uncertain or contested.

**Babel becomes navigable rather than artificially eliminated.**

------------------------------------------------------------------------

# 6. Polyglot hypermodels: representations that can travel

Polyglot hypermodels explore a complementary idea.

A complex object can have several representations, each optimized for a
concrete modeling language, platform or lifecycle purpose.

``` text
                   HYPERMODEL
                       │
       ┌───────────────┼───────────────┐
       │               │               │
    ArchiMate         BPMN           SysML
       │               │               │
  EA platform     BPMN platform    MBSE platform
       │               │               │
       └──────── semantic links ────────┘
```

The goal is not to copy one representation mechanically into every
language.

It is to support **controlled transposition** between representations
while preserving identity, provenance, relationships and known semantic
differences.

This makes semantic cartography operational:

> the map is not a universal model; it is a way of navigating between
> models.

------------------------------------------------------------------------

# 7. A family of exploratory bricks

The vision is intentionally modular.

No single tool is expected to solve interoperability.

## Standards governance

International and industrial standards provide long-lived anchors in
volatile technology landscapes. Work on standards and interoperability,
including participation in **ASD Strategic Standardization Group (ASD
SSG)** activities, explores how complementary standards can be governed
as an evolving architecture rather than accumulated as an unmanaged
catalogue.

The **Strategic Standards RadarChart Viewer** explores how a standards
landscape can become strategically navigable: relevance, maturity,
applicability, relationships and evolution become visible to
decision-makers and architects.

## Semantic Cartography & Hypermodels

The research thread provides the conceptual mediation layer: plurality
of representations, explicit mappings, semantic distances, provenance,
viewpoints and transposition.

## ArchiCG

**ArchiCG** is the exploratory Enterprise Architecture and
semantic-cartography workbench. ArchiMate provides a particularly useful
standardized EA viewpoint, while the graph foundation enables
navigation, multiple representations and experimentation with semantic
relationships.

## BPMNSM

**BPMNSM** explores the process viewpoint. BPMN remains the behavioral
pivot while BPMNSM investigates process repositories, public/private
processes, collaborations, classifications, governance, enactment,
automation and semantic process mediation.

## OWL, UML and SysML

These standards are additional semantic grounds rather than formats to
absorb into BPMN or ArchiMate.

-   **OWL** supports explicit ontological representations and formal
    reasoning.
-   **UML** provides software and general-purpose structural/behavioral
    modeling.
-   **SysML** provides systems-engineering viewpoints and model-based
    engineering structures.

The research question is not "which language wins?"

It is:

> **How can useful relationships between their representations be made
> explicit without erasing the reasons why those representations are
> different?**

------------------------------------------------------------------------

# 8. BPMN and the process-interoperability viewpoint

Process repositories are a particularly rich test case because process
models exist along several independent dimensions.

## By target use

  -----------------------------------------------------------------------
  Target                              Primary question
  ----------------------------------- -----------------------------------
  Communication                       What happens?

  Governance                          What shall happen and who is
                                      accountable?

  Architecture                        What capabilities and systems
                                      support the behavior?

  Analysis                            Where are dependencies, risks and
                                      inconsistencies?

  Collaboration                       What interaction contract connects
                                      autonomous participants?

  Enactment                           How is generic intent made
                                      operational here?

  Automation                          What can be executed or
                                      orchestrated?

  Monitoring                          What actually happened?
  -----------------------------------------------------------------------

## By lifecycle

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

## By exposure

``` text
PRIVATE PROCESS
      ↕
PUBLIC INTERFACE
      ↕
SHARED COLLABORATION
      ↕
PUBLIC INTERFACE
      ↕
PRIVATE PROCESS
```

This is essential for networked enterprises: organizations can share a
collaboration contract without surrendering their private
implementation.

## By intent

``` text
DESCRIPTIVE  ←──────────────→  PRESCRIPTIVE
what happens                  what shall happen
```

## By automation

``` text
MANUAL → ASSISTED → SEMI-AUTOMATED → ORCHESTRATED → FULLY AUTOMATED
```

BPMNSM explores how these dimensions can coexist without forcing every
model into one fixed repository hierarchy.

------------------------------------------------------------------------

# 9. The missing transition: enactment

A generic process does not become operational merely because it is
published.

It must be enacted.

``` text
Generic process
      ↓
Tailoring
      ↓
Enactment
      ├── organization
      ├── responsibilities
      ├── information
      ├── applications
      ├── controls
      ├── interfaces
      └── local constraints
      ↓
Operational process
```

This distinguishes two important runtimes:

**Enactment-time** --- enterprise intent is bound to a concrete
operational environment.

**Execution-time** --- instances of that enacted process are performed.

This distinction creates a natural bridge between process governance,
Enterprise Architecture and automation.

------------------------------------------------------------------------

# 10. Enterprise Architecture as governance context

Enterprise Architecture provides context that BPMN should not attempt to
reproduce.

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
Operational Enactments
```

ArchiMate can represent architectural relationships across these
domains.

BPMN can provide deeper behavioral semantics.

The opportunity is not to translate everything into one language but to
establish controlled relationships:

``` text
        BPMN
         ↕
 semantic mediation
         ↕
      ArchiMate
         ↕
      ArchiCG
         ↕
EA governance / transformation
```

BPMNSM and ArchiCG therefore become complementary experimental
instruments.

------------------------------------------------------------------------

# 11. Multiple perspectives are a requirement, not a UI feature

The same process can legitimately be navigated by:

-   Centre of Competence;
-   capability;
-   business unit;
-   programme;
-   standard;
-   process domain;
-   lifecycle;
-   collaboration;
-   application landscape;
-   automation level.

Therefore:

> **The position of an object in a tree is not an intrinsic property of
> the object. It is a projection constructed from classifications,
> relationships and the active viewpoint.**

``` text
semantic landscape
     +
projection profile
     ↓
stakeholder view
```

A CoC-centric view can support current process rationalization.

A capability-centric view can support group governance.

A standards-centric view can support compliance and impact analysis.

An application-centric view can support enactment and transformation.

The semantic landscape remains the same; the question changes.

------------------------------------------------------------------------

# 12. Standards: from catalogue to governed semantic landscape

Standards are often treated as documents that are selected, interpreted
and then disappear behind derived requirements.

That destroys valuable continuity.

``` text
STANDARD
   ↓ interpretedAs
ENTERPRISE OBLIGATION
   ↓ implementedBy
MODEL / PROCESS ELEMENT
   ↓ enactedAs
OPERATIONAL PRACTICE
   ↓ evidencedBy
EXECUTION EVIDENCE
```

The reverse path is equally important.

An auditor, architect or process owner should be able to start from an
operational practice and navigate back to its process intent, enterprise
interpretation and authoritative source.

Formal models contained in standards should remain first-class source
representations where possible.

They should not be flattened irreversibly into prose simply because
another repository uses a different modeling language.

------------------------------------------------------------------------

# 13. AI: a separate exploratory brick

AI deserves a place in this vision --- but not as the semantic authority
at its center.

Large language models, embeddings, knowledge graphs, GraphRAG and AI
agents can provide extraordinary assistance for:

-   discovering candidate correspondences;
-   extracting structures from documents;
-   navigating large heterogeneous repositories;
-   proposing classifications;
-   detecting inconsistencies;
-   explaining alternative viewpoints;
-   supporting mapping and transposition;
-   helping humans investigate unfamiliar semantic territories.

But they also amplify old interoperability fallacies.

Examples include:

-   fluent output is mistaken for understanding;
-   syntactic alignment is mistaken for semantic agreement;
-   an ontology is mistaken for the world it represents;
-   a knowledge graph is mistaken for shared knowledge;
-   probabilistic similarity is mistaken for equivalence;
-   canonicalization is mistaken for neutrality;
-   generated confidence is mistaken for institutional authority.

The AI research brick therefore asks a different question:

> **How can AI assist semantic navigation without being allowed to
> silently decide meaning?**

This is where *Inhabiting Babel: A Manifesto for Responsible Meaning
Engineering* provides the critical stance.

------------------------------------------------------------------------

# 14. Inhabiting Babel: responsible meaning engineering

The manifesto starts from a deliberately uncomfortable proposition:

**meaning is not something a machine simply stores, computes and
transfers between communities.**

Different communities construct legitimate but partial conceptual
worlds.

The objective of responsible interoperability is therefore not to
eliminate semantic plurality.

It is to work responsibly inside it.

``` text
UNIVERSALIZATION              CARTOGRAPHY
one truth                     multiple viewpoints
one ontology                  explicit conceptualizations
hidden translation            accountable mediation
semantic collapse             preserved boundaries
machine confidence            human/institutional validation
```

Responsible Meaning Engineering asks us to expose:

-   assumptions;
-   boundaries;
-   translations;
-   losses;
-   uncertainties;
-   authorities;
-   responsibilities.

AI can participate in that work.

It should not make those dimensions disappear.

------------------------------------------------------------------------

# 15. The human dimension: Open People Factory

Interoperability is not only a property of models and systems.

It depends on people able to work across disciplines.

The **Open People Factory manifesto**, to which I contributed
substantially, starts from a practical observation: the complexity,
variety and pace of information technologies have reached a level at
which no individual expert can master all technologies and practices
required to build coherent, sustainable complex systems.

Its response emphasizes complementary expertise and three "meta"
spheres:

``` text
EA  — Enterprise Architecture
KM  — Knowledge Management
MD  — Management of Data
```

This human and organizational perspective complements the technical
vision.

Semantic mediation requires people capable of recognizing boundaries
between disciplines, questioning assumptions, integrating expertise and
retaining responsibility for decisions.

The ambition is therefore not autonomous technology replacing expertise.

It is **augmented collective intelligence capable of governing
complexity**.

------------------------------------------------------------------------

# 16. One vision, several mutually reinforcing layers

``` text
                    INTEROPERABILITY OF MEANING
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
      GOVERNANCE           CARTOGRAPHY          OPERATIONS
          │                    │                    │
 standards strategy      hypermodels &         end-to-end
 ASD SSG / radar         semantic mapping      collaboration
          │                    │                    │
          └────────────────────┼────────────────────┘
                               │
                    MODELING VIEWPOINTS
                               │
        ┌──────────┬───────────┼───────────┬──────────┐
        │          │           │           │          │
      BPMN      ArchiMate     OWL       UML       SysML
        │          │
      BPMNSM     ArchiCG
        └──────────┴──────── semantic mediation ──────┘
                               │
                    ENACTMENT & EXECUTION
                               │
                 Continuous Operational
                     Interoperability
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
          RESPONSIBLE AI              HUMAN CAPABILITY
       fallacies / assistance       Open People Factory
                 │                           │
                 └─────────────┬─────────────┘
                               │
                      INHABITING BABEL
                 Responsible Meaning Engineering
```

This is not a product architecture.

It is a **research, engineering and governance landscape**.

Each brick can evolve independently while contributing evidence to the
same thesis.

------------------------------------------------------------------------

# 17. Enterprise value

## Faster ecosystem integration

New partners can be connected through explicit contracts, mappings and
governed standards without forcing immediate infrastructure convergence.

## Lower cost of change

Semantic dependencies become navigable, improving impact analysis when
standards, organizations, applications or programmes evolve.

## Better standards investment

Standards become an architectural portfolio rather than a catalogue,
allowing organizations to identify overlap, gaps, maturity and strategic
relevance.

## Stronger digital continuity

Relationships between source requirements, models, process intent,
enactment and execution remain visible across lifecycle transitions.

## Safer automation

Automation is connected to governed process intent and enterprise
context rather than becoming an isolated technical implementation.

## More sovereign collaboration

Organizations can interoperate while retaining control of private
models, systems and responsibilities.

## More credible AI adoption

AI assists discovery and navigation while semantic authority remains
explicit and accountable.

## Better use of expertise

Cross-disciplinary teams gain maps and mediation mechanisms instead of
being forced into a false universal vocabulary.

------------------------------------------------------------------------

# 18. What BPMNSM should prove

BPMNSM has a deliberately bounded mission inside this landscape.

It should make the **process interoperability** part testable.

It can demonstrate:

1.  non-destructive BPMN import and round-trip;
2.  fragmented repository aggregation;
3.  progressive resolution of references;
4.  public/private/collaboration distinctions;
5.  multiple classifications of the same process;
6.  CoC-centric navigation as a first projection;
7.  future capability-, programme- and standards-centric projections;
8.  generic → tailored → enacted → executable relationships;
9.  traceability from external references to BPMN elements;
10. process-to-Enterprise-Architecture mediation;
11. BPMN ↔ ArchiMate/ArchiCG experimental transposition;
12. explicit provenance and semantic loss during transformation.

Its purpose is not to become the universal repository.

> **BPMNSM is the BPMN laboratory of a broader interoperability
> vision.**

------------------------------------------------------------------------

# 19. What ArchiCG should explore

ArchiCG occupies a complementary position.

Its graph-oriented architecture can explore:

-   semantic cartographies;
-   ArchiMate-based Enterprise Architecture;
-   compound and multi-perspective representations;
-   cross-model navigation;
-   relationships between standards, capabilities, organizations and
    applications;
-   polyglot hypermodels;
-   BPMN and other model representations as connected semantic grounds.

Where BPMNSM goes deep into BPMN semantics, ArchiCG can explore the
broader semantic landscape.

Their relationship is itself an interoperability experiment.

------------------------------------------------------------------------

# 20. A research agenda

The combined initiatives suggest a pragmatic research programme.

### 1 --- Preserve

Keep native models, identities, provenance and unknown information.

### 2 --- Characterize

Make viewpoints, semantics, assumptions and authorities explicit.

### 3 --- Map

Build semantic cartographies across heterogeneous representations.

### 4 --- Project

Generate stakeholder-specific views without changing the underlying
semantic landscape.

### 5 --- Transpose

Move representations between appropriate modeling grounds with explicit
transformation semantics.

### 6 --- Enact

Bind generic models to organizations, applications, information and
controls.

### 7 --- Operate

Support end-to-end collaboration across autonomous enterprises.

### 8 --- Observe

Detect divergence between intent, models and operational reality.

### 9 --- Adapt

Maintain interoperability continuously as ecosystems change.

### 10 --- Assist responsibly

Use AI to accelerate exploration while preserving human and
institutional responsibility for meaning.

------------------------------------------------------------------------

# 21. Strategic thesis

The vision can be summarized in three propositions.

### Interoperability is continuous

It is not achieved once. It must survive evolution.

### Meaning is plural

Different disciplines and organizations legitimately construct different
representations.

### Mediation must be governed

Mappings, transformations and AI-generated interpretations are decisions
with context, assumptions and responsibility.

Together:

> **Continuous Operational Interoperability requires more than connected
> systems. It requires a governed ability to navigate, relate and
> operationalize multiple representations of meaning across the complete
> lifecycle of networked enterprises.**

------------------------------------------------------------------------

# 22. Positioning

**Semantic Cartography** provides the map.

**Polyglot Hypermodels** connect representations.

**Standards governance** provides durable architectural anchors.

**ArchiCG** explores the Enterprise Architecture and semantic-graph
landscape.

**BPMNSM** explores the BPMN process landscape.

**OWL, UML and SysML** contribute additional semantic grounds.

**AI** assists navigation and mediation --- under explicit epistemic and
governance constraints.

**Open People Factory** recalls that sustainable complexity management
remains a collective human capability.

**Inhabiting Babel** provides the responsible meaning-engineering stance
that prevents the entire architecture from turning semantic diversity
into a false promise of universal understanding.

And **Continuous Operational Interoperability** is the operational
destination.

------------------------------------------------------------------------

# 23. One-line vision

> **Build networked enterprises that can continuously collaborate across
> changing organizations, standards, models and technologies by making
> semantic plurality navigable, mediation explicit, and meaning
> accountable.**

------------------------------------------------------------------------

# Reference anchors

These sources anchor parts of the trajectory; the integrated vision
above is a synthesis rather than a claim that any single source
prescribes it.

-   Nicolas Figay, *Interoperability of Technical Enterprise
    Applications* --- PhD research on interoperability in evolving
    digital enterprise ecosystems.
-   Nicolas Figay, *Continuous Operational Interoperability* --- HDR
    research framing interoperability as a capability prepared, built
    and maintained over time.
-   Semantic Cartography and Polyglot Hypermodels --- exploration of
    navigation and transposition across heterogeneous modeling grounds.
-   ArchiCG --- experimental semantic-cartography and Enterprise
    Architecture platform.
-   *Inhabiting Babel: A Manifesto for Responsible Meaning Engineering*
    --- critical framework for semantic plurality, AI, ontologies and
    responsible mediation.
-   Open People Factory, *Notre MIEL : Manifesto* --- multidisciplinary
    human capability around Enterprise Architecture, Knowledge
    Management and Management of Data.
-   OMG BPMN --- behavioral process modeling and collaboration.
-   The Open Group ArchiMate --- Enterprise Architecture modeling.
-   W3C OWL --- ontology representation.
-   OMG UML and SysML --- software/general-purpose and
    systems-engineering modeling.
