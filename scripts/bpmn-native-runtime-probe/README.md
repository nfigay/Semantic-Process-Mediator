# BPMN native properties runtime evidence

This probe observes the installed `bpmn-js-properties-panel`
through the real BPMNSM `createModeler()` wiring.

It exists because static source inspection is not sufficient to
determine native BPMN property-panel support.

## Evidence layers

The BPMN native property inventory and the runtime provider evidence
must remain separate.

### Descriptor evidence

`bpmn-moddle` is authoritative for:

- BPMN types;
- property owner;
- property name;
- property type;
- inheritance;
- multiplicity;
- reference semantics.

### Runtime context evidence

The runtime probe records:

- the diagram element used as Properties Panel context;
- its BPMN type;
- groups returned by `bpmnPropertiesProvider`;
- entry IDs returned by the provider;
- explicit semantic links from that context to referenced business
  objects.

An entry ID is not assumed to be a property of the selected context.

Examples proven by the runtime probe:

- `Participant` is a diagram context;
- `Participant.processRef` targets a `Process`;
- process-related entries may therefore be exposed while Participant
  is selected;

and:

- `DataObjectReference.dataObjectRef` targets `DataObject`;
- `DataStoreReference.dataStoreRef` targets `DataStore`;
- those semantic references exist even when no corresponding official
  Properties Panel entry is exposed.

## Support states

Do not infer `SUPPORTED` from static source tokens.

Use evidence states independently:

- `DESCRIPTOR_DEFINED`
- `STATIC_TYPE_ONLY`
- `STATIC_PROPERTY_ONLY`
- `STATIC_TYPE_AND_PROPERTY`
- `RUNTIME_ENTRY_EXPOSED`
- `RUNTIME_SEMANTIC_LINK_OBSERVED`
- `MUTATION_TARGET_PROVEN`

`SUPPORTED` may only be derived when the required evidence threshold
has been explicitly defined and demonstrated.

Absence of evidence is not proof of unsupported behavior.

## Running

Start the Vite development server explicitly:

    npx vite scripts/bpmn-native-runtime-probe --host 127.0.0.1

Then inspect:

    window.__BPMNSM_BPMN_NATIVE_PROBE__

The server is intentionally interactive and must be stopped manually
with Ctrl-C.
