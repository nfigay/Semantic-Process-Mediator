# BPMNSM — EA import preprocessing target

## Status

Architecture target derived from EA-PRE-01 experimental evidence. Implementation remains evidence-driven: only experimentally characterized rules may become automatic normalization rules.

## Goal

Keep Sparx Enterprise Architect integration inside BPMNSM. Do not require a distributed external conversion toolchain.

BPMNSM shall be able to ingest an EA-produced BPMN document, detect known EA export anomalies, request supporting XMI only when necessary, or accept BPMN + XMI together in a dedicated EA import flow. The output of preprocessing is valid normalized BPMN plus persistent provenance and a normalization report.

## Import modes

### Standard BPMN import

1. Import BPMN XML.
2. Validate semantic references and BPMNDI references.
3. Detect signatures of characterized platform/export anomalies.
4. If a repair requires information lost from BPMN, request a supporting EA XMI export.
5. The XMI may target the model/package concerned or be a wider package export. It is temporary supporting evidence, not a second persistent BPMNSM model.
6. Correlate XMI and BPMN by preserved EA identities.
7. Normalize, validate again, persist provenance/report, then admit the model to BPMNSM.

### Assisted EA import

1. User selects EA import.
2. BPMNSM accepts the EA BPMN 2.0 XML and corresponding XMI export together.
3. Preprocessing compares both representations before admission.
4. Deterministic exporter losses may be repaired automatically and reported.
5. EA/UML constructs that require a publication policy are presented to the integrator.
6. The selected policy can be applied to the current import and may later become Publisher configuration.

This mode targets model integrators responsible for producing a correct Publisher output from EA repositories that may contain legacy or non-BPMN modeling practices.

## Notes policy

The source distinction must never be lost.

### EA BPMN TextAnnotation

When XMI proves that an object is `BPMN2.0::TextAnnotation` but the EA BPMN export omitted its semantic `bpmn:textAnnotation`, preprocessing may recover the missing BPMN semantic object using the XMI text and preserved EA identity. Existing valid Association/DI data should be reused where possible.

This is a repair of an EA BPMN export loss.

### Native UML/EA Note

A native Note is not silently treated as if it had originally been BPMN. If it is selected for publication, preprocessing may transpose:

- EA/UML Note -> BPMN TextAnnotation;
- EA NoteLink -> BPMN Association;
- source diagram geometry -> BPMNShape/BPMNEdge as required.

The resulting BPMN object must retain provenance identifying it as an EA/UML Note transformed for BPMN publication, including the source EA identity/GUID when available.

The integrator may instead exclude such a Note from the published BPMN. Invalid DI left by the EA exporter must then be removed.

## Provenance

Persistent provenance must distinguish at least:

- source platform;
- source representation/type;
- source EA identity/GUID;
- normalization operation;
- original-vs-transposed BPMN status.

This permits the BPMNSM UI to expose, when an annotation is selected, whether it originated as a BPMN TextAnnotation or as a transformed UML/EA Note and to provide the EA identity needed to locate the source object.

The XMI itself may remain temporary; the provenance and normalization report survive.

## Current EA-PRE-01 evidence

Fixture `EA-PRE-01-STARTER-NOTES-001` establishes two distinct source Notes:

- BPMN TextAnnotation `EAID_F5A78000_FE83_41f1_B2E8_32134E6AA6BE` with BPMN Association;
- native UML/EA Note `EAID_C26CDC3B_2F87_45d7_AB18_3BECA82DED8A` with EA NoteLink.

The native EA BPMN export omits the semantic TextAnnotation but keeps references to its EAID. It also emits a BPMNShape for the native Note although no corresponding BPMN semantic element exists.

A separate DI anomaly is present: two BPMNPlane elements both reference Process A (`EAID_9100BB20_5933_4e66_9830_D4DA02D46A0B`). This must be resolved before the first normalization path can be considered complete.

## Implementation boundary for the first increment

The first implementation increment is diagnostic only:

- consume the two raw experimental fixtures;
- distinguish BPMN TextAnnotation from native Note in XMI;
- detect unresolved Association references;
- detect dangling BPMNDI references;
- detect multiple BPMNPlane references to the same BPMN element;
- request supporting XMI for a BPMN-only import when repair evidence is required.

It must not yet mutate the BPMN document. Mutation follows only after tests define the expected normalized output for both Notes and the duplicate-plane anomaly.
