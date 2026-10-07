# OMG BPMN 2.0.2 normative machine-readable reference corpus

This directory is populated from the official OMG BPMN 2.0.2 machine-readable artifacts.
The files are test/reference inputs and MUST remain byte-for-byte copies of the downloaded OMG artifacts.

Authority page: https://www.omg.org/spec/BPMN/2.0.2
OMG file id for the 20100501 set: dtc/10-05-04.

Expected files:
- BPMN20.cmof
- BPMNDI.cmof
- DC.cmof
- DI.cmof
- BPMN20.xsd
- BPMNDI.xsd
- DC.xsd
- DI.xsd
- Semantic.xsd
- BPMN20-FromXMI.xslt
- Infrastructure.cmof (OMG BPMN/20100502, dtc/10-05-15)

Run `./fetch-omg-bpmn-2.0.2.sh` from this directory to fetch the authoritative bytes and regenerate SHA256SUMS.txt.
