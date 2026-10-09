import { describe, it, expect } from "vitest"
import { BpmnModdle } from "bpmn-moddle"
import { propertyCoverage } from "./bpmn-standard-coverage.js"
import { collectScalarProperties } from "./bpmn-standard-scalar.js"

describe("PROP-008A real BPMN descriptors", () => {
  it("classifies scalar properties using the installed BPMN moddle", () => {
    const moddle = new BpmnModdle()
    const expected = {
      "bpmn:Process": ["isClosed", "isExecutable"],
      "bpmn:Task": ["isForCompensation", "startQuantity", "completionQuantity"],
      "bpmn:SubProcess": ["isForCompensation", "startQuantity", "completionQuantity", "triggeredByEvent"],
      "bpmn:CallActivity": ["isForCompensation", "startQuantity", "completionQuantity", "calledElement"],
      "bpmn:SequenceFlow": ["isImmediate"],
      "bpmn:Property": [],
      "bpmn:DataInput": ["isCollection"],
      "bpmn:DataOutput": ["isCollection"]
    }
    for (const [type, names] of Object.entries(expected)) {
      const rows = propertyCoverage(moddle, type, [], collectScalarProperties)
      expect(rows.map(row => row.property.name), type).toEqual(names)
      expect(rows.every(row => row.status === "GENERATED"), type).toBe(true)
    }
  })
})
