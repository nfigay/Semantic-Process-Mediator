# Strategic Standards Radar

## From Static Consensus Charts to Semantic Standards Governance

**The Strategic Standards Radar is the standards-governance laboratory
within the broader *Interoperability of Meaning* vision.**

It explores a practical proposition:

> **Interoperability starts before systems are connected: communities
> must first agree on the standards that will shape their shared digital
> environment, keep that consensus visible, and maintain it as
> standards, organizations and technologies evolve.**

The radar is therefore not merely a visualization component and not a
technology-maturity chart.

It is an experimental instrument for **strategic standards governance**.

------------------------------------------------------------------------

# 1. Why strategic standards governance exists

Digital business ecosystems depend on many standards at once.

Before organizations implement standards-based product-data exchange,
deploy applications, or enact cross-organizational collaboration
processes, they need a coherent view of which standards matter and how
the community intends to engage with them.

Without that governance, ecosystems accumulate:

-   overlapping standards;
-   competing implementation choices;
-   local conventions;
-   obsolete specifications;
-   duplicated initiatives;
-   incompatible interpretations;
-   isolated technology decisions.

The result may be technically connected systems but strategically
fragmented interoperability.

The governance question comes first:

> **Which standards should this community rely on, monitor, develop or
> actively influence --- and how should that decision evolve?**

------------------------------------------------------------------------

# 2. The ASD SSG governance heritage

The Strategic Standards Radar is rooted in standards-governance practice
within the **ASD Strategic Standardization Group (ASD SSG)** for
Aeronautics, Space and Defence.

The radar provides a compact representation of community consensus.

It combines two independent dimensions.

## Adoption / governance rings

``` text
TRACKED
   ↓
CANDIDATE
   ↓
ADOPTED
```

These rings represent the governance status of a standard in the
community.

## Strategic relationship quadrants

``` text
EXTERNAL AVAILABLE
standards ready to be used

MONITORED DEVELOPMENTS
external work that should be watched

LOCALLY DEVELOPED
standards developed for the community

ACTIVE PARTICIPATION
external standardization work the community actively influences
```

The important object is not the dot.

The important object is the **governance decision represented by the
dot**.

------------------------------------------------------------------------

# 3. A radar blip is a governance object

A useful semantic radar should eventually know more than:

``` text
label
quadrant
ring
```

The exploration identifies richer information around a standard:

``` text
Standard
│
├── visual position
│   ├── quadrant
│   └── ring
│
├── governance
│   ├── priority
│   ├── status
│   ├── study dates
│   ├── decision history
│   ├── responsible actors
│   └── allocated activities
│
├── rationale
│   └── concise justification document
│
├── standardization source
│   ├── standards body
│   └── published metadata
│
├── ecosystem alignment
│   ├── external organizations
│   └── cooperation / MoU context
│
└── enterprise context
    ├── internal standards
    ├── capabilities
    ├── applications
    ├── technologies
    └── processes
```

This is the transition from **charting** to **semantic governance**.

------------------------------------------------------------------------

# 4. From static charts to interactive governance

Historically, standards radars can be maintained with drawing tools or
PowerPoint.

That works while the landscape remains small.

It becomes difficult when standards, decisions and governance history
grow.

The StandardisationRadarChart exploration therefore moves through a
series of increasingly semantic representations:

``` text
STATIC CHART
PowerPoint / drawing
       ↓
DATA-DRIVEN RADAR
dataset → HTML + SVG
       ↓
INTERACTIVE RADAR
navigation · inspection · publication
       ↓
GRAPH-BACKED RADAR
blips become semantic graph nodes
       ↓
SEMANTIC GOVERNANCE
standards · actors · decisions · architecture · processes
```

The objective is not to digitize PowerPoint.

It is to make standards governance navigable.

------------------------------------------------------------------------

# 5. The demonstrated HTML + SVG radar

The first demonstrator generates an interactive radar from an input
dataset.

Each standard is associated with a quadrant and a ring.

The visualization calculates its placement automatically and can be
published as an HTML + SVG page without requiring a dedicated
application server.

This demonstrates a useful separation:

``` text
governance data
      ↓
visual projection
      ↓
interactive radar
```

The visual position is derived from governance data rather than being
the only place where the governance information exists.

------------------------------------------------------------------------

# 6. The graph-backed prototype

A later prototype explores replacing SVG-circle blips with graph nodes
rendered using technologies also explored in ArchiCG.

This changes the architectural potential.

``` text
SVG blip
   │
   │ becomes
   ▼
semantic graph node
   │
   ├── properties
   ├── relationships
   ├── provenance
   ├── governance history
   └── enterprise context
```

Automatic placement can still position nodes according to quadrant and
ring.

Users can refine relative placement when automatic layout creates
overlap or poor visual organization, while the governance constraints
remain authoritative: moving a node should not silently change its ring
or quadrant.

The refined placement can then be saved and reused.

------------------------------------------------------------------------

# 7. The radar is a projection, not the repository

This leads to the same architectural principle found in ArchiCG and
BPMNSM:

> **The visual position is a projection of governed semantic
> information, not the semantic information itself.**

Conceptually:

``` text
Standards governance graph
          │
          ├── Radar projection
          ├── Table projection
          ├── Topic-specific radar
          ├── Organization-specific radar
          └── Enterprise-context projection
```

A standard can appear in several useful projections without becoming
several standards.

This makes it possible to move from one global radar toward contextual
radars generated for specific topics, communities or enterprise
concerns.

------------------------------------------------------------------------

# 8. Strategic Standards Radar ↔ ArchiCG

The relationship with ArchiCG is direct.

The radar answers:

> **Which standards should govern this ecosystem, and why?**

ArchiCG can help answer:

> **Where do those standards apply in the enterprise and digital
> ecosystem?**

``` text
Strategic Standards Radar
        │
        │ standards choices
        ▼
Semantic Cartography / ArchiCG
        │
        ├── strategy
        ├── capabilities
        ├── organizations
        ├── applications
        ├── information
        └── technologies
```

The radar becomes one analytical projection over a broader semantic
cartography.

ArchiMate can provide useful enterprise concepts for contextualizing
standards, but the standard itself should not be reduced to an ArchiMate
element merely for convenience.

The semantic ground of the standards-governance representation remains
explicit.

------------------------------------------------------------------------

# 9. Strategic Standards Radar ↔ BPMNSM

The relationship with BPMNSM extends the governance chain toward
behavior and operations.

``` text
Strategic standard
       ↓
enterprise interpretation
       ↓
architectural applicability
       ↓
process obligation
       ↓
BPMN process / collaboration
       ↓
enactment
       ↓
operational practice
```

The radar can therefore answer **what the community has elected** while
BPMNSM can explore **how those choices are reflected in process
governance, collaboration and enactment**.

This is particularly important for standards whose value only becomes
visible when organizations actually collaborate.

------------------------------------------------------------------------

# 10. The three experimental instruments

The three current instruments have distinct questions.

``` text
STRATEGIC STANDARDS RADAR
Which standards should govern the ecosystem?
Why were they selected?
How is the consensus evolving?

              ↓ contextualize

ARCHICG
Where do those standards apply?
Which capabilities, organizations, applications
and technologies are concerned?

              ↓ operationalize

BPMNSM
How are those choices reflected in processes,
collaborations, enactment and operations?
```

They should not be merged into one universal repository.

Their value comes from their complementary viewpoints and explicit
semantic mediation.

------------------------------------------------------------------------

# 11. Standards governance and networked enterprises

Standards governance is especially important in networked enterprises.

No single participant controls the entire ecosystem.

A durable collaboration environment therefore depends on shared choices
that can survive:

-   partner changes;
-   technology refresh;
-   programme transitions;
-   supplier autonomy;
-   organizational restructuring;
-   standards evolution;
-   obsolescence.

A strategic radar makes the community's current consensus visible.

Semantic cartography can then expose what that consensus affects.

Operational instruments can show whether it is actually enacted.

------------------------------------------------------------------------

# 12. Contribution to Continuous Operational Interoperability

The radar occupies the upstream governance part of the continuous loop.

``` text
PREPARE
standards landscape
      ↓
GOVERN
community consensus
      ↓
CONTEXTUALIZE
enterprise architecture
      ↓
OPERATIONALIZE
processes & collaboration
      ↓
ENACT
applications & practices
      ↓
OPERATE
networked enterprise
      ↓
OBSERVE
change · divergence · obsolescence
      ↓
ADAPT
standards strategy
      ↺
```

This gives standards governance an operational purpose.

A standard is not strategically important because it has a dot on a
radar.

It is important because choices about standards influence the future
ability of organizations and systems to collaborate at an acceptable
cost.

------------------------------------------------------------------------

# 13. Demonstrated / documented foundations

The current exploration documents or demonstrates:

-   an ASD SSG radar governance grammar;
-   tracked / candidate / adopted rings;
-   strategic quadrants for external availability, monitoring, local
    development and active external participation;
-   generation of an HTML + SVG radar from an input dataset;
-   automatic positioning from quadrant and ring;
-   interactive web publication without a dedicated server;
-   a first graph-node prototype using ArchiCG rendering technology;
-   manual refinement of graph-node placement while preserving ring and
    quadrant constraints;
-   saving and reusing refined placement;
-   exploration of a W2UI-based interface;
-   exploration of richer standard-node metadata and forms.

These are not all at the same maturity level.

The public article explicitly presents several of them as demonstrators,
prototypes or next iterations.

------------------------------------------------------------------------

# 14. Research trajectory

The next questions are more ambitious:

``` text
static radar
    ↓
interactive radar
    ↓
semantic governance graph
    ↓
contextual radars
    ↓
enterprise semantic cartography
    ↓
standards impact analysis
    ↓
process & operational traceability
    ↓
Continuous Operational Interoperability
```

Research questions include:

-   How should standards, versions, profiles and implementation
    agreements be identified?
-   How should governance decisions and their history be represented?
-   How should community consensus differ from enterprise-specific
    adoption?
-   How should standards-body metadata remain connected to internal
    governance information?
-   How can standards be related to capabilities, applications,
    technologies and processes without flattening their semantics?
-   How should topic-specific or enterprise-specific radars be generated
    from one semantic graph?
-   How should obsolescence and standards evolution trigger impact
    analysis?
-   How can several governance communities merge or compare their
    standards landscapes?
-   How can AI assist standards discovery and comparison without
    becoming the authority that elects standards?

------------------------------------------------------------------------

# 15. Enterprise value

## Prevent fragmented standards adoption

Make community choices explicit before incompatible implementations
proliferate.

## Preserve governance rationale

Keep not only the selected standard but the history and reasoning behind
its position.

## Improve standards investment

Distinguish where the community should use, monitor, develop or actively
influence standards.

## Connect strategy to architecture

Expose which capabilities, organizations, applications and technologies
are affected.

## Connect architecture to operations

Trace standards choices toward processes, collaboration and enactment.

## Manage obsolescence

Make standards evolution part of continuous interoperability management.

## Support ecosystem consensus

Provide a shared visual and semantic entry point for
cross-organizational governance.

## Publish recommendations

Turn governance results into navigable assets rather than static
presentation slides.

------------------------------------------------------------------------

# 16. Position inside Interoperability of Meaning

``` text
INTEROPERABILITY OF MEANING
          │
          ├── Research foundations
          │   ├── interoperability
          │   ├── hypermodels
          │   └── semantic cartography
          │
          ├── Experimental instruments
          │   ├── Strategic Standards Radar
          │   │      standards governance
          │   ├── ArchiCG
          │   │      EA & semantic cartography
          │   └── BPMNSM
          │          process interoperability
          │
          ├── Responsible AI
          ├── Inhabiting Babel
          ├── Open People Factory
          │
          └── Continuous Operational Interoperability
```

The Strategic Standards Radar is therefore the **standards-governance
instrument** of the wider trajectory.

It makes collective standards choices visible and provides a path toward
connecting those choices to semantic cartography and operational
interoperability.

------------------------------------------------------------------------

# One-line positioning

> **The Strategic Standards Radar turns standards selection from a
> static chart into a navigable governance practice, connecting
> community consensus to enterprise context and the continuous
> interoperability of networked organizations.**

------------------------------------------------------------------------

# Public anchors

-   StandardisationRadarChart demonstrator:
    https://nfigay.github.io/StandardisationRadarChart/
-   StandardisationRadarChart source:
    https://github.com/nfigay/StandardisationRadarChart
-   "Strategic Governance of PLM Standards: From Static Charts to
    Dynamic Semantic Radars", Nicolas Figay, 16 March 2025:
    https://www.linkedin.com/pulse/strategic-governance-plm-standards-from-static-charts-nicolas-figay-npsae/
-   ASD SSG radar:
    http://www.asd-ssg.org/radar-chart%3Bjsessionid=4c2e289314c118c1f3e95482dd2f.html
