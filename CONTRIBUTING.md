# Contributing to BPMNSM

BPMNSM is developed through small, evidence-driven experiments. Contributions should make the motivation, uncertainty and proof visible, not only the resulting diff.

The normative method is [DEPP/EDED](public/plans/BPMNSM_EVIDENCE_DRIVEN_EXPERIMENTAL_DEVELOPMENT_PROTOCOL.md). This file is a GitHub-oriented entry point and does not duplicate or replace that protocol.

## Before proposing a solution

Read the relevant experimental register and inspect the real repository state. Determine whether the mechanism already exists before adding production code. An experiment may legitimately conclude with a test, an inspection result or a clarification rather than a new abstraction.

For architectural or product-boundary work, open an **Experiment** issue and capture:

```text
Motivation / Requirement
Question
Claim
Context
Evidence sought
Limit
```

Do not invent requirement identifiers when no authoritative requirement identifier exists.

## Working loop

Use the smallest loop that can establish the property under investigation:

```text
inspect real system
      ↓
existing mechanism?
   ↙       ↘
 yes       no
  ↓         ↓
missing    minimal
proof      implementation
   ↘       ↙
 focused evidence
      ↓
 regression
      ↓
 evidence + limit
      ↓
 register / knowledge
```

Do not introduce a persistent model, generic abstraction or repository concept merely for conceptual symmetry. Introduce it when an observable experiment requires it.

## Tests and build

Run focused tests for the property being changed, then the global regression suite when applicable:

```bash
npm test -- --run <focused-test-files>
npm test -- --run
```

The complete build is:

```bash
npm run build
```

Before considering a change ready, also check the relevant Git diff for whitespace errors.

GitHub Actions provides shared build-time evidence for pull requests. CI success does not replace the experiment's Claim, Context, Evidence and Limit, and does not by itself constitute stakeholder validation.

## Pull requests

Use the pull-request template. A PR should make it possible for another contributor to answer:

- Which experiment or requirement motivates this change?
- What exact Claim is being tested or established?
- What is the smallest implementation change made?
- What focused evidence was obtained?
- What regression was run?
- What does the evidence explicitly not demonstrate?
- Was the experimental register updated when the evidence changed its status?

A PR can contain no production-code change if inspection and executable evidence establish that the required mechanism already exists.

## Experimental statuses

Use only the project status vocabulary:

- **[NON IMPLÉMENTÉ]**
- **[DÉMONTRÉ PAR INSPECTION]**
- **[IMPLÉMENTÉ + DÉMONTRÉ]**

Do not promote a status from intention, code volume or developer confidence. Promote it from documented evidence within a defined scope.

## Durable knowledge versus GitHub workflow

GitHub Issues and pull requests make active work discoverable and reviewable. They are not a second experimental register.

Durable architectural conclusions and experiment closure belong in the repository documents. GitHub Projects may later provide a derived operational view of active experiments; it should not become an independent source of truth.
