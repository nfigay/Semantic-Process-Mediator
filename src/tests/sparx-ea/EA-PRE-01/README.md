# EA-PRE-01 — Sparx EA BPMN interchange evidence

This directory contains reproducible evidence cases for the Sparx Enterprise Architect BPMN interoperability front.

Principles:

- `input/` contains raw artifacts produced by EA. Do not normalize or repair them in place.
- `case.json` records provenance and binds a case to its exact inputs.
- `expected/assertions.json` records the atomic questions/assertions to be established from evidence.
- automated tests must consume these case artifacts directly; do not duplicate them into another fixtures directory.
- derived/repaired BPMN is not an input and must be stored separately when such an experiment exists.
- a conclusion applies only to the EA version/build, case and artifacts for which evidence was collected.

## First case

`grouping-association-001` is intentionally created before its source artifacts are available. Its first raw input will be an XMI export of the EA model. The native BPMN export of the same model will be added to the same case afterwards.

The initial goal is characterization, not correction: establish what EA serializes in XMI, what it serializes in BPMN, and where the first observable divergence occurs.
