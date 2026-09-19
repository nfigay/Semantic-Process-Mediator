# Semantic Process Mediator (BPMNSM)

BPMNSM is an experimental BPMN-based workbench for connecting process models, semantic business information, contextual views and publication/runtime concerns without collapsing those concerns into a single metamodel.

The project is developed by **evidence-driven experiments**. A capability is not treated as acquired merely because code exists: the project states the property being investigated, identifies the evidence needed, makes the smallest justified change, runs focused proof and regression, and records the limits of what was demonstrated.

## Why this repository exists

BPMNSM explores how BPMN can remain the behavioral pivot while business semantics, contextualization, multiple representations and repository-level information are introduced only when experiments show they are needed.

The current Business Object model deliberately separates canonical business identity from BPMN representation:

```text
BusinessObject
    id
    typeRefs[] 1..n

BusinessObjectRepresentation
    businessObjectId
    representationId
```

The experimental register is the authority for what has and has not been demonstrated.

## Current experimental focus

Experiments E11, E12 and E13 establish, within their documented limits, multiple representations of one canonical Business Object, contextual inspection of a Business Object with no BPMN representation, and XML round-trip persistence of a zero-representation Business Object.

The next open experiment is **E14 — Enrichissement d'une relation BPMN**:

> Can a native BPMN relation carry contextualized business semantics when its BPMN semantics are appropriate?

Status: **[NON IMPLÉMENTÉ]**.

See the [Business Model experimental register](public/plans/BPMNSM_BUSINESS_MODEL_EXPERIMENTAL_TARGET.md) for the exact question, evidence sought, results and historical checkpoints.

## How the project works

BPMNSM uses the project method named **Développement Expérimental Piloté par la Preuve (DEPP)** / **Evidence-Driven Experimental Development (EDED)**.

```text
Need / Requirement
       ↓
Claim + Context
       ↓
Experiment E<n>
       ↓
Evidence
       ↓
Limit
       ↓
Demonstrated status
```

The method is documented in:

- [DEPP/EDED protocol](public/plans/BPMNSM_EVIDENCE_DRIVEN_EXPERIMENTAL_DEVELOPMENT_PROTOCOL.md) — normative working protocol, evidence rules, V&V and experimental Definition of Done;
- [DEPP/EDED guide](public/plans/BPMNSM_EVIDENCE_DRIVEN_EXPERIMENTAL_DEVELOPMENT_GUIDE.md) — explanation and relationship with Requirements, User Stories, TDD/BDD, Agile, Systems Engineering, DevOps and monitoring;
- [Business Model experimental register](public/plans/BPMNSM_BUSINESS_MODEL_EXPERIMENTAL_TARGET.md) — concrete experiments and demonstrated results;
- [continuity package index](public/plans/README.md) — deeper project context and reading order.

The project uses only these experimental status labels:

- **[NON IMPLÉMENTÉ]**
- **[DÉMONTRÉ PAR INSPECTION]**
- **[IMPLÉMENTÉ + DÉMONTRÉ]**

A status is a consequence of evidence in a defined context, not an assessment of how much code has been written.

## Evidence and tests

The repository uses Vitest. The normal regression command is:

```bash
npm test -- --run
```

The complete distributable build is:

```bash
npm run build
```

GitHub Actions runs the regression suite and build for pushes and pull requests. A green workflow is build-time evidence; it does not by itself validate stakeholder value or extend an experiment beyond its documented Claim, Context and Limit.

## Contributing

Start with [CONTRIBUTING.md](CONTRIBUTING.md). New architectural or product-boundary work should normally be framed as an experiment rather than as a solution-first implementation request.

The repository provides:

- an **Experiment** issue template for Question → Claim → Evidence sought;
- a pull-request template connecting implementation to the experiment and its evidence;
- CI that exposes regression and build results directly in GitHub.

This GitHub surface is a collaborative view of the project. The repository documents remain the durable source for architecture, experimental results and evidence.

## License

MIT. See [package.json](package.json) for package metadata.

## Continuity checkpoint — 2026-09-19

Before the next Business Model experiment, the current consolidated baseline is being turned into a reproducible GitHub/CI checkpoint. The local `HEAD + index91` candidate is demonstrated; its consolidated commit, publication and first GitHub Actions execution are not yet implemented.

The operational target now explicitly separates the BPMNSM deployment from the Git-versioned resource repository it opens:

```text
BPMNSM deployment × resource repository × repository revision
```

The future publication target includes retained releases, `latest`, development previews and optional tailored distributions. These multi-version capabilities are not yet implemented. See `public/plans/HANDOVER_BPMNSM_2026-09-19.md` and `public/plans/BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md` for the exact checkpoint and limits.
