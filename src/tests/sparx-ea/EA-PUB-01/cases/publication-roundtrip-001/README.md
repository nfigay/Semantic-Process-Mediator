# EA-PUB-01 — CASE publication-roundtrip-001

## Purpose

Controlled vertical experiment from Sparx Enterprise Architect to BPMNSM publication.

The BPMN 2.0 XML is the primary interchange source. Sparx EA XMI is an auxiliary
source used only to recover publication-relevant information that EA loses or
degrades in its BPMN export. XMI must not become the BPMNSM pivot and Publisher
or Viewer must not depend on XMI.

The acceptance oracle is the **published Hosted Viewer result**, not import success
or automated tests alone.

## Controlled baseline

`input/BPMNSM_CASE_01_EA_IMPORT_BASELINE.bpmn` contains:

- Collaboration `CoC CASE-01 — Publication Test`;
- two Participants/Pools backed by two Processes;
- Lanes `System Engineer` and `Quality Engineer`;
- Tasks, events, sequence flows and message flows;
- `PAF Deliverable` Data Object Reference and data association;
- a native BPMN Group + Category/CategoryValue;
- explicit BPMN `documentation` probes;
- `bioc` color probes on the two Tasks.

The Collaboration name is a controlled CoC-level test identity. It does **not**
establish that BPMN Collaboration is the final BPMNSM CoC metamodel mapping.

## Manual EA enrichment

After import, keep baseline names and contents unchanged.

1. Add an EA/UML Note associated with `Prepare Deliverable`:

   `CASE01-EA-NOTE: The deliverable shall be reviewed before approval.`

   Do not copy it into BPMN Documentation.

2. Add stereotype `CASE01_ProfiledActivity` to `Prepare Deliverable`, using the
   simplest normal EA mechanism available, then Tagged Values:

   - `CASE01_String = Alpha`
   - `CASE01_Code = KID-001`
   - `CASE01_Status = Draft`

3. On `PAF Deliverable`, add by the normal EA mechanism:

   - `CASE01_DocumentType = Plan`
   - `CASE01_KID = KID-PAF-001`
   - `CASE01_Lifecycle = Draft`

   If this is not naturally possible on the imported BPMN object, do not invent
   a workaround. That failure is evidence.

4. Record whether EA renders the incoming colors. Then change the fill color of
   `Prepare Deliverable` in EA to a clearly different color.

5. Record whether the incoming native BPMN Group is preserved/rendered. If it is
   not, leave it untouched and additionally create an EA-native BPMN Group named
   `CASE01-EA-GROUP` around `Review Deliverable`.

6. Keep the Lane names as role probes. Do not introduce a new role metamodel.

Do not develop an EA add-in, MDG or BPMNSM-specific EA profile for this case.

## Evidence to return

Place or archive the raw EA outputs under `evidence/` without hand-editing them:

- `BPMNSM_CASE_01_EA_REEXPORTED.bpmn`
- `BPMNSM_CASE_01_EA_REEXPORTED.xmi`
- one complete EA diagram screenshot

## Gate coverage

| Gate | CASE-01 probe | Coverage | Evidence sought |
|---|---|---|---|
| EA-PUB-01 | stable elements across baseline BPMN, EA BPMN and XMI | PRIMARY | deterministic BPMN ↔ XMI correlation |
| EA-PUB-02 | BPMN documentation vs separate EA/UML Note | PRIMARY | recover Note text/attachment without abusing a standard BPMN field |
| EA-PUB-03 | incoming native Group + optional EA-native Group | PRIMARY | preservation/transformation of Group and Category semantics |
| EA-PUB-04 | incoming `bioc` colors + EA-edited color | PRIMARY | locate presentation loss and reconstruct compatible BPMN presentation |
| EA-PUB-05 | `CASE01_ProfiledActivity` | PRIMARY | stereotype identity/storage and BPMN loss/preservation |
| EA-PUB-06 | CASE01 Tagged Values | PRIMARY | owner/value/type/profile recovery and BPMNSM property mapping |
| EA-PUB-07 | `PAF Deliverable` + relation | PARTIAL | preserve a referenced business object as an object/reference, not an extension blob |
| EA-PUB-08 | Collaboration + Pools + role Lanes + two Processes | PARTIAL | first evidence for CoC → roles → process navigation |
| EA-PUB-09 | DocumentType/KID/Lifecycle probes | PARTIAL | publishable document metadata; not yet a complete lifecycle/version model |
| EA-PUB-10 | entire enriched specimen | ACCEPTANCE | preprocessing → autonomous BPMN → import → Publisher → Hosted Viewer |

## Analysis record for each gate

For every EA-PUB gate record:

1. expected publication fact;
2. baseline BPMN evidence;
3. EA re-exported BPMN evidence;
4. EA XMI evidence;
5. BPMN ↔ XMI correlation mechanism;
6. preserved / transformed / degraded / lost;
7. target representation: native BPMN, interoperable/community extension,
   `semarch` extension, or autonomous business object/reference;
8. smallest generic preprocessing/import change;
9. serialization/round-trip evidence;
10. Publisher output;
11. Hosted Viewer product proof;
12. status: `GREEN | PARTIAL | RED | NOT EXERCISED`.

## Acceptance chain

A gate is not closed merely because preprocessing or tests pass.

`EA evidence → deterministic preprocessing → autonomous enriched BPMN → BPMNSM
import → canonical model/Properties resolution → Publisher/PublicationPackage →
Hosted Viewer → visible and semantically correct publication`

This case deliberately avoids pre-designing the final CoC, Repository, role,
document or profile mapping before the EA evidence exists.
