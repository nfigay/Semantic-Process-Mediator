# BPMN-PROP-002 — Integration baseline

This patch **replaces the standalone 15R properties provider registration** with a common standard-properties provider. It retains the exact 15R condition editor and keeps the condition renderer unchanged. The common provider has a registry for additional standard entries, plus descriptor-driven inheritance helpers.

## Scope and limits

- No native bpmn.io entry is replaced, so no existing native label has been altered yet. `inheritedPropertyLabel()` and `effectivePropertyOrigins()` expose inheritance metadata in bulk, but integrating that metadata into labels rendered *inside* native entry components still requires a safe native-component adapter.
- The patch does **not** implement generic editing of all 318 properties. References, collections and complex types require semantic-safe editors and persistence tests.
- This is an integration foundation, **not** full BPMN-PROP-002 acceptance.

## Installation

From the repository root: `unzip -n ~/Downloads/BPMNSM_PROP_002_PATCH_01.zip -d .`

The patch includes a changed `src/bpmn/create-modeler.js` based on the uploaded local file. Back up this file first; verify `git diff` before installing, especially if it changed since the upload. Do not overwrite it blindly. The old `sequence-flow-condition-properties.js` remains on disk but is no longer imported by the modeler.

## Tests

`node --test src/bpmn/bpmn-property-inheritance.test.mjs`
`npx vitest run`

Check in the UI that the Flow Condition group is present exactly once, edit a condition, save BPMN XML, reopen and verify its value and rendered label.
