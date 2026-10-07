# EA-PRE-01-LANES-AND-NOTES-001

Reference experimental case for the explicit **Import BPMN EA v16** path. The case preserves the raw EA 16.1.1628 BPMN 2.0 export and matching XMI 2.5.1 export.

`evidence/model.svg` is documentary evidence of the source diagram. It is not used to reconstruct the model. `evidence/bpmn-io-import-diagnostics.txt` preserves the independent bpmn.io import diagnostics verbatim.

The XMI distinguishes a BPMN 2.0 TextAnnotation (`EAID_58638261...`) from a native UML/EA Note (`EAID_1650C289...`). Both are linked to Activity D, respectively by a BPMN Association and an EA NoteLink. The native EA BPMN export omits the semantic TextAnnotation while retaining its Association and BPMNDI shape; it also emits BPMNDI for the native Note although that Note has no BPMN semantic element.

This case has one BPMNPlane. The earlier Starter Process case remains the evidence case for the independent multiple-BPMNPlane anomaly.
